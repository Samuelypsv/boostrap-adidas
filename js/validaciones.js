/* ==========================================================================
   validaciones.js
   Reglas de validación del formulario. Son funciones "puras":
   reciben valores y devuelven el mensaje de error, o "" si todo está bien.
   No tocan el HTML, así que se pueden probar por separado.
   ========================================================================== */

/* ---------- Ayudas para limpiar los datos ---------- */

// Quita espacios al principio y al final, y deja un solo espacio entre palabras
function limpiarTexto(valor) {
  return String(valor ?? "").trim().replace(/\s+/g, " ");
}

// Quita todos los espacios y guiones (para DNI, IBAN, tarjeta, teléfono...)
function quitarEspacios(valor) {
  return String(valor ?? "").replace(/[\s-]/g, "");
}

function normalizarCorreo(valor) {
  return limpiarTexto(valor).toLowerCase();
}

// "+34 612 34 56 78" -> "612345678"
function normalizarTelefono(valor) {
  let tel = quitarEspacios(valor);
  if (tel.startsWith("+34")) tel = tel.slice(3);
  else if (tel.startsWith("0034")) tel = tel.slice(4);
  return tel;
}


/* ---------- Obligatoriedad y nombres ---------- */

function validarObligatorio(valor, nombreCampo) {
  if (limpiarTexto(valor) === "") return `Escribe ${nombreCampo}.`;
  return "";
}

// Letras (con tildes, ñ, ç...), espacios, apóstrofos y guiones. Ej: "María José", "O'Connor", "Ruiz-Pérez"
const PATRON_NOMBRE = /^[\p{L}\p{M}]+(?:[ '’-][\p{L}\p{M}]+)*$/u;

function validarNombre(valor, nombreCampo) {
  const texto = limpiarTexto(valor);
  if (texto === "") return `Escribe ${nombreCampo}.`;
  if (texto.length < 2) return `${mayuscula(nombreCampo)} debe tener al menos 2 letras.`;
  if (!PATRON_NOMBRE.test(texto)) {
    return `${mayuscula(nombreCampo)} solo puede llevar letras, espacios, apóstrofos o guiones.`;
  }
  return "";
}

function mayuscula(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}


/* ---------- Correo y teléfono ---------- */

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function validarCorreo(valor) {
  const correo = normalizarCorreo(valor);
  if (correo === "") return "Escribe tu correo electrónico.";
  if (!PATRON_CORREO.test(correo)) return "El correo no tiene un formato válido. Ejemplo: nombre@correo.es";
  return "";
}

function validarConfirmacionCorreo(valor, correoOriginal) {
  const confirmacion = normalizarCorreo(valor);
  if (confirmacion === "") return "Vuelve a escribir tu correo electrónico.";
  if (confirmacion !== normalizarCorreo(correoOriginal)) return "Los dos correos no coinciden.";
  return "";
}

function validarTelefono(valor) {
  if (limpiarTexto(valor) === "") return "Escribe tu teléfono.";
  const tel = normalizarTelefono(valor);
  if (!/^[6789]\d{8}$/.test(tel)) {
    return "El teléfono debe tener 9 cifras y empezar por 6, 7, 8 o 9 (puedes poner +34 delante).";
  }
  return "";
}


/* ---------- DNI ---------- */

const LETRAS_DNI = "TRWAGMYFPDXBNJZSQVHLCKE";

// La letra correcta es la que está en la posición (número % 23)
function letraDni(numero) {
  return LETRAS_DNI[Number(numero) % 23];
}

function validarDni(valor) {
  const dni = quitarEspacios(valor).toUpperCase();
  if (dni === "") return "Escribe tu DNI.";
  if (!/^\d{8}[A-Z]$/.test(dni)) return "El DNI debe tener 8 cifras y una letra. Ejemplo: 12345678Z";
  const numero = dni.slice(0, 8);
  const letra = dni.slice(8);
  if (letra !== letraDni(numero)) return "La letra del DNI no es correcta. Revisa el número y la letra.";
  return "";
}


/* ---------- Fecha de nacimiento ---------- */

// Convierte "AAAA-MM-DD" en {anio, mes, dia} solo si la fecha existe de verdad
function leerFecha(texto) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(limpiarTexto(texto));
  if (!partes) return null;
  const anio = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const fecha = new Date(anio, mes - 1, dia);
  // Si escribimos 31/02, Date lo pasa a marzo: así detectamos fechas que no existen
  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) return null;
  return { anio, mes, dia };
}

// Edad exacta: restamos años y quitamos uno si todavía no ha llegado el cumpleaños
function calcularEdad(nacimiento, hoy) {
  let edad = hoy.getFullYear() - nacimiento.anio;
  const mesHoy = hoy.getMonth() + 1;
  const diaHoy = hoy.getDate();
  if (mesHoy < nacimiento.mes || (mesHoy === nacimiento.mes && diaHoy < nacimiento.dia)) edad--;
  return edad;
}

function validarFechaNacimiento(valor, hoy = new Date()) {
  if (limpiarTexto(valor) === "") return "Indica tu fecha de nacimiento.";
  const nacimiento = leerFecha(valor);
  if (!nacimiento) return "La fecha no existe. Usa el formato día/mes/año.";
  const fechaNac = new Date(nacimiento.anio, nacimiento.mes - 1, nacimiento.dia);
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  if (fechaNac > hoySinHora) return "La fecha de nacimiento no puede estar en el futuro.";
  if (calcularEdad(nacimiento, hoy) < 18) return "Debes tener al menos 18 años para contratar.";
  return "";
}


/* ---------- Dirección ---------- */

