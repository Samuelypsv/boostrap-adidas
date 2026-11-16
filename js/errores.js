/* ==========================================================================
   errores.js
   Presentación de errores. No decide QUÉ está mal (eso es validaciones.js),
   solo lo ENSEÑA: mensaje junto al campo, aria-invalid, aria-describedby
   y el resumen con enlaces de arriba del formulario.

   Cada "campo" es un objeto de la lista CAMPOS de formulario.js:
   { id, etiqueta, paso, elementos(), foco(), validar() }
   El mensaje se pinta en el elemento con id  `${campo.id}-error`.
   ========================================================================== */

const resumenErrores = document.getElementById("resumen-errores");
const resumenTitulo = document.getElementById("resumen-errores-titulo");
const resumenLista = document.getElementById("resumen-errores-lista");

// Añade o quita un id dentro de aria-describedby sin borrar los que ya había (ayudas, etc.)
function anadirDescripcion(elemento, idError) {
  const ids = (elemento.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
  if (!ids.includes(idError)) ids.push(idError);
  elemento.setAttribute("aria-describedby", ids.join(" "));
}

function mostrarError(campo, mensaje) {
  const idError = `${campo.id}-error`;
  const cajaError = document.getElementById(idError);

  campo.elementos().forEach(elemento => {
    elemento.classList.add("is-invalid");             // estilo rojo de Bootstrap
    elemento.setAttribute("aria-invalid", "true");     // lo anuncian los lectores de pantalla
    anadirDescripcion(elemento, idError);              // el lector lee el mensaje al enfocar
  });

  // Icono + texto: el error no depende solo del color
  cajaError.innerHTML = '<i class="bi bi-exclamation-circle-fill" aria-hidden="true"></i> ';
  cajaError.append(document.createTextNode(mensaje));
  cajaError.hidden = false;
}

function limpiarError(campo) {
  campo.elementos().forEach(elemento => {
    elemento.classList.remove("is-invalid");
    elemento.removeAttribute("aria-invalid");
  });
  const cajaError = document.getElementById(`${campo.id}-error`);
  if (cajaError) {
    cajaError.hidden = true;
    cajaError.textContent = "";
  }
}

function tieneError(campo) {
  return campo.elementos().some(elemento => elemento.getAttribute("aria-invalid") === "true");
}

/* ---------- Resumen de errores con enlaces ---------- */

// errores: [{ campo, mensaje }] ya ordenados por paso y orden visual.
// alPulsarEnlace(campo): función de formulario.js que abre el paso y enfoca el campo.
function mostrarResumen(errores, alPulsarEnlace) {
  resumenLista.innerHTML = "";
  resumenTitulo.textContent = errores.length === 1
    ? "Hay 1 error que debes corregir:"
    : `Hay ${errores.length} errores que debes corregir:`;

  errores.forEach(({ campo, mensaje }) => {
    const item = document.createElement("li");
    item.dataset.campo = campo.id;
    const enlace = document.createElement("a");
    enlace.href = `#${campo.foco().id}`;
    enlace.textContent = `Paso ${campo.paso} · ${campo.etiqueta}: ${mensaje}`;
    enlace.addEventListener("click", evento => {
      evento.preventDefault();
      alPulsarEnlace(campo);
    });
    item.append(enlace);
    resumenLista.append(item);
  });

  resumenErrores.hidden = false;
}

// Cuando se corrige un campo, quitamos su línea del resumen (o actualizamos el texto)
function actualizarEnResumen(campo, mensaje) {
  const item = resumenLista.querySelector(`li[data-campo="${campo.id}"]`);
  if (!item) return;
  if (mensaje) {
    item.querySelector("a").textContent = `Paso ${campo.paso} · ${campo.etiqueta}: ${mensaje}`;
  } else {
    item.remove();
  }
  const quedan = resumenLista.children.length;
  if (quedan === 0) ocultarResumen();
  else resumenTitulo.textContent = quedan === 1 ? "Hay 1 error que debes corregir:" : `Hay ${quedan} errores que debes corregir:`;
}

function ocultarResumen() {
  resumenErrores.hidden = true;
  resumenLista.innerHTML = "";
}
