/* Pruebas de las reglas de js/validaciones.js
   Ejecutar con:  node tests/validaciones.test.js
   Cada prueba comprueba si la función devuelve error ("KO") o no ("OK"). */

const v = require("../js/validaciones.js");

let fallos = 0;
function prueba(descripcion, mensaje, esperaError) {
  const hayError = mensaje !== "";
  const ok = hayError === esperaError;
  if (!ok) fallos++;
  console.log(`${ok ? "OK " : "KO "} ${descripcion}${hayError ? "  →  " + mensaje : ""}`);
}

// Fecha fija para que las pruebas den lo mismo cualquier día: 9 de noviembre de 2026
const HOY = new Date(2026, 10, 9);

console.log("\n1. Vacíos y espacios");
prueba("Nombre vacío", v.validarNombre("", "tu nombre"), true);
prueba("Nombre solo con espacios", v.validarNombre("    ", "tu nombre"), true);
prueba("Nombre con tilde y espacios: '  María José '", v.validarNombre("  María José ", "tu nombre"), false);
prueba("Apellido con apóstrofo y guion: O'Connor Ruiz-Pérez", v.validarNombre("O'Connor Ruiz-Pérez", "tus apellidos"), false);
prueba("Nombre con números: 'Ana3'", v.validarNombre("Ana3", "tu nombre"), true);

console.log("\n2. Correo y teléfono");
prueba("Correo sin @: 'manuel.correo.es'", v.validarCorreo("manuel.correo.es"), true);
prueba("Correo válido con espacios: ' Manuel@Correo.es '", v.validarCorreo(" Manuel@Correo.es "), false);
prueba("Confirmación igual en mayúsculas", v.validarConfirmacionCorreo("MANUEL@correo.ES ", "manuel@correo.es"), false);
prueba("Confirmación distinta", v.validarConfirmacionCorreo("manu@correo.es", "manuel@correo.es"), true);
prueba("Teléfono +34 612 34 56 78", v.validarTelefono("+34 612 34 56 78"), false);
prueba("Teléfono 923 12 34 56", v.validarTelefono("923 12 34 56"), false);
prueba("Teléfono que empieza por 5: 512345678", v.validarTelefono("512345678"), true);
prueba("Teléfono de 8 cifras: 61234567", v.validarTelefono("61234567"), true);

console.log("\n3. DNI");
prueba("DNI correcto 12345678Z", v.validarDni("12345678Z"), false);
prueba("DNI correcto en minúscula con espacio: '12345678 z'", v.validarDni("12345678 z"), false);
prueba("DNI con letra incorrecta 12345678A", v.validarDni("12345678A"), true);
prueba("DNI corto 1234567Z", v.validarDni("1234567Z"), true);

console.log("\n4. Edad (hoy = 09/11/2026)");
prueba("Cumple 18 hoy: 2008-11-09", v.validarFechaNacimiento("2008-11-09", HOY), false);
prueba("Cumple 18 mañana: 2008-11-10", v.validarFechaNacimiento("2008-11-10", HOY), true);
prueba("Fecha futura: 2027-01-01", v.validarFechaNacimiento("2027-01-01", HOY), true);
prueba("Fecha que no existe: 2000-02-30", v.validarFechaNacimiento("2000-02-30", HOY), true);
prueba("Mayor de edad: 1990-05-20", v.validarFechaNacimiento("1990-05-20", HOY), false);

console.log("\n5. Dirección");
prueba("CP 37001 con Salamanca (37)", v.validarCodigoPostal("37001", "37", "Salamanca"), false);
prueba("CP 28013 con Salamanca (37)", v.validarCodigoPostal("28013", "37", "Salamanca"), true);
prueba("CP con prefijo 53: 53001", v.validarCodigoPostal("53001", "", ""), true);
prueba("CP de 4 cifras: 3700", v.validarCodigoPostal("3700", "37", "Salamanca"), true);
prueba("Número de vía vacío", v.validarNumeroVia("  "), true);
prueba("Número S/N", v.validarNumeroVia("s/n"), false);

console.log("\n6. Productos");
prueba("Sin plan", v.validarPlan(""), true);
prueba("Plan Plus", v.validarPlan("plus"), false);
prueba("Plan Pro + envío exprés (incompatible)", v.validarComplementos("pro", ["kit", "envio"]), true);
prueba("Plan Plus + envío exprés", v.validarComplementos("plus", ["envio"]), false);
prueba("Plan Pro sin complementos", v.validarComplementos("pro", []), false);

console.log("\n7. IBAN");
prueba("IBAN válido ES91 2100 0418 4502 0005 1332", v.validarIban("ES91 2100 0418 4502 0005 1332"), false);
prueba("IBAN con control incorrecto ES91 2100 0418 4502 0005 1333", v.validarIban("ES91 2100 0418 4502 0005 1333"), true);
prueba("IBAN de otro país DE89370400440532013000", v.validarIban("DE89370400440532013000"), true);
prueba("IBAN corto ES912100", v.validarIban("ES912100"), true);

console.log("\n8. Tarjeta (hoy = 11/2026)");
prueba("Luhn correcto 4111 1111 1111 1111", v.validarNumeroTarjeta("4111 1111 1111 1111"), false);
prueba("Luhn incorrecto 4111 1111 1111 1112", v.validarNumeroTarjeta("4111 1111 1111 1112"), true);
prueba("Caducidad mes actual 11/26", v.validarCaducidad("11/26", HOY), false);
prueba("Caducidad pasada 10/26", v.validarCaducidad("10/26", HOY), true);
prueba("Caducidad mes 13: 13/27", v.validarCaducidad("13/27", HOY), true);
prueba("CVV de 2 cifras: 12", v.validarCvv("12"), true);
prueba("CVV con letra: 12a", v.validarCvv("12a"), true);
prueba("CVV correcto 123", v.validarCvv("123"), false);

console.log("\n10. Casillas");
prueba("Condiciones sin marcar", v.validarCasilla(false, "Debes aceptar"), true);
prueba("Condiciones marcadas", v.validarCasilla(true, "Debes aceptar"), false);

console.log(fallos === 0 ? "\nTodas las pruebas OK" : `\n${fallos} pruebas KO`);
process.exit(fallos === 0 ? 0 : 1);
