/* ==========================================================================
   home.js
   Abre el modal «Solicitud registrada correctamente» UNA sola vez,
   justo después de confirmar el formulario.

   - formulario.js guarda una marca en sessionStorage y redirige aquí.
   - Si la marca existe, la borramos primero y luego abrimos el modal.
   - Al recargar ya no hay marca → no vuelve a salir.
   - Entrando directamente en la home tampoco hay marca → no sale.
   ========================================================================== */

const CLAVE_EXITO = "adidas-solicitud-registrada";

const planContratado = sessionStorage.getItem(CLAVE_EXITO);

if (planContratado) {
  sessionStorage.removeItem(CLAVE_EXITO);
  document.getElementById("modal-exito-plan").textContent = planContratado;
  const modal = new bootstrap.Modal(document.getElementById("modal-exito"));
  modal.show();
}
