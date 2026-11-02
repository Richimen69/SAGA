const moneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

export const formatoMoneda = (valor) => moneda.format(Number(valor) || 0);

export const formatoPorcentaje = (valor) =>
  `${(Number(valor) || 0).toLocaleString("es-MX", { maximumFractionDigits: 2 })}%`;