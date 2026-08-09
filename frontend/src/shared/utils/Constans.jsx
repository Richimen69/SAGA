export const movimientos = [
  { value: "ACTUALIZACIÓN", label: "ACTUALIZACIÓN" },
  { value: "ALTA", label: "ALTA" },
  { value: "ANUENCIA", label: "ANUENCIA" },
  { value: "ANULACIÓN", label: "ANULACIÓN" },
  { value: "AUMENTO", label: "AUMENTO" },
  { value: "BAJA O.S.", label: "BAJA O.S." },
  { value: "CAMBIO DE AGENTE", label: "CAMBIO DE AGENTE" },
  {
    value: "CANCELACIÓN Y DEV. DEP. PREND.",
    label: "CANCELACIÓN Y DEV. DEP. PREND.",
  },
  { value: "CANCELACIÓN", label: "CANCELACIÓN" },
  { value: "CARTA LÍNEA AFIANZAMIENTO", label: "CARTA LÍNEA AFIANZAMIENTO" },
  { value: "CARTA TILDACIÓN", label: "CARTA TILDACIÓN" },
  { value: "CORRECCIÓN", label: "CORRECCIÓN" },
  { value: "COTIZACIÓN", label: "COTIZACIÓN" },
  { value: "DEV. DEP. EQUIVOCADO", label: "DEV. DEP. EQUIVOCADO" },
  { value: "DEV. NOTAS DE CRÉDITO", label: "DEV. NOTAS DE CRÉDITO" },
  { value: "DEVOLUCIÓN DEP. PREND.", label: "DEVOLUCIÓN DEP. PREND." },
  { value: "DISMINUCIÓN", label: "DISMINUCIÓN" },
  { value: "ENDOSO", label: "ENDOSO" },
  {
    value: "ENDOSO POR DIFERIMIENTO DE PLAZO",
    label: "ENDOSO POR DIFERIMIENTO DE PLAZO",
  },
  {
    value: "EXPEDICIÓN CON DEP. PRENDARIO",
    label: "EXPEDICIÓN CON DEP. PRENDARIO",
  },
  { value: "EXPEDICIÓN", label: "EXPEDICIÓN" },
  { value: "MOVIMIENTO ESPECIAL P-A", label: "MOVIMIENTO ESPECIAL P-A" },
  {
    value: "EXPEDICIÓN FIANZA-FIDELIDAD",
    label: "EXPEDICIÓN FIANZA-FIDELIDAD",
  },
  { value: "PRÓRROGA", label: "PRÓRROGA" },
  { value: "RECLAMACIÓN", label: "RECLAMACIÓN" },
  { value: "SEGUIMIENTO", label: "SEGUIMIENTO" },
  { value: "SEGURO MAQUINARIA", label: "SEGURO MAQUINARIA" },
  { value: "SEGURO RC", label: "SEGURO RC" },
];

export const estatus = [
  { value: "EN REVISIÓN DE DOCUMENTOS", label: "EN REVISIÓN DE DOCUMENTOS" },
  { value: "EN REVISIÓN DE PREVIAS", label: "EN REVISIÓN DE PREVIAS" },
  { value: "EN PROCESO/C.N.S.", label: "EN PROCESO/C.N.S." },
  { value: "EN PROCESO/CANCELACIÓN", label: "EN PROCESO/CANCELACIÓN" },
  { value: "EN PROCESO/C.T.T.", label: "EN PROCESO/C.T.T." },
  { value: "EN PROCESO/ACT EF", label: "EN PROCESO/ACT EF" },
  { value: "EN PROCESO/ACT CLG", label: "EN PROCESO/ACT CLG" },
  { value: "EN PROCESO/OTROS", label: "EN PROCESO/OTROS" },
  { value: "NO PROCEDE", label: "NO PROCEDE" },
  { value: "PENDIENTE/C.N.S.", label: "PENDIENTE/C.N.S." },
  { value: "PENDIENTE/CANCELACIÓN", label: "PENDIENTE/CANCELACIÓN" },
  { value: "PENDIENTE/C.T.T.", label: "PENDIENTE/C.T.T." },
  { value: "PENDIENTE/ACT EF", label: "PENDIENTE/ACT EF" },
  { value: "PENDIENTE/ACT CLG", label: "PENDIENTE/ACT CLG" },
  { value: "PENDIENTE/OTROS", label: "PENDIENTE/OTROS" },
  { value: "TERMINADO", label: "TERMINADO" },
  { value: "TERMINADO/COMPROMISO", label: "TERMINADO/COMPROMISO" },
  { value: "TERMINADO/PENDIENTE", label: "TERMINADO/PENDIENTE" },
];

export const estadoTramite = [
  { value: "AFIANZADORA", label: "AFIANZADORA" },
  { value: "BC", label: "BC" },
  { value: "FIADO", label: "FIADO" },
];
export const estadoTramiteAseguradora = [
  { value: "ASEGURADORA", label: "ASEGURADORA" },
  { value: "BC", label: "BC" },
  { value: "FIADO", label: "FIADO" },
];

export const agente = [
  { value: "RBG", label: "RBG" },
  { value: "RBG-PP", label: "RBG-PP" },
  { value: "RBG (FELIPE)", label: "RBG (FELIPE)" },
  { value: "BPS", label: "BPS" },
  { value: "LDP", label: "LDP" },
  { value: "RBG (GUSTAVO)", label: "RBG (GUSTAVO)" },
  { value: "RBG (RUBEN)", label: "RBG (RUBEN)" },
];

export const estatus_pagos = [
  { value: "SE MANDÓ RECIBO", label: "SE MANDÓ RECIBO" },
  { value: "NO PAGADA", label: "NO PAGADA" },
  { value: "PENDIENTE", label: "PENDIENTE" },
  { value: "NO APLICA", label: "NO APLICA" },
];

export const statusStyles = {
  // REVISIÓN
  "EN REVISIÓN DE DOCUMENTOS":
    "bg-orange-200 text-orange-900 px-3 py-1 rounded-full text-base font-semibold",
  "EN REVISIÓN DE PREVIAS":
    "bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full text-base font-semibold",

  // PROCESO
  "EN PROCESO/CANCELACIÓN":
    "bg-sky-200 text-sky-800 px-3 py-1 rounded-full text-base font-semibold",
  "EN PROCESO/C.N.S.":
    "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-base font-semibold",
  "EN PROCESO/C.T.T.":
    "bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-base font-semibold",
  "EN PROCESO/ACT EF":
    "bg-sky-200 text-sky-800 px-3 py-1 rounded-full text-base font-semibold",
  "EN PROCESO/ACT CLG":
    "bg-sky-300 text-sky-900 px-3 py-1 rounded-full text-base font-semibold",
  "EN PROCESO/OTROS":
    "bg-sky-300 text-sky-900 px-3 py-1 rounded-full text-base font-semibold",

  // TERMINADO
  TERMINADO:
    "bg-emerald-400 text-emerald-800 px-3 py-1 rounded-full text-base font-semibold",
  "TERMINADO/COMPROMISO":
    "bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-base font-semibold",
  "TERMINADO/PENDIENTE":
    "bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-base font-semibold",

  // NO PROCEDE
  "NO PROCEDE":
    "bg-rose-200 text-rose-700 px-3 py-1 rounded-full text-base font-semibold",

  // PENDIENTE
  "PENDIENTE/C.N.S.":
    "bg-violet-200 text-violet-800 px-3 py-1 rounded-full text-base font-semibold",
  "PENDIENTE/CANCELACIÓN":
    "bg-violet-200 text-violet-800 px-3 py-1 rounded-full text-base font-semibold",
  "PENDIENTE/C.T.T.":
    "bg-violet-300 text-violet-900 px-3 py-1 rounded-full text-base font-semibold",
  "PENDIENTE/ACT EF":
    "bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-base font-semibold",
  "PENDIENTE/ACT CLG":
    "bg-indigo-300 text-indigo-900 px-3 py-1 rounded-full text-base font-semibold",
  "PENDIENTE/OTROS":
    "bg-indigo-300 text-indigo-900 px-3 py-1 rounded-full text-base font-semibold",
};

export const statusStylesRPP = {
  NUEVO:
    "bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-base font-semibold",
  "EN PROCESO":
    "bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-base font-semibold",
  "EN REVISION":
    "bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-base font-semibold",
  "CORRECCION INTERNA":
    "bg-red-100 text-red-600 px-3 py-1 rounded-full text-base font-semibold",
  "EN ESPERA DE APROBACION":
    "bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-base font-semibold",
  CORRECCION:
    "bg-red-200 text-red-700 px-3 py-1 rounded-full text-base font-semibold",
  "ESPERANDO PAGO":
    "bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-base font-semibold",
  APROBADO:
    "bg-lime-100 text-lime-600 px-3 py-1 rounded-full text-base font-semibold",
  "FACTURA ENVIADA":
    "bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-base font-semibold",
  FINALIZADO:
    "bg-green-100 text-green-600 px-3 py-1 rounded-full text-base font-semibold",
  CANCELADO:
    "bg-red-600 text-red-100 px-3 py-1 rounded-full text-base font-semibold",
};

export const estatusRPP = [
  { value: "EN ESPERA DE APROBACION" },
  { value: "FINALIZADO" },
  { value: "EN PROCESO" },
  { value: "NUEVO" },
  { value: "EN REVISION" },
  { value: "APROBADO" },
  { value: "CORRECCION" },
  { value: "ESPERANDO PAGO" },
  { value: "CANCELADO" },
];
export const estatusTerminados = [
  16,
  17,
  18,
];

export const movimientosPermitidos = [
  5,
  1,
  9,
  24,
  22,
  27,
  28,
  21,
  23,
  20
];

