// Se usa xlsx-js-style (misma API que xlsx) porque xlsx a secas no guarda colores ni negritas.
import * as XLSX from "xlsx-js-style";
import { obtenerTramitesParaExcel } from "@/features/dashboard/services/kpi.service";

const MESES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

// Nombres de columna que entrega tramites_excel
const COLUMNA_FECHA = "Fecha de término";
const COLUMNA_PRIMA = "Prima total";
const COLUMNA_FOLIO = "Folio";
const SIN_FECHA = "sin-fecha";
const FORMATO_MONEDA = '"$"#,##0.00';

const linea = { style: "thin", color: { rgb: "94A3B8" } };
const ESTILOS = {
  mes: {
    font: { bold: true, sz: 13, color: { rgb: "FFFFFF" } },
    fill: { patternType: "solid", fgColor: { rgb: "1E3A8A" } },
    alignment: { vertical: "center" },
  },
  encabezado: {
    font: { bold: true },
    fill: { patternType: "solid", fgColor: { rgb: "DBEAFE" } },
    border: { bottom: linea },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
  },
  total: {
    font: { bold: true },
    fill: { patternType: "solid", fgColor: { rgb: "E2E8F0" } },
    border: { top: linea },
  },
  totalGeneral: {
    font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
    fill: { patternType: "solid", fgColor: { rgb: "0F766E" } },
  },
};

const ALINEAR_MONTO = { alignment: { horizontal: "right", indent: 1 } };

