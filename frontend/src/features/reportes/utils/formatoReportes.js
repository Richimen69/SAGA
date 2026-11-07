const moneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// $26,880.00
export const dinero = (valor) => moneda.format(Number(valor) || 0);

// 35 -> "35%"; 12.5 -> "12.5%"
export const porcentaje = (valor) =>
  `${(Number(valor) || 0).toLocaleString("es-MX", { maximumFractionDigits: 2 })}%`;

export const numero = (valor) => (Number(valor) || 0).toLocaleString("es-MX");

// "2026-03-01" -> "01/03/2026"
export const fechaDMA = (iso) => (iso ? iso.split("-").reverse().join("/") : "");

const dos = (n) => String(n).padStart(2, "0");
// Fecha local de hoy en AAAA-MM-DD (sin pasar por UTC)
export const hoyISO = (fecha = new Date()) =>
  `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
