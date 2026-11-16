/* ==========================================================================
   datos.js
   Catálogo de la simulación. Los precios van en céntimos para que las
   sumas sean exactas (0.1 + 0.2 en JavaScript no da 0.3).
   ========================================================================== */

const PLANES = [
  {
    id: "basico",
    nombre: "adiClub Básico",
    precio: 499,               // 4,99 € al mes
    caracteristicas: ["5 % de descuento en cada compra", "Acceso anticipado a rebajas", "Envío estándar gratis desde 50 €"]
  },
  {
    id: "plus",
    nombre: "adiClub Plus",
    precio: 999,
    caracteristicas: ["10 % de descuento en cada compra", "Acceso anticipado a lanzamientos", "Envío estándar siempre gratis"]
  },
  {
    id: "pro",
    nombre: "adiClub Pro",
    precio: 1499,
    caracteristicas: ["15 % de descuento en cada compra", "Reserva de lanzamientos CONFIRMED", "Envío exprés ilimitado incluido"]
  }
];

// tipo "unico" = se paga una vez · tipo "mensual" = cuota que se repite cada mes
const COMPLEMENTOS = [
  { id: "kit",    nombre: "Kit de bienvenida",            descripcion: "Camiseta y bolsa de deporte adiClub.",          precio: 2495, tipo: "unico" },
  { id: "dorsal", nombre: "Personalización con dorsal",   descripcion: "Tu nombre y número en una camiseta del kit.",   precio: 1200, tipo: "unico" },
  { id: "envio",  nombre: "Envío exprés ilimitado",       descripcion: "Pedidos en 24 h sin coste. No compatible con el plan Pro, que ya lo incluye.", precio: 299, tipo: "mensual" }
];

// Código postal: las dos primeras cifras son el código de la provincia
const PROVINCIAS = [
  ["01", "Araba/Álava"], ["02", "Albacete"], ["03", "Alicante/Alacant"], ["04", "Almería"],
  ["05", "Ávila"], ["06", "Badajoz"], ["07", "Illes Balears"], ["08", "Barcelona"],
  ["09", "Burgos"], ["10", "Cáceres"], ["11", "Cádiz"], ["12", "Castellón/Castelló"],
  ["13", "Ciudad Real"], ["14", "Córdoba"], ["15", "A Coruña"], ["16", "Cuenca"],
  ["17", "Girona"], ["18", "Granada"], ["19", "Guadalajara"], ["20", "Gipuzkoa"],
  ["21", "Huelva"], ["22", "Huesca"], ["23", "Jaén"], ["24", "León"],
  ["25", "Lleida"], ["26", "La Rioja"], ["27", "Lugo"], ["28", "Madrid"],
  ["29", "Málaga"], ["30", "Murcia"], ["31", "Navarra"], ["32", "Ourense"],
  ["33", "Asturias"], ["34", "Palencia"], ["35", "Las Palmas"], ["36", "Pontevedra"],
  ["37", "Salamanca"], ["38", "Santa Cruz de Tenerife"], ["39", "Cantabria"], ["40", "Segovia"],
  ["41", "Sevilla"], ["42", "Soria"], ["43", "Tarragona"], ["44", "Teruel"],
  ["45", "Toledo"], ["46", "Valencia/València"], ["47", "Valladolid"], ["48", "Bizkaia"],
  ["49", "Zamora"], ["50", "Zaragoza"], ["51", "Ceuta"], ["52", "Melilla"]
];

// 1499 -> "14,99 €"
function formatearPrecio(centimos) {
  return (centimos / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}