const limpiarNombre = (texto) => texto.replace(/[\\/:*?"<>|]/g, "").trim();
const dmy = (iso) => iso.split("-").reverse().join("-");
const centavos = (valor) => Math.round((Number(valor) || 0) * 100);

export const tituloMes = (clave) => {
  if (clave === SIN_FECHA) return "SIN FECHA DE TÉRMINO";
  const [anio, mes] = clave.split("-").map(Number);
  return `${MESES[mes - 1]} ${anio}`;
};

/**
 * Agrupa los trámites por mes de término (AAAA-MM), de enero a diciembre.
 * Los que no traen fecha van al final. Dentro de cada mes: por fecha y luego folio.
 */
export const agruparPorMes = (filas) => {
  const grupos = new Map();
  for (const fila of filas) {
    const fecha = String(fila[COLUMNA_FECHA] ?? "");
    const clave = /^\d{4}-\d{2}/.test(fecha) ? fecha.slice(0, 7) : SIN_FECHA;
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(fila);
  }

  const claves = [...grupos.keys()].sort((a, b) => {
    if (a === SIN_FECHA) return 1;
    if (b === SIN_FECHA) return -1;
    return a.localeCompare(b);
  });

  return claves.map((clave) => ({
    clave,
    titulo: tituloMes(clave),
    filas: grupos.get(clave).sort(
      (a, b) =>
        String(a[COLUMNA_FECHA] ?? "").localeCompare(String(b[COLUMNA_FECHA] ?? "")) ||
        String(a[COLUMNA_FOLIO] ?? "").localeCompare(String(b[COLUMNA_FOLIO] ?? ""))
    ),
  }));
};

// El backend manda el texto "None" cuando un dato está vacío
const textoCelda = (valor) => {
  if (valor === null || valor === undefined || valor === "None") return "";
  return valor;
};

/**
 * Hoja con una sección por mes:
 *   MARZO 2026                      (banda de color con el mes)
 *   Folio | Fecha | ... | Prima total (encabezados)
 *   trámites del mes...
 *   Total MARZO 2026 · N trámites     $ suma   (fórmula SUMA, se recalcula si editan)
 * y al final el total general.
 */
export const construirHojaPorMes = (filas) => {
  const columnas = Object.keys(filas[0]);
  const ultima = columnas.length - 1;
  const colPrima = columnas.indexOf(COLUMNA_PRIMA);
  const letraPrima = XLSX.utils.encode_col(colPrima);

  const ws = {};
  const merges = [];
  const alturas = [];
  const resumen = [];
  const celdaTotalMes = [];
  let r = 0;

  const poner = (fila, col, celda) => {
    ws[XLSX.utils.encode_cell({ r: fila, c: col })] = celda;
  };
  // Pinta toda la fila del color de la sección, para que la banda cubra el ancho completo
  const banda = (fila, estilo) => {
    for (let c = 0; c <= ultima; c++) poner(fila, c, { t: "s", v: "", s: estilo });
  };
  const filaTotal = (titulo, texto, formula, valor, estilo) => {
    banda(r, estilo);
    poner(r, 0, { t: "s", v: texto, s: estilo });
    if (colPrima > 0) merges.push({ s: { r, c: 0 }, e: { r, c: colPrima - 1 } });
    poner(r, colPrima, { t: "n", f: formula, v: valor, z: FORMATO_MONEDA, s: { ...estilo, ...ALINEAR_MONTO } });
  };

  for (const grupo of agruparPorMes(filas)) {
    // Encabezado con el mes
    banda(r, ESTILOS.mes);
    poner(r, 0, { t: "s", v: grupo.titulo, s: ESTILOS.mes });
    merges.push({ s: { r, c: 0 }, e: { r, c: ultima } });
    alturas[r] = { hpt: 24 };
    r++;

    // Encabezados de columna
    columnas.forEach((nombre, c) => poner(r, c, { t: "s", v: nombre, s: ESTILOS.encabezado }));
    r++;

    // Trámites del mes
    const primera = r;
    for (const fila of grupo.filas) {
      columnas.forEach((nombre, c) => {
        const valor = textoCelda(fila[nombre]);
        if (nombre === COLUMNA_PRIMA) {
          poner(r, c, { t: "n", v: Number(valor) || 0, z: FORMATO_MONEDA, s: ALINEAR_MONTO });
        } else if (typeof valor === "number") {
          poner(r, c, { t: "n", v: valor });
        } else {
          poner(r, c, { t: "s", v: String(valor) });
        }
      });
      r++;
    }
    const ultimaFila = r - 1;

    // Total de prima del mes (en centavos para no arrastrar errores de decimales)
    const total = grupo.filas.reduce((suma, f) => suma + centavos(f[COLUMNA_PRIMA]), 0) / 100;
    const n = grupo.filas.length;
    filaTotal(
      grupo.titulo,
      `Total ${grupo.titulo} · ${n} ${n === 1 ? "trámite" : "trámites"}`,
      `SUM(${letraPrima}${primera + 1}:${letraPrima}${ultimaFila + 1})`,
      total,
      ESTILOS.total
    );
    celdaTotalMes.push(`${letraPrima}${r + 1}`);
    resumen.push({ clave: grupo.clave, titulo: grupo.titulo, tramites: n, total });
    r += 2; // fila de total + una fila en blanco
  }

  // Total general
  const totalGeneral = resumen.reduce((suma, m) => suma + Math.round(m.total * 100), 0) / 100;
  const nGeneral = resumen.reduce((suma, m) => suma + m.tramites, 0);
  filaTotal(
    "TOTAL GENERAL",
    `TOTAL GENERAL · ${nGeneral} ${nGeneral === 1 ? "trámite" : "trámites"}`,
    `SUM(${celdaTotalMes.join(",")})`,
    totalGeneral,
    ESTILOS.totalGeneral
  );
  r++;

  ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: ultima } });
  ws["!merges"] = merges;
  ws["!rows"] = alturas;
  ws["!cols"] = columnas.map((nombre) => {
    const mayor = Math.max(
      nombre.length,
      ...filas.map((f) => String(textoCelda(f[nombre])).length)
    );
    return { wch: Math.min(Math.max(mayor + 2, 12), 45) };
  });

  return { ws, resumen, totalGeneral };
};

/**
 * Descarga los trámites del periodo que se está viendo (rango o año completo) como Excel,
 * separados por mes y con el total de prima de cada mes.
 * `nombreAfianzadora` es el nombre tal como lo guardan los trámites (así filtra el backend).
 * Sin nombre exporta todas las afianzadoras.
 */
export const exportarTramitesExcel = async ({ desde, hasta, personalizado, nombreAfianzadora = null }) => {
  const datos = await obtenerTramitesParaExcel(desde, hasta, nombreAfianzadora);

  if (!Array.isArray(datos)) {
    throw new Error(datos?.error || "El servidor devolvió una respuesta inesperada.");
  }
  if (datos.length === 0) return { vacio: true, total: 0 };

  const { ws, resumen, totalGeneral } = construirHojaPorMes(datos);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, ws, "Trámites");

  const periodo = personalizado ? `${dmy(desde)}_al_${dmy(hasta)}` : desde.slice(0, 4);
  const archivo = `${nombreAfianzadora ? `${limpiarNombre(nombreAfianzadora)}_` : ""}Tramites_${periodo}.xlsx`;
  XLSX.writeFile(libro, archivo);

  return { vacio: false, total: datos.length, archivo, resumen, totalGeneral };
};