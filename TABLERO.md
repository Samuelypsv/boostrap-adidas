# Tablero · Práctica 2 · Formulario de contratación adiClub

Exportación del tablero de Jira **Equipo Adidas** (épica SCRUM-6) con la documentación de cada tarea. La exportación original de Jira está en [`jira-export.pdf`](jira-export.pdf).
Columnas: Pendiente · En curso · En pruebas · Hecho. Las 11 tareas están en **Hecho** desde el 16/11/2026.

| Tarea | Título | Estado | Commit |
|---|---|---|---|
| SCRUM-7 | T1 · Integración con la home y modal de éxito | Hecho | [`df633c1`](https://github.com/Samuelypsv/boostrap-adidas/commit/df633c1) |
| SCRUM-8 | T2 · Estructura HTML de los 6 pasos con el estilo de la home | Hecho | [`e68d895`](https://github.com/Samuelypsv/boostrap-adidas/commit/e68d895) |
| SCRUM-9 | T3 · Navegación entre pasos y barra de progreso | Hecho | [`8fe26b8`](https://github.com/Samuelypsv/boostrap-adidas/commit/8fe26b8) |
| SCRUM-10 | T4 · Cards de planes, complementos e incompatibilidad | Hecho | [`bbab8dd`](https://github.com/Samuelypsv/boostrap-adidas/commit/bbab8dd) |
| SCRUM-11 | T5 · Resumen de precios: pagos únicos y cuota mensual | Hecho | [`bbab8dd`](https://github.com/Samuelypsv/boostrap-adidas/commit/bbab8dd) |
| SCRUM-12 | T6 · Datos personales: nombre, DNI, correo, teléfono y edad | Hecho | [`ad03a4f`](https://github.com/Samuelypsv/boostrap-adidas/commit/ad03a4f) |
| SCRUM-13 | T7 · Dirección en España y código postal por provincia | Hecho | [`ad03a4f`](https://github.com/Samuelypsv/boostrap-adidas/commit/ad03a4f) |
| SCRUM-14 | T8 · Pago: domiciliación (IBAN módulo 97) y tarjeta simulada (Luhn) | Hecho | [`ad03a4f`](https://github.com/Samuelypsv/boostrap-adidas/commit/ad03a4f) |
| SCRUM-15 | T9 · Revisión, casillas legales y confirmación | Hecho | [`8fe26b8`](https://github.com/Samuelypsv/boostrap-adidas/commit/8fe26b8) |
| SCRUM-16 | T10 · Errores accesibles, resumen con enlaces y ancla al primer error | Hecho | [`51ed6b2`](https://github.com/Samuelypsv/boostrap-adidas/commit/51ed6b2) |
| SCRUM-17 | T11 · Pruebas (12 casos), responsive, teclado y README | Hecho | [`577a92b`](https://github.com/Samuelypsv/boostrap-adidas/commit/577a92b) |

## SCRUM-7 · T1 · Integración con la home y modal de éxito

- **Objetivo:** Enlazar la home con el formulario y mostrar el modal «Solicitud registrada correctamente» al volver.
- **Criterio de aceptación:** El botón del club abre `contratacion.html`; tras confirmar se vuelve a `index.html` y el modal se abre una sola vez; entrando directamente o recargando no aparece.
- **IA utilizada:** Claude (Anthropic)
- **Prompt principal (EARS):**

  > Contexto: home de adidas en HTML y Bootstrap 5, formulario en contratacion.html.  
  > Cuando el formulario se confirme correctamente, el sistema deberá volver a index.html y abrir un modal de Bootstrap con el mensaje «Solicitud registrada correctamente».  
  > Si se entra directamente en la home o se recarga después de ver el modal, entonces el sistema no deberá mostrarlo.  

- **Corrección relevante:** Ninguna.
- **Decisiones:** **Aceptado:** una marca en `sessionStorage` que `home.js` borra antes de abrir el modal; así funciona igual abriendo el archivo o con servidor. **Cambiado:** el modal usa el botón `.btn-adidas` de la home para que no parezca un modal genérico de Bootstrap. **Descartado:** pasar el aviso por la URL (`?ok=1`), porque al recargar volvería a salir.
- **Prueba y evidencia:** Prueba 12 de `PRUEBAS.md` · [`df633c1`](https://github.com/Samuelypsv/boostrap-adidas/commit/df633c1) · [`js/home.js`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/home.js)

## SCRUM-8 · T2 · Estructura HTML de los 6 pasos con el estilo de la home

- **Objetivo:** Crear `contratacion.html` y `css/contratacion.css` con la misma cabecera, fuentes, colores y botones que la home.
- **Criterio de aceptación:** Existen los 6 pasos como `fieldset`; el formulario lleva `novalidate`; cada campo tiene `label` y un contenedor de error con id propio; se ve igual que la home.
- **IA utilizada:** Claude (Anthropic)
- **Prompt principal (EARS):**

  > Contexto: home de adidas con styles.css (Barlow, Barlow Condensed, botón .btn-adidas).  
  > El sistema deberá mostrar un formulario de 6 pasos con la misma identidad visual de la home.  
  > Mientras un paso no esté activo, el sistema deberá ocultarlo sin borrar sus datos.  

- **Corrección relevante:** La franja superior empezaba con un «·» suelto; ahora dice «Simulación educativa · No se realiza ningún cobro» ([`1aacd47`](https://github.com/Samuelypsv/boostrap-adidas/commit/1aacd47)).
- **Decisiones:** **Aceptado:** un `fieldset` por paso que se oculta con `hidden`, y `css/contratacion.css` reutilizando las variables de `styles.css`. **Cambiado:** el texto de la franja superior (ver corrección). **Descartado:** una página por paso, porque obligaría a guardar y recuperar los datos entre páginas.
- **Prueba y evidencia:** Revisión visual en escritorio (1366 px) y móvil (390 px), capturas en `capturas/practica2/` · [`e68d895`](https://github.com/Samuelypsv/boostrap-adidas/commit/e68d895)

## SCRUM-9 · T3 · Navegación entre pasos y barra de progreso

- **Objetivo:** Botones Anterior/Siguiente, indicador de paso actual y progreso.
- **Criterio de aceptación:** Siguiente valida el paso actual; Anterior no valida ni borra datos; no se puede saltar hacia delante sin validar los pasos previos.
- **IA utilizada:** Claude (Anthropic)
- **Prompt principal (EARS):**

  > Contexto: formulario de contratación con Bootstrap y JavaScript nativo.  
  > Cuando se pulse Siguiente, el formulario deberá validar los campos del paso actual con JavaScript.  
  > Si algún campo es inválido, entonces el formulario deberá impedir el avance, mostrar los errores y enfocar el primer campo incorrecto.  
  > Mientras el usuario navegue entre pasos, el formulario deberá conservar los valores introducidos.  

- **Corrección relevante:** Al pulsar Intro dentro de un campo se enviaba el formulario y se validaban los 6 pasos: en el paso 3 salían 15 errores de pasos sin visitar. Ahora, fuera de la revisión, Intro hace lo mismo que Siguiente ([`1aacd47`](https://github.com/Samuelypsv/boostrap-adidas/commit/1aacd47)).
- **Decisiones:** **Aceptado:** `pasoMaximo` en el estado para desactivar los pasos a los que aún no se ha llegado, y validar todos los pasos intermedios al saltar hacia delante. **Cambiado:** el comportamiento de Intro (ver corrección). **Descartado:** validar al pulsar Anterior, porque el enunciado pide no validar el paso que se abandona.
- **Prueba y evidencia:** Pruebas 1 y 11 y fila «Intro dentro de un campo» de `PRUEBAS.md` · [`8fe26b8`](https://github.com/Samuelypsv/boostrap-adidas/commit/8fe26b8) · [`siguiente`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/formulario.js#L218), [`irAPaso`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/formulario.js#L236), [`confirmar`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/formulario.js#L393)

## SCRUM-10 · T4 · Cards de planes, complementos e incompatibilidad

- **Objetivo:** Paso 1 con 3 planes adiClub en cards (radio accesible) y paso 2 con 3 complementos opcionales.
- **Criterio de aceptación:** Solo se puede elegir un plan y se nota cuál; los complementos admiten ninguno, uno o varios; «Envío exprés ilimitado» es incompatible con el plan Pro (ya lo incluye) y se explica en la interfaz; la regla se vuelve a comprobar si se cambia de plan después.
- **IA utilizada:** Claude (Anthropic)
- **Prompt principal (EARS):**

  > El sistema deberá permitir seleccionar exactamente un plan principal.  
  > Si el usuario elige el plan Pro y tiene marcado «Envío exprés ilimitado», entonces el sistema deberá mostrar un aviso y bloquear el avance hasta que lo quite.  
  > Cuando cambie el plan, el sistema deberá volver a comprobar la incompatibilidad.  

- **Corrección relevante:** Ninguna.
- **Decisiones:** **Aceptado:** radios y checkbox nativos dentro de un `label` que hace de card, para que funcionen con teclado sin código extra. **Cambiado:** además del error en el paso 2, se muestra un aviso en el paso 1 al cambiar a Pro. **Descartado:** desmarcar el complemento automáticamente, porque el usuario no vería por qué ha cambiado su pedido.
- **Prueba y evidencia:** Prueba 6 · [`bbab8dd`](https://github.com/Samuelypsv/boostrap-adidas/commit/bbab8dd) · [`validarComplementos`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/validaciones.js#L176), [`comprobarIncompatibilidad`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/formulario.js#L299)

## SCRUM-11 · T5 · Resumen de precios: pagos únicos y cuota mensual

- **Objetivo:** Resumen lateral que se actualiza con JavaScript.
- **Criterio de aceptación:** Separa «Pago único» y «Cuota mensual»; nunca los suma como el mismo concepto; se recalcula al cambiar plan o complementos y al confirmar.
- **IA utilizada:** Claude (Anthropic)
- **Prompt principal (EARS):**

  > Cuando cambie el plan o un complemento, el sistema deberá recalcular el resumen.  
  > El sistema deberá mostrar por separado los pagos únicos y las cuotas recurrentes con su periodicidad.  

- **Corrección relevante:** Ninguna.
- **Decisiones:** **Aceptado:** precios en céntimos para que las sumas sean exactas, y cada complemento con su `tipo` (`unico` o `mensual`). **Cambiado:** nada tras las pruebas. **Descartado:** un único «Total», porque mezclaría un pago de una vez con una cuota que se repite.
- **Prueba y evidencia:** Capturas `00-paso1-escritorio.png` y `04-revision.png` · [`bbab8dd`](https://github.com/Samuelypsv/boostrap-adidas/commit/bbab8dd) · [`calcularTotales`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/formulario.js#L257)

## SCRUM-12 · T6 · Datos personales: nombre, DNI, correo, teléfono y edad

- **Objetivo:** Validar en JavaScript el paso 3.
- **Criterio de aceptación:** Obligatorios con trim (admite tildes, espacios, apóstrofos y guiones); correo con formato y confirmación igual tras normalizar; teléfono de 9 cifras empezando por 6, 7, 8 o 9 con +34 y espacios opcionales; DNI con letra de control correcta; mayor de 18 calculando día y mes, sin fechas futuras.
- **IA utilizada:** Claude (Anthropic)
- **Prompt principal (EARS):**

  > Cuando se valide el paso de datos personales, el sistema deberá comprobar la letra del DNI con el resto de dividir entre 23.  
  > Si la fecha de nacimiento corresponde a menos de 18 años o es futura, entonces el sistema deberá mostrar un error junto al campo.  
  > Devuelve funciones puras que devuelvan el mensaje de error o una cadena vacía.  

- **Corrección relevante:** Ninguna.
- **Decisiones:** **Aceptado:** funciones puras que devuelven el mensaje o `""`, y `hoy` como parámetro para poder probar la edad con una fecha fija. **Cambiado:** nada tras las pruebas. **Descartado:** calcular la edad restando solo los años, porque el enunciado exige tener en cuenta día y mes.
- **Prueba y evidencia:** Pruebas 2, 3 y 4 y `node tests/validaciones.test.js` · [`ad03a4f`](https://github.com/Samuelypsv/boostrap-adidas/commit/ad03a4f) · [`validarDni`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/validaciones.js#L95), [`validarFechaNacimiento`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/validaciones.js#L130)

## SCRUM-13 · T7 · Dirección en España y código postal por provincia

- **Objetivo:** Paso 4 con tipo y nombre de vía, número, piso opcional, CP, localidad y provincia.
- **Criterio de aceptación:** Se indica que solo se admiten direcciones de España; CP de 5 cifras con prefijo 01–52; el prefijo coincide con la provincia elegida.
- **IA utilizada:** Claude (Anthropic)
- **Prompt principal (EARS):**

  > Si el código postal no empieza por el código de la provincia seleccionada, entonces el sistema deberá indicar qué prefijo corresponde a esa provincia.  
  > Cuando cambie la provincia, el sistema deberá volver a validar el código postal si ya tenía error.  

- **Corrección relevante:** Ninguna.
- **Decisiones:** **Aceptado:** el `value` de cada provincia es su prefijo postal, así la comprobación es una comparación de dos cifras. **Cambiado:** el desplegable se ordena por nombre y no por código. **Descartado:** una lista de localidades por código postal, porque no la pide el enunciado y haría falta un servicio externo.
- **Prueba y evidencia:** Prueba 5 · [`ad03a4f`](https://github.com/Samuelypsv/boostrap-adidas/commit/ad03a4f) · [`validarCodigoPostal`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/validaciones.js#L152)

## SCRUM-14 · T8 · Pago: domiciliación (IBAN módulo 97) y tarjeta simulada (Luhn)

- **Objetivo:** Paso 5 con dos métodos de pago; solo se muestran y exigen los campos del activo.
- **Criterio de aceptación:** IBAN ES + 22 cifras y control módulo 97; tarjeta de 16 cifras con Luhn, caducidad MM/AA no anterior al mes actual y CVV de 3 cifras; los campos del método inactivo no bloquean ni salen en el resumen.
- **IA utilizada:** Claude (Anthropic)
- **Prompt principal (EARS):**

  > Mientras el método de pago sea domiciliación, el sistema deberá exigir titular e IBAN y ocultar los campos de tarjeta.  
  > Mientras el método sea tarjeta, el sistema deberá exigir titular, número, caducidad y CVV.  
  > Si el IBAN tiene formato correcto pero el resto módulo 97 no es 1, entonces el sistema deberá rechazarlo.  

- **Corrección relevante:** Ninguna.
- **Decisiones:** **Aceptado:** el módulo 97 se calcula cifra a cifra porque el número no cabe en un `Number`, y cada campo de pago lleva una función `activo()`. **Cambiado:** el bloque inactivo, además de ocultarse, se pone `disabled` para que no reciba el foco. **Descartado:** borrar los datos del otro método al cambiar, para no perder lo escrito si el usuario vuelve.
- **Prueba y evidencia:** Pruebas 7, 8 y 9 · [`ad03a4f`](https://github.com/Samuelypsv/boostrap-adidas/commit/ad03a4f) · [`ibanEsValido`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/validaciones.js#L186), [`luhnEsValido`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/validaciones.js#L209), [`cambiarMetodoPago`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/formulario.js#L423)

## SCRUM-15 · T9 · Revisión, casillas legales y confirmación

- **Objetivo:** Paso 6 con todo lo elegido, botones Editar por bloque y tres casillas.
- **Criterio de aceptación:** Dos casillas obligatorias independientes (condiciones y privacidad) y una opcional (comunicaciones), todas desmarcadas; los textos se abren en modales; al confirmar se revalida todo y se recalcula el total.
- **IA utilizada:** Claude (Anthropic)
- **Prompt principal (EARS):**

  > Cuando se pulse Confirmar solicitud, el sistema deberá validar de nuevo todos los pasos y recalcular el total.  
  > Si falta alguna casilla obligatoria, entonces el sistema deberá bloquear la confirmación.  
  > Donde se incluya la casilla de comunicaciones comerciales, el sistema deberá permitir dejarla desmarcada.  

- **Corrección relevante:** Ninguna.
- **Decisiones:** **Aceptado:** la casilla comercial no está en la lista `CAMPOS`, así que no puede bloquear el envío. **Cambiado:** en la revisión el IBAN y la tarjeta se muestran enmascarados (solo las 4 últimas cifras). **Descartado:** una sola casilla para condiciones y privacidad, porque el enunciado las pide independientes.
- **Prueba y evidencia:** Prueba 10 · [`8fe26b8`](https://github.com/Samuelypsv/boostrap-adidas/commit/8fe26b8) · [`pintarRevision`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/formulario.js#L340), [`confirmar`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/formulario.js#L393)

## SCRUM-16 · T10 · Errores accesibles, resumen con enlaces y ancla al primer error

- **Objetivo:** Presentación de errores separada de la validación.
- **Criterio de aceptación:** Mensaje junto a cada campo con `aria-invalid` y `aria-describedby`; resumen con enlaces que llevan al campo aunque esté en otro paso; se abre el paso del primer error, se desplaza y se enfoca; los datos válidos se conservan; el error se actualiza al corregir.
- **IA utilizada:** Claude (Anthropic)
- **Prompt principal (EARS):**

  > Si hay varios errores al confirmar, entonces el sistema deberá abrir el paso del primer error, desplazarse hasta él y poner el foco en el campo.  
  > Cuando el usuario corrija un campo con error, el sistema deberá actualizar su mensaje y el resumen.  
  > El sistema no deberá depender solo del color para indicar un error.  

- **Corrección relevante:** Ninguna.
- **Decisiones:** **Aceptado:** `errores.js` solo pinta y no decide qué está mal; el orden de los errores sale del orden de la lista `CAMPOS`. **Cambiado:** cada mensaje lleva icono y texto además del borde rojo. **Descartado:** `alert()` y los mensajes nativos del navegador (por eso el formulario lleva `novalidate`).
- **Prueba y evidencia:** Prueba 11 y capturas `01-errores-paso3.png` y `05-resumen-errores.png` · [`51ed6b2`](https://github.com/Samuelypsv/boostrap-adidas/commit/51ed6b2) · [`mostrarError`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/errores.js#L23), [`mostrarResumen`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/errores.js#L59), [`irAlCampo`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/js/formulario.js#L153)

## SCRUM-17 · T11 · Pruebas (12 casos), responsive, teclado y README

- **Objetivo:** Registrar las 12 pruebas del enunciado y documentar la entrega.
- **Criterio de aceptación:** Tabla con datos ficticios, resultado esperado, obtenido y OK/KO; recorrido completo en móvil, escritorio y solo con teclado; README con cómo ejecutar, escenario y datos de prueba; prueba con copia sin `required`/`pattern`.
- **IA utilizada:** Claude (Anthropic)
- **Prompt principal (EARS):**

  > Contexto: validaciones en js/validaciones.js.  
  > El sistema deberá superar las 12 pruebas del enunciado aunque se quiten required, pattern y los límites HTML.  
  > Devuelve una tabla de pruebas con datos ficticios.  

- **Corrección relevante:** Al repetir las pruebas el 16/11/2026 se detectó el fallo de Intro de la T3; se corrigió y se añadió su fila a `PRUEBAS.md` ([`1aacd47`](https://github.com/Samuelypsv/boostrap-adidas/commit/1aacd47)).
- **Decisiones:** **Aceptado:** un recorrido automático que repite las 12 pruebas con y sin los atributos HTML, más 50 comprobaciones de las reglas sueltas con Node. **Cambiado:** las fechas de la prueba de edad se calculan respecto al día en que se ejecuta. **Descartado:** dar por buena la validación con pruebas solo manuales, porque no se pueden repetir igual tras cada cambio.
- **Prueba y evidencia:** `PRUEBAS.md` (12/12 OK en las dos pasadas) · [`577a92b`](https://github.com/Samuelypsv/boostrap-adidas/commit/577a92b) · [`tests/`](https://github.com/Samuelypsv/boostrap-adidas/blob/1aacd47/tests)
