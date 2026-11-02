const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export const mesCorto = (mes) => MESES_CORTOS[mes - 1] ?? "";

// $6.10M · $435.3K · $950
export const moneyCompact = (valor) => {
  const n = Number(valor) || 0;
  const abs = Math.abs(n);
  const signo = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${signo}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${signo}$${(abs / 1_000).toFixed(1)}K`;
  return `${signo}$${abs.toFixed(0)}`;
};

const moneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});
export const moneyFull = (valor) => moneda.format(Number(valor) || 0);

export const numero = (valor) => (Number(valor) || 0).toLocaleString("es-MX");

// "2026-10-21" -> "21 de octubre de 2026" (sin pasar por Date UTC, para no correr el día)
export const fechaLarga = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// "2026-03-01" -> "01/03/2026"
export const fechaDMA = (iso) => (iso ? iso.split("-").reverse().join("/") : "");

// "2026-10-31" -> "31/10"
export const fechaCorta = (iso) => {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

// "ASEGURADORA ASERTA, SA. DE CV." -> "Aserta"
const PALABRAS_OMITIDAS = new Set([
  "ASEGURADORA", "FIANZAS", "FIANZA", "COMPAÑIA", "COMPAÑÍA", "GARANTIAS", "GARANTÍAS",
  "INTERNATIONAL", "MEXICO", "MÉXICO", "DE", "DEL", "LA", "EL", "Y",
  "SA", "SA.", "S.A.", "S.A", "CV", "CV.", "C.V.",
]);

export const nombreCorto = (nombre = "") => {
  const palabras = nombre.split(",")[0].split(/\s+/).filter(Boolean);
  const primera = palabras.find((p) => !PALABRAS_OMITIDAS.has(p.toUpperCase()));
  if (!primera) return nombre;
  return primera.charAt(0).toUpperCase() + primera.slice(1).toLowerCase();
};

// Tope "redondo" para el eje de la gráfica: 862K -> 1M, 520K -> 750K...
export const topeEje = (max) => {
  if (!(max > 0)) return 1;
  const exp = 10 ** Math.floor(Math.log10(max));
  for (const f of [1, 2, 2.5, 5, 10]) {
    if (f * exp >= max) return f * exp;
  }
  return 10 * exp;
};