// xlsx-js-style: misma API que xlsx, pero guarda colores y negritas
import * as XLSX from "xlsx-js-style";
import { fechaDMA } from "./formatoReportes";

const FORMATO_MONEDA = '"$"#,##0.00';
const FORMATO_PORCENTAJE = '0.##"%"';

const linea = { style: "thin", color: { rgb: "94A3B8" } };
const ESTILOS = {
  titulo: {
    font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
    fill: { patternType: "solid", fgColor: { rgb: "1E3A8A" } },
    alignment: { vertical: "center" },
  },
  subtitulo: { font: { italic: true, color: { rgb: "475569" } } },
  encabezado: {
    font: { bold: true },
    fill: { patternType: "solid", fgColor: { rgb: "DBEAFE" } },
    border: { bottom: linea },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
  },
  total: {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { patternType: "solid", fgColor: { rgb: "0F766E" } },
  },
  nota: { font: { color: { rgb: "92400E" } }, fill: { patternType: "solid", fgColor: { rgb: "FEF3C7" } } },
};
const MONTO = { alignment: { horizontal: "right", indent: 1 } };

const gris = { style: "thin", color: { rgb: "BFBFBF" } };
const CUADRICULA = { top: gris, bottom: gris, left: gris, right: gris };
const ESTILOS_DETALLE = {
  encabezado: {
    font: { bold: true, color: { rgb: "000000" } },
    fill: { patternType: "solid", fgColor: { rgb: "FFC000" } },
    border: CUADRICULA,
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
  },
  celda: { border: CUADRICULA },
  monto: { border: CUADRICULA, alignment: { horizontal: "right", indent: 1 } },
  total: {
    font: { bold: true },
    fill: { patternType: "solid", fgColor: { rgb: "FFC000" } },
    border: CUADRICULA,
  },
};
const FORMATO_PORC_DETALLE = '0.0"%"';

const limpiarNombre = (texto) => texto.replace(/[\\/:*?"<>|]/g, "").trim();
const dmy = (iso) => iso.split("-").reverse().join("-");

/**
 * Hoja del reporte: título, filtros usados, encabezados, una fila por ramo y movimiento,
 * y un total con fórmulas de suma (se recalculan si editan una cifra).
 */
export const construirHojaComisiones = (reporte, nombreAfianzadora) => {
  const conAfianzadora = reporte.afianzadora_id == null;
  const columnas = [
    ...(conAfianzadora ? [{ t: "Afianzadora", v: (f) => f.afianzadora_nombre }] : []),
    { t: "Ramo", v: (f) => f.ramo_nombre },
    { t: "Movimiento", v: (f) => f.movimiento_nombre },
    { t: "Trámites", v: (f) => f.tramites, suma: "tramites", num: true },
    { t: "Prima total", v: (f) => f.prima_total, suma: "prima_total", moneda: true },
    { t: "% Comisión", v: (f) => f.porcentaje_comision, formato: FORMATO_PORCENTAJE },
    { t: "Comisión", v: (f) => f.comision, suma: "comision", moneda: true },
    { t: "Gastos de expedición", v: (f) => f.gasto_expedicion, suma: "gasto_expedicion", moneda: true },
    { t: "Comisión pronto pago", v: (f) => f.comision_pronto_pago, suma: "comision_pronto_pago", moneda: true },
    { t: "Comisión total", v: (f) => f.comision_total, suma: "comision_total", moneda: true },
  ];
  const ultima = columnas.length - 1;

  const ws = {};
  const merges = [];
  const alturas = [];
  const poner = (r, c, celda) => {
    ws[XLSX.utils.encode_cell({ r, c })] = celda;
  };
  const banda = (r, estilo) => {
    for (let c = 0; c <= ultima; c++) poner(r, c, { t: "s", v: "", s: estilo });
  };

  let r = 0;
  banda(r, ESTILOS.titulo);
  poner(r, 0, { t: "s", v: "REPORTE DE COMISIONES", s: ESTILOS.titulo });
  merges.push({ s: { r, c: 0 }, e: { r, c: ultima } });
  alturas[r] = { hpt: 26 };
  r++;

  poner(r, 0, {
    t: "s",
    v: `Afianzadora: ${nombreAfianzadora || "Todas"} · Periodo: ${fechaDMA(reporte.desde)} al ${fechaDMA(reporte.hasta)}`,
    s: ESTILOS.subtitulo,
  });
  merges.push({ s: { r, c: 0 }, e: { r, c: ultima } });
  r += 2;

  columnas.forEach((col, c) => poner(r, c, { t: "s", v: col.t, s: ESTILOS.encabezado }));
  r++;

  const primera = r;
  for (const fila of reporte.filas) {
    columnas.forEach((col, c) => {
      const valor = col.v(fila);
      if (col.moneda) poner(r, c, { t: "n", v: Number(valor) || 0, z: FORMATO_MONEDA, s: MONTO });
      else if (col.formato) poner(r, c, { t: "n", v: Number(valor) || 0, z: col.formato });
      else if (col.num) poner(r, c, { t: "n", v: Number(valor) || 0 });
      else poner(r, c, { t: "s", v: String(valor ?? "") });
    });
    r++;
  }
  const ultimaFila = r - 1;

  // Totales con fórmula SUMA y el valor ya calculado por el backend
  banda(r, ESTILOS.total);
  poner(r, 0, { t: "s", v: "TOTAL", s: ESTILOS.total });
  columnas.forEach((col, c) => {
    if (!col.suma) return;
    const letra = XLSX.utils.encode_col(c);
    poner(r, c, {
      t: "n",
      f: `SUM(${letra}${primera + 1}:${letra}${ultimaFila + 1})`,
      v: Number(reporte.totales[col.suma]) || 0,
      z: col.moneda ? FORMATO_MONEDA : undefined,
      s: { ...ESTILOS.total, ...(col.moneda ? MONTO : {}) },
    });
  });
  r++;

  const fuera = reporte.no_considerados;
  if (fuera && fuera.tramites > 0) {
    r++;
    banda(r, ESTILOS.nota);
    poner(r, 0, {
      t: "s",
      v: `Nota: ${fuera.tramites} trámites del periodo (prima total $${fuera.prima_total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}) no entran en este reporte porque su ramo y movimiento no están parametrizados.`,
      s: ESTILOS.nota,
    });
    merges.push({ s: { r, c: 0 }, e: { r, c: ultima } });
    r++;
  }

  ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: ultima } });
  ws["!merges"] = merges;
  ws["!rows"] = alturas;
  ws["!cols"] = columnas.map((col, c) => {
    const mayor = Math.max(
      col.t.length,
      ...reporte.filas.map((f) => String(col.v(f) ?? "").length),
      col.moneda ? 14 : 0
    );
    return { wch: Math.min(Math.max(mayor + 2, 12), 40) };
  });
  return ws;
};

/**
 * Hoja de detalle: un renglón por trámite, con su comisión, como en la hoja de cálculo original.
 * Com. Total de cada renglón y los totales son fórmulas de suma: se recalculan si editan una cifra.
 * Tiene filtros en el encabezado.
 */
export const construirHojaDetalle = (reporte, nombreAfianzadora) => {
  const conAfianzadora = reporte.afianzadora_id == null;
  const texto = (v) => ({ get: v });
  const dinero = (v, suma) => ({ moneda: true, get: v, suma });
  const columnas = [
    ...(conAfianzadora ? [{ titulo: "Afianzadora", ...texto((d) => d.afianzadora_nombre) }] : []),
    { titulo: "Folio", ...texto((d) => d.folio) },
    { titulo: "Fecha término", ...texto((d) => fechaDMA(d.fecha_termino)) },
    { titulo: "Fecha pago", ...texto((d) => fechaDMA(d.fecha_pago)) },
    { titulo: "Cliente", ...texto((d) => d.cliente_nombre) },
    { titulo: "Ramo", ...texto((d) => d.ramo_nombre) },
    { titulo: "Tipo de fianza", ...texto((d) => d.tipo_fianza_nombre) },
    { titulo: "Mov.", ...texto((d) => d.movimiento_nombre) },
    { titulo: "Prima Total", ...dinero((d) => d.prima_total, "prima") },
    { titulo: "% Comisión", porcentaje: true, get: (d) => d.porcentaje_comision },
    { titulo: "Comisión", ...dinero((d) => d.comision, "comision") },
    { titulo: "Gtos. Exp.", ...dinero((d) => d.gasto_expedicion, "gasto") },
    { titulo: "Comisión P.P.", ...dinero((d) => d.comision_pronto_pago, "pp") },
    { titulo: "Tipo Bono", ...texto((d) => (d.pronto_pago ? "Pronto pago" : "")) },
    { titulo: "Com. Total", ...dinero((d) => d.comision_total, "total"), esTotal: true },
  ];
  const ultima = columnas.length - 1;
  const indice = (suma) => columnas.findIndex((c) => c.suma === suma);
  const letra = (suma) => XLSX.utils.encode_col(indice(suma));

  const ws = {};
  const merges = [];
  const alturas = [];
  const poner = (r, c, celda) => {
    ws[XLSX.utils.encode_cell({ r, c })] = celda;
  };

  let r = 0;
  for (let c = 0; c <= ultima; c++) poner(r, c, { t: "s", v: "", s: ESTILOS.titulo });
  poner(r, 0, { t: "s", v: "REPORTE DE COMISIONES · DETALLE POR TRÁMITE", s: ESTILOS.titulo });
  merges.push({ s: { r, c: 0 }, e: { r, c: ultima } });
  alturas[r] = { hpt: 26 };
  r++;
  poner(r, 0, {
    t: "s",
    v: `Afianzadora: ${nombreAfianzadora || "Todas"} · Periodo: ${fechaDMA(reporte.desde)} al ${fechaDMA(reporte.hasta)}`,
    s: ESTILOS.subtitulo,
  });
  merges.push({ s: { r, c: 0 }, e: { r, c: ultima } });
  r += 2;

  const filaEncabezado = r;
  columnas.forEach((col, c) => poner(r, c, { t: "s", v: col.titulo, s: ESTILOS_DETALLE.encabezado }));
  alturas[r] = { hpt: 30 };
  r++;

  const primera = r;
  for (const d of reporte.detalle) {
    columnas.forEach((col, c) => {
      const valor = col.get(d);
      if (col.esTotal) {
        // Com. Total = Comisión + Gtos. Exp. + Comisión P.P. (fórmula viva, con el valor ya calculado)
        poner(r, c, {
          t: "n",
          f: `SUM(${letra("comision")}${r + 1},${letra("gasto")}${r + 1},${letra("pp")}${r + 1})`,
          v: Number(valor) || 0,
          z: FORMATO_MONEDA,
          s: ESTILOS_DETALLE.monto,
        });
      } else if (col.moneda) {
        poner(r, c, { t: "n", v: Number(valor) || 0, z: FORMATO_MONEDA, s: ESTILOS_DETALLE.monto });
      } else if (col.porcentaje) {
        poner(r, c, { t: "n", v: Number(valor) || 0, z: FORMATO_PORC_DETALLE, s: ESTILOS_DETALLE.celda });
      } else {
        poner(r, c, { t: "s", v: String(valor ?? ""), s: ESTILOS_DETALLE.celda });
      }
    });
    r++;
  }
  const ultimaFila = r - 1;

  // Totales (SUMA) de las columnas de importe
  for (let c = 0; c <= ultima; c++) poner(r, c, { t: "s", v: "", s: ESTILOS_DETALLE.total });
  poner(r, 0, { t: "s", v: `TOTAL · ${reporte.detalle.length} trámites`, s: ESTILOS_DETALLE.total });
  columnas.forEach((col, c) => {
    if (!col.suma) return;
    const l = XLSX.utils.encode_col(c);
    const clave = { prima: "prima_total", comision: "comision", gasto: "gasto_expedicion", pp: "comision_pronto_pago", total: "comision_total" }[col.suma];
    poner(r, c, {
      t: "n",
      f: `SUM(${l}${primera + 1}:${l}${ultimaFila + 1})`,
      v: Number(reporte.totales[clave]) || 0,
      z: FORMATO_MONEDA,
      s: { ...ESTILOS_DETALLE.total, ...MONTO },
    });
  });
  r++;

  ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: ultima } });
  ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: filaEncabezado, c: 0 }, e: { r: ultimaFila, c: ultima } }) };
  ws["!merges"] = merges;
  ws["!rows"] = alturas;
  ws["!cols"] = columnas.map((col) => {
    const mayor = Math.max(col.titulo.length, ...reporte.detalle.map((d) => String(col.get(d) ?? "").length), col.moneda ? 14 : 0);
    return { wch: Math.min(Math.max(mayor + 2, 11), 38) };
  });
  return ws;
};

export const exportarReporteComisiones = ({ reporte, nombreAfianzadora }) => {
  if (!reporte?.filas?.length) return { vacio: true };

  const libro = XLSX.utils.book_new();
  if (reporte.detalle?.length) {
    XLSX.utils.book_append_sheet(libro, construirHojaDetalle(reporte, nombreAfianzadora), "Detalle");
  }
  XLSX.utils.book_append_sheet(libro, construirHojaComisiones(reporte, nombreAfianzadora), "Resumen");

  const quien = nombreAfianzadora ? limpiarNombre(nombreAfianzadora) : "Todas";
  const archivo = `Reporte_comisiones_${quien}_${dmy(reporte.desde)}_al_${dmy(reporte.hasta)}.xlsx`;
  XLSX.writeFile(libro, archivo);
  return { vacio: false, archivo };
};