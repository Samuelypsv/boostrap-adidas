/* ==========================================================================
   formulario.js
   Estado, navegación entre pasos, resumen de precios, revisión y envío.
   Usa:  datos.js (catálogo) · validaciones.js (reglas) · errores.js (mensajes)
   ========================================================================== */

const formulario = document.getElementById("form-contratacion");
const TOTAL_PASOS = 6;
const NOMBRES_PASOS = ["Plan", "Complementos", "Datos personales", "Dirección", "Pago", "Revisión"];
const CLAVE_EXITO = "adidas-solicitud-registrada";   // la lee js/home.js

const estado = {
  pasoActual: 1,
  pasoMaximo: 1,              // paso más lejano al que se ha llegado validando
  editandoDesdeRevision: false
};


/* ==========================================================================
   1. LEER LOS VALORES DEL FORMULARIO
   ========================================================================== */

const $ = id => document.getElementById(id);
const valor = id => $(id).value;

function planElegido() {
  const radio = formulario.querySelector('input[name="plan"]:checked');
  return radio ? radio.value : "";
}

function complementosElegidos() {
  return [...formulario.querySelectorAll('input[name="complemento"]:checked')].map(c => c.value);
}

function metodoPago() {
  const radio = formulario.querySelector('input[name="metodo-pago"]:checked');
  return radio ? radio.value : "";
}

function nombreProvincia(codigo) {
  const provincia = PROVINCIAS.find(([cod]) => cod === codigo);
  return provincia ? provincia[1] : "";
}


/* ==========================================================================
   2. LISTA DE CAMPOS
   En el orden de los pasos y, dentro de cada paso, en el orden visual.
   Por eso el "primer error" siempre es el que aparece antes en pantalla.
   ========================================================================== */

// Campo normal: un solo <input> o <select>
function campoSimple(id, etiqueta, paso, validar, activo) {
  return {
    id, etiqueta, paso, validar,
    activo: activo || (() => true),
    elementos: () => [$(id)],
    foco: () => $(id)
  };
}

// Grupo de radios/checkbox: se marcan todos; el foco va al elegido o al primero
function campoGrupo(id, etiqueta, paso, nombre, validar, idFoco) {
  return {
    id, etiqueta, paso, validar,
    activo: () => true,
    elementos: () => [...formulario.querySelectorAll(`input[name="${nombre}"]`)],
    foco: () => (idFoco && $(idFoco)) ||
                formulario.querySelector(`input[name="${nombre}"]:checked`) ||
                formulario.querySelector(`input[name="${nombre}"]`)
  };
}

const esDomiciliacion = () => metodoPago() === "domiciliacion";
const esTarjeta = () => metodoPago() === "tarjeta";

const CAMPOS = [
  // Paso 1
  campoGrupo("plan", "Plan", 1, "plan", () => validarPlan(planElegido())),
  // Paso 2 (el foco va a "envío exprés", que es el que provoca la incompatibilidad)
  campoGrupo("complementos", "Complementos", 2, "complemento",
    () => validarComplementos(planElegido(), complementosElegidos()), "comp-envio"),
  // Paso 3
  campoSimple("nombre", "Nombre", 3, () => validarNombre(valor("nombre"), "tu nombre")),
  campoSimple("apellidos", "Apellidos", 3, () => validarNombre(valor("apellidos"), "tus apellidos")),
  campoSimple("dni", "DNI", 3, () => validarDni(valor("dni"))),
  campoSimple("nacimiento", "Fecha de nacimiento", 3, () => validarFechaNacimiento(valor("nacimiento"))),
  campoSimple("email", "Correo electrónico", 3, () => validarCorreo(valor("email"))),
  campoSimple("email2", "Repetir correo", 3, () => validarConfirmacionCorreo(valor("email2"), valor("email"))),
  campoSimple("telefono", "Teléfono", 3, () => validarTelefono(valor("telefono"))),
  // Paso 4
  campoSimple("tipo-via", "Tipo de vía", 4, () => validarSeleccion(valor("tipo-via"), "Elige el tipo de vía.")),
  campoSimple("nombre-via", "Nombre de la vía", 4, () => validarObligatorio(valor("nombre-via"), "el nombre de la vía")),
  campoSimple("numero", "Número", 4, () => validarNumeroVia(valor("numero"))),
  campoSimple("cp", "Código postal", 4,
    () => validarCodigoPostal(valor("cp"), valor("provincia"), nombreProvincia(valor("provincia")))),
  campoSimple("localidad", "Localidad", 4, () => validarObligatorio(valor("localidad"), "la localidad")),
  campoSimple("provincia", "Provincia", 4, () => validarSeleccion(valor("provincia"), "Elige la provincia.")),
  // Paso 5 (los campos de cada método solo cuentan si ese método está activo)
  campoGrupo("metodo-pago", "Método de pago", 5, "metodo-pago",
    () => validarSeleccion(metodoPago(), "Elige cómo quieres pagar.")),
  campoSimple("titular-cuenta", "Titular de la cuenta", 5,
    () => validarNombre(valor("titular-cuenta"), "el titular de la cuenta"), esDomiciliacion),
  campoSimple("iban", "IBAN", 5, () => validarIban(valor("iban")), esDomiciliacion),
  campoSimple("titular-tarjeta", "Titular de la tarjeta", 5,
    () => validarNombre(valor("titular-tarjeta"), "el titular de la tarjeta"), esTarjeta),
  campoSimple("numero-tarjeta", "Número de tarjeta", 5, () => validarNumeroTarjeta(valor("numero-tarjeta")), esTarjeta),
  campoSimple("caducidad", "Caducidad", 5, () => validarCaducidad(valor("caducidad")), esTarjeta),
  campoSimple("cvv", "CVV", 5, () => validarCvv(valor("cvv")), esTarjeta),
  // Paso 6
  campoSimple("acepto-condiciones", "Condiciones de contratación", 6,
    () => validarCasilla($("acepto-condiciones").checked, "Debes aceptar las condiciones de contratación.")),
  campoSimple("acepto-privacidad", "Política de privacidad", 6,
    () => validarCasilla($("acepto-privacidad").checked, "Debes aceptar la política de privacidad."))
  // "acepto-comunicaciones" es opcional: no está en la lista y no bloquea nada
];

function buscarCampo(elemento) {
  return CAMPOS.find(campo => campo.elementos().includes(elemento));
}


/* ==========================================================================
   3. VALIDAR
   ========================================================================== */

// Valida un paso, pinta sus errores y devuelve la lista [{campo, mensaje}]
function validarPaso(numeroPaso) {
  const errores = [];
  CAMPOS.filter(campo => campo.paso === numeroPaso).forEach(campo => {
    if (!campo.activo()) {          // método de pago no elegido: no cuenta
      limpiarError(campo);
      return;
    }
    const mensaje = campo.validar();
    if (mensaje) {
      mostrarError(campo, mensaje);
      errores.push({ campo, mensaje });
    } else {
      limpiarError(campo);
    }
  });
  return errores;
}

function validarPasos(desde, hasta) {
  let errores = [];
  for (let paso = desde; paso <= hasta; paso++) errores = errores.concat(validarPaso(paso));
  return errores;
}

// Abre el paso del campo, se desplaza hasta él y le pone el foco
function irAlCampo(campo) {
  mostrarPaso(campo.paso, { enfocarTitulo: false });
  const elemento = campo.foco();
  elemento.scrollIntoView({ behavior: "smooth", block: "center" });
  elemento.focus({ preventScroll: true });
}

function informarErrores(errores) {
  mostrarResumen(errores, irAlCampo);
  irAlCampo(errores[0].campo);
}


/* ==========================================================================
   4. NAVEGACIÓN ENTRE PASOS
   ========================================================================== */

function mostrarPaso(numero, { enfocarTitulo = true } = {}) {
  estado.pasoActual = numero;
  estado.pasoMaximo = Math.max(estado.pasoMaximo, numero);

  // Ocultar con "hidden" no borra lo escrito: los datos se conservan
  document.querySelectorAll(".paso").forEach(paso => {
    paso.hidden = Number(paso.dataset.paso) !== numero;
  });

  actualizarProgreso();
  actualizarBotones();
  if (numero === TOTAL_PASOS) pintarRevision();

  if (enfocarTitulo) {
    const titulo = document.querySelector(`#paso-${numero} .titulo-paso`);
    titulo.focus({ preventScroll: true });
    document.querySelector(".contratacion").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function actualizarProgreso() {
  const porcentaje = Math.round((estado.pasoActual / TOTAL_PASOS) * 100);
  const barra = $("barra-progreso");
  barra.setAttribute("aria-valuenow", porcentaje);
  barra.querySelector(".progress-bar").style.width = `${porcentaje}%`;
  $("texto-paso").textContent = `Paso ${estado.pasoActual} de ${TOTAL_PASOS} · ${NOMBRES_PASOS[estado.pasoActual - 1]}`;

  document.querySelectorAll(".paso-btn").forEach(boton => {
    const paso = Number(boton.dataset.ir);
    boton.classList.toggle("is-hecho", paso < estado.pasoActual);
    // No se puede ir a un paso al que todavía no se ha llegado
    boton.disabled = paso > estado.pasoMaximo;
    if (paso === estado.pasoActual) boton.setAttribute("aria-current", "step");
    else boton.removeAttribute("aria-current");
    boton.setAttribute("aria-label",
      `Paso ${paso}: ${NOMBRES_PASOS[paso - 1]}${paso === estado.pasoActual ? " (actual)" : paso < estado.pasoActual ? " (completado)" : ""}`);
  });
}

function actualizarBotones() {
  const enRevision = estado.pasoActual === TOTAL_PASOS;
  $("btn-anterior").hidden = estado.pasoActual === 1;
  $("btn-siguiente").hidden = enRevision;
  $("btn-confirmar").hidden = !enRevision;
  // Si ya se llegó a la revisión, se puede volver a ella directamente (validando lo de en medio)
  $("btn-volver-revision").hidden = enRevision || (estado.pasoMaximo < TOTAL_PASOS && !estado.editandoDesdeRevision);
}

function siguiente() {
  const errores = validarPaso(estado.pasoActual);
  if (errores.length > 0) {
    informarErrores(errores);
    return;
  }
  ocultarResumen();
  mostrarPaso(estado.pasoActual + 1);
}

// Volver atrás NO valida el paso que se abandona
function anterior() {
  ocultarResumen();
  mostrarPaso(estado.pasoActual - 1);
}

// Ir a un paso concreto (barra de pasos o "Volver a la revisión").
// Hacia atrás, libre. Hacia delante, hay que validar todos los pasos de en medio.
function irAPaso(destino) {
  if (destino <= estado.pasoActual) {
    ocultarResumen();
    mostrarPaso(destino);
    return;
  }
  const errores = validarPasos(estado.pasoActual, destino - 1);
  if (errores.length > 0) {
    informarErrores(errores);
    return;
  }
  ocultarResumen();
  mostrarPaso(destino);
}


/* ==========================================================================
   5. PRECIOS Y RESUMEN DEL PEDIDO
   Los pagos únicos y las cuotas mensuales se suman por separado.
   ========================================================================== */

function calcularTotales() {
  const plan = PLANES.find(p => p.id === planElegido());
  const complementos = COMPLEMENTOS.filter(c => complementosElegidos().includes(c.id));

  const pagoUnico = complementos.filter(c => c.tipo === "unico").reduce((suma, c) => suma + c.precio, 0);
  const cuotaMensual = (plan ? plan.precio : 0) +
    complementos.filter(c => c.tipo === "mensual").reduce((suma, c) => suma + c.precio, 0);

  return { plan, complementos, pagoUnico, cuotaMensual };
}

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function pintarResumenPedido() {
  const { plan, complementos, pagoUnico, cuotaMensual } = calcularTotales();
  const caja = $("resumen-pedido");

  if (!plan && complementos.length === 0) {
    caja.innerHTML = '<p class="text-muted mb-0">Todavía no has elegido ningún plan.</p>';
    return;
  }

  let lineas = "";
  if (plan) lineas += `<li><span>${plan.nombre}</span><span>${formatearPrecio(plan.precio)}/mes</span></li>`;
  complementos.forEach(c => {
    lineas += `<li><span>${c.nombre}</span><span>${formatearPrecio(c.precio)}${c.tipo === "mensual" ? "/mes" : ""}</span></li>`;
  });

  caja.innerHTML = `
    <ul class="list-unstyled resumen-lineas">${lineas}</ul>
    <dl class="resumen-totales mb-0">
      <div><dt>Pago único</dt><dd>${formatearPrecio(pagoUnico)}</dd></div>
      <div><dt>Cuota mensual</dt><dd>${formatearPrecio(cuotaMensual)}<small>/mes</small></dd></div>
    </dl>
    <p class="small text-muted mt-3 mb-0">El pago único se cobra una vez. La cuota mensual se repite cada mes hasta que te des de baja. IVA incluido.</p>`;
}

// Aviso en vivo cuando cambia el plan y choca con un complemento ya marcado
function comprobarIncompatibilidad() {
  const campoComplementos = CAMPOS.find(c => c.id === "complementos");
  const mensaje = campoComplementos.validar();
  const aviso = $("aviso-plan");

  if (mensaje) {
    aviso.innerHTML = '<i class="bi bi-exclamation-triangle" aria-hidden="true"></i> ' +
      "Tienes añadido el envío exprés, pero el plan Pro ya lo incluye. Tendrás que quitarlo en el paso 2.";
    aviso.hidden = false;
    // Si ya pasamos por el paso 2, marcamos el error allí también
    if (estado.pasoMaximo >= 2) mostrarError(campoComplementos, mensaje);
  } else {
    aviso.hidden = true;
    limpiarError(campoComplementos);
    actualizarEnResumen(campoComplementos, "");
  }
}


/* ==========================================================================
   6. PASO 6: REVISIÓN
   ========================================================================== */

function bloqueRevision(titulo, paso, contenido) {
  return `
    <section class="bloque-revision">
      <div class="d-flex justify-content-between align-items-baseline gap-3">
        <h3 class="h6 fw-bold text-uppercase mb-2">${titulo}</h3>
        <button type="button" class="link-adidas link-adidas--sm btn btn-link p-0" data-editar="${paso}">
          Editar<span class="visually-hidden"> ${titulo.toLowerCase()}</span>
        </button>
      </div>
      ${contenido}
    </section>`;
}

function enmascarar(texto, visibles = 4) {
  const limpio = quitarEspacios(texto);
  return "•••• " + limpio.slice(-visibles);
}

function pintarRevision() {
  const { plan, complementos, pagoUnico, cuotaMensual } = calcularTotales();
  const v = id => escapar(limpiarTexto(valor(id)));

  const textoComplementos = complementos.length
    ? `<ul class="mb-0">${complementos.map(c => `<li>${c.nombre}</li>`).join("")}</ul>`
    : '<p class="mb-0 text-muted">Sin complementos.</p>';

  const direccion = `${v("tipo-via")} ${v("nombre-via")}, ${v("numero")}${valor("piso").trim() ? ", " + v("piso") : ""}<br>
    ${escapar(quitarEspacios(valor("cp")))} ${v("localidad")} (${escapar(nombreProvincia(valor("provincia")))}) · España`;

  // Solo se muestra el método activo; los datos del otro no aparecen
  let pago = '<p class="mb-0 text-muted">Sin elegir.</p>';
  if (esDomiciliacion()) {
    pago = `<p class="mb-0">Domiciliación bancaria · ${v("titular-cuenta")}<br>IBAN ES•• ${escapar(enmascarar(valor("iban")))}</p>`;
  } else if (esTarjeta()) {
    pago = `<p class="mb-0">Tarjeta simulada · ${v("titular-tarjeta")}<br>${escapar(enmascarar(valor("numero-tarjeta")))} · caduca ${v("caducidad")}</p>`;
  }

  // Desglose con la periodicidad de cada concepto
  let filas = "";
  if (plan) filas += `<tr><td>${plan.nombre}</td><td>Mensual</td><td class="text-end">${formatearPrecio(plan.precio)}</td></tr>`;
  complementos.forEach(c => {
    filas += `<tr><td>${c.nombre}</td><td>${c.tipo === "mensual" ? "Mensual" : "Pago único"}</td><td class="text-end">${formatearPrecio(c.precio)}</td></tr>`;
  });

  $("revision").innerHTML =
    bloqueRevision("Plan", 1, `<p class="mb-0">${plan ? plan.nombre : "Sin elegir"}</p>`) +
    bloqueRevision("Complementos", 2, textoComplementos) +
    bloqueRevision("Datos personales", 3, `<p class="mb-0">${v("nombre")} ${v("apellidos")} · DNI ${escapar(quitarEspacios(valor("dni")).toUpperCase())}<br>
      ${escapar(normalizarCorreo(valor("email")))} · ${escapar(normalizarTelefono(valor("telefono")))}</p>`) +
    bloqueRevision("Dirección", 4, `<p class="mb-0">${direccion}</p>`) +
    bloqueRevision("Pago", 5, pago) +
    `<section class="bloque-revision">
      <h3 class="h6 fw-bold text-uppercase mb-2">Desglose</h3>
      <div class="table-responsive">
        <table class="table table-sm mb-0 tabla-desglose">
          <thead><tr><th scope="col">Concepto</th><th scope="col">Periodicidad</th><th scope="col" class="text-end">Precio</th></tr></thead>
          <tbody>${filas}</tbody>
          <tfoot>
            <tr><th scope="row" colspan="2">Total pago único (hoy)</th><td class="text-end fw-bold">${formatearPrecio(pagoUnico)}</td></tr>
            <tr><th scope="row" colspan="2">Total cuota mensual</th><td class="text-end fw-bold">${formatearPrecio(cuotaMensual)}/mes</td></tr>
          </tfoot>
        </table>
      </div>
    </section>`;
}


/* ==========================================================================
   7. CONFIRMAR
   ========================================================================== */

function confirmar(evento) {
  evento.preventDefault();          // nunca dejamos que el navegador envíe solo

  // Pulsar Intro dentro de un campo envía el formulario aunque el botón Confirmar esté oculto.
  // Si todavía no estamos en la revisión, Intro hace lo mismo que «Siguiente»:
  // valida solo el paso actual y no saca errores de pasos que aún no se han visto.
  if (estado.pasoActual !== TOTAL_PASOS) {
    siguiente();
    return;
  }

  // Volvemos a validar TODO y recalculamos el total
  pintarResumenPedido();
  const errores = validarPasos(1, TOTAL_PASOS);
  if (errores.length > 0) {
    informarErrores(errores);
    return;
  }

  // Todo OK: guardamos una marca y volvemos al home, que abrirá el modal una vez
  const { plan } = calcularTotales();
  sessionStorage.setItem(CLAVE_EXITO, plan.nombre);
  window.location.href = "index.html";
}


/* ==========================================================================
   8. EVENTOS
   ========================================================================== */

function cambiarMetodoPago() {
  const metodo = metodoPago();
  [["domiciliacion", "bloque-domiciliacion"], ["tarjeta", "bloque-tarjeta"]].forEach(([nombre, idBloque]) => {
    const activo = metodo === nombre;
    $(idBloque).hidden = !activo;
    $(idBloque).disabled = !activo;     // los campos ocultos no se pueden enfocar ni enviar
  });
  // Los errores del método que se ha desactivado desaparecen
  CAMPOS.filter(c => c.paso === 5 && !c.activo()).forEach(c => {
    limpiarError(c);
    actualizarEnResumen(c, "");
  });
}

// Al corregir un campo que tenía error, volvemos a validarlo y actualizamos el mensaje
function revalidar(campo) {
  if (!campo || !tieneError(campo)) return;
  const mensaje = campo.activo() ? campo.validar() : "";
  if (mensaje) mostrarError(campo, mensaje);
  else limpiarError(campo);
  actualizarEnResumen(campo, mensaje);
}

function alCambiar(evento) {
  const elemento = evento.target;
  revalidar(buscarCampo(elemento));

  // Campos que dependen de otros
  if (elemento.id === "email") revalidar(CAMPOS.find(c => c.id === "email2"));
  if (elemento.id === "provincia") revalidar(CAMPOS.find(c => c.id === "cp"));
  if (elemento.name === "plan" || elemento.name === "complemento") {
    comprobarIncompatibilidad();
    pintarResumenPedido();
  }
  if (elemento.name === "metodo-pago") cambiarMetodoPago();
}

function iniciar() {
  // Provincias ordenadas por nombre
  const selectProvincia = $("provincia");
  [...PROVINCIAS]
    .sort((a, b) => a[1].localeCompare(b[1], "es"))
    .forEach(([codigo, nombre]) => selectProvincia.add(new Option(nombre, codigo)));

  // Ayuda del navegador: no se puede elegir una fecha futura (la regla real está en JS)
  const hoy = new Date();
  $("nacimiento").max = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  $("btn-siguiente").addEventListener("click", siguiente);
  $("btn-anterior").addEventListener("click", anterior);
  $("btn-volver-revision").addEventListener("click", () => irAPaso(TOTAL_PASOS));
  formulario.addEventListener("submit", confirmar);
  formulario.addEventListener("input", alCambiar);
  formulario.addEventListener("change", alCambiar);

  document.querySelectorAll(".paso-btn").forEach(boton => {
    boton.addEventListener("click", () => irAPaso(Number(boton.dataset.ir)));
  });

  // Botones "Editar" de la revisión (se crean después, por eso usamos delegación)
  $("revision").addEventListener("click", evento => {
    const boton = evento.target.closest("[data-editar]");
    if (!boton) return;
    estado.editandoDesdeRevision = true;
    mostrarPaso(Number(boton.dataset.editar));
  });

  // Si la página se recupera de la caché al pulsar "atrás", el método de pago marcado sigue igual
  cambiarMetodoPago();
  comprobarIncompatibilidad();
  pintarResumenPedido();
  mostrarPaso(1, { enfocarTitulo: false });
}

iniciar();