function validarNumeroVia(valor) {
  const numero = limpiarTexto(valor).toUpperCase();
  if (numero === "") return "Escribe el número de la vía.";
  if (!/^(\d{1,4}[A-Z]?|S\/N)$/.test(numero)) return "Escribe un número (ej. 12 o 12B) o S/N si no tiene.";
  return "";
}

// codigoProvincia es el value del <select>: "01" ... "52"
function validarCodigoPostal(valor, codigoProvincia, nombreProvincia) {
  const cp = quitarEspacios(valor);
  if (cp === "") return "Escribe el código postal.";
  if (!/^\d{5}$/.test(cp)) return "El código postal debe tener 5 cifras.";
  const prefijo = Number(cp.slice(0, 2));
  if (prefijo < 1 || prefijo > 52) return "El código postal debe empezar por un número del 01 al 52.";
  if (codigoProvincia && cp.slice(0, 2) !== codigoProvincia) {
    return `Este código postal no es de ${nombreProvincia}. Los de esa provincia empiezan por ${codigoProvincia}.`;
  }
  return "";
}

function validarSeleccion(valor, mensaje) {
  return limpiarTexto(valor) === "" ? mensaje : "";
}


/* ---------- Producto y complementos ---------- */

function validarPlan(planId) {
  return planId ? "" : "Elige uno de los tres planes para continuar.";
}

// complementos: array de ids marcados. Regla: el envío exprés no se puede añadir al plan Pro (ya lo incluye)
function validarComplementos(planId, complementos) {
  if (planId === "pro" && complementos.includes("envio")) {
    return "El plan Pro ya incluye el envío exprés ilimitado. Quita este complemento o elige otro plan.";
  }
  return "";
}


/* ---------- IBAN (módulo 97) ---------- */

function ibanEsValido(iban) {
  // 1) Pasamos las 4 primeras letras/cifras al final
  const reordenado = iban.slice(4) + iban.slice(0, 4);
  // 2) Cambiamos cada letra por un número (A=10, B=11 ... Z=35)
  const numerico = reordenado.replace(/[A-Z]/g, letra => String(letra.charCodeAt(0) - 55));
  // 3) Calculamos el resto entre 97 poco a poco (el número es demasiado largo para JS)
  let resto = 0;
  for (const cifra of numerico) resto = (resto * 10 + Number(cifra)) % 97;
  return resto === 1;
}

function validarIban(valor) {
  const iban = quitarEspacios(valor).toUpperCase();
  if (iban === "") return "Escribe el IBAN de tu cuenta.";
  if (!/^ES\d{22}$/.test(iban)) return "El IBAN debe empezar por ES y tener 22 cifras después.";
  if (!ibanEsValido(iban)) return "El IBAN no es correcto: los dígitos de control no cuadran.";
  return "";
}


/* ---------- Tarjeta (Luhn, caducidad, CVV) ---------- */

// Algoritmo de Luhn: desde la derecha, doblamos una cifra sí y otra no
function luhnEsValido(numero) {
  let suma = 0;
  let doblar = false;
  for (let i = numero.length - 1; i >= 0; i--) {
    let cifra = Number(numero[i]);
    if (doblar) {
      cifra *= 2;
      if (cifra > 9) cifra -= 9;
    }
    suma += cifra;
    doblar = !doblar;
  }
  return suma % 10 === 0;
}

function validarNumeroTarjeta(valor) {
  const numero = quitarEspacios(valor);
  if (numero === "") return "Escribe el número de la tarjeta.";
  if (!/^\d{16}$/.test(numero)) return "El número de tarjeta debe tener 16 cifras.";
  if (!luhnEsValido(numero)) return "El número de tarjeta no es válido. Revisa que esté bien escrito.";
  return "";
}

function validarCaducidad(valor, hoy = new Date()) {
  const texto = quitarEspacios(valor);
  if (texto === "") return "Escribe la fecha de caducidad.";
  const partes = /^(\d{2})\/(\d{2})$/.exec(texto);
  if (!partes) return "Escribe la caducidad con el formato MM/AA. Ejemplo: 08/28";
  const mes = Number(partes[1]);
  const anio = 2000 + Number(partes[2]);
  if (mes < 1 || mes > 12) return "El mes de caducidad debe estar entre 01 y 12.";
  const anioHoy = hoy.getFullYear();
  const mesHoy = hoy.getMonth() + 1;
  if (anio < anioHoy || (anio === anioHoy && mes < mesHoy)) return "La tarjeta está caducada.";
  return "";
}

function validarCvv(valor) {
  const cvv = quitarEspacios(valor);
  if (cvv === "") return "Escribe el CVV.";
  if (!/^\d{3}$/.test(cvv)) return "El CVV son las 3 cifras de la parte de atrás de la tarjeta.";
  return "";
}


/* ---------- Casillas legales ---------- */

function validarCasilla(marcada, mensaje) {
  return marcada ? "" : mensaje;
}


/* Para poder probar estas funciones con Node (tests/validaciones.test.js).
   En el navegador "module" no existe y esta parte se ignora. */
if (typeof module !== "undefined") {
  module.exports = {
    limpiarTexto, quitarEspacios, normalizarCorreo, normalizarTelefono,
    validarObligatorio, validarNombre, validarCorreo, validarConfirmacionCorreo, validarTelefono,
    letraDni, validarDni, leerFecha, calcularEdad, validarFechaNacimiento,
    validarNumeroVia, validarCodigoPostal, validarSeleccion,
    validarPlan, validarComplementos,
    ibanEsValido, validarIban, luhnEsValido, validarNumeroTarjeta, validarCaducidad, validarCvv,
    validarCasilla
  };
}
