import React, { useEffect, useState } from "react";
import {
  Search,
  X,
  Loader2,
  FilePlus2,
  AlertTriangle,
  Clock,
  Hourglass,
  Banknote,
  BadgeCheck,
  FileText,
  FileCheck,
  Receipt,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";
import { FiChevronDown } from "react-icons/fi";
import { Toaster } from "sonner";
import {
  obtenerTramites,
  datosTramites,
  getFacturas,
  getPagados,
  getAfianzadoras,
} from "@/features/rpp/services/rpp";
import { AsignarAgente } from "@/features/rpp/components/modals/AsignarAgente";
import AprobarTramite from "@/features/rpp/components/modals/AprobarTramite";
import EnviarFactura from "@/features/rpp/components/modals/EnviarFactura";
import AjustarPrecio from "@/features/rpp/components/modals/AjustarPrecio";
import CancelarTramite from "@/features/rpp/components/modals/CancelarTramite";
import EditarTramite from "@/features/rpp/components/modals/EditarTramite";
import EliminarTramite from "@/features/rpp/components/modals/EliminarTramite";
import { statusStylesRPP } from "@/shared/utils/Constans";

const BASE_URL = "https://bitacorabc.site/Backend_RPP/";

// Tiles de estatus (hacen de filtro). `count` = clave en datosTramites().
const TILES = [
  { estado: "NUEVO", label: "Nuevos", count: "nuevo", Icon: FilePlus2 },
  { estado: "CORRECCION", label: "Corrección", count: "correccion", Icon: AlertTriangle },
  { estado: "EN PROCESO", label: "En proceso", count: "en_proceso_count", Icon: Clock },
  {
    estado: "EN ESPERA DE APROBACION",
    label: "En espera de aprobación",
    count: "error_count",
    Icon: Hourglass,
  },
  { estado: "ESPERANDO PAGO", label: "Esperando pago", count: "esperando_pago", Icon: Banknote },
  { estado: "FINALIZADO", label: "Finalizados", count: "terminado_count", Icon: BadgeCheck },
];

// Documentos por trámite. `path` = prefijo de carpeta en el servidor.
const DOCS = [
  { key: "url_archivo", label: "Archivo", path: "uploads/", Icon: FileText, color: "text-blue-700 hover:bg-blue-50" },
  { key: "url_cert_revisado", label: "Certificado", path: "uploads/", Icon: FileCheck, color: "text-green-700 hover:bg-green-50" },
  { key: "url_pago", label: "Comprobante de pago", path: "uploads/", Icon: Receipt, color: "text-amber-700 hover:bg-amber-50" },
  { key: "url_factura", label: "Factura", path: "", Icon: FileSpreadsheet, color: "text-purple-700 hover:bg-purple-50" },
  { key: "url_xml", label: "XML", path: "uploads/", Icon: FileCode, color: "text-red-700 hover:bg-red-50" },
];

const money = (n) =>
  (Number(n) || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

const sentence = (s = "") =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

export default function TableRpp() {
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [datos, setDatosTramites] = useState({});
  const [facturasAgrupadas, setFacturasAgrupadas] = useState({});
  const [facturasPagadas, setFacturasPagadas] = useState([]);
  const [afianzadoras, setAfianzadoras] = useState([]);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [afianzadoraSel, setAfianzadorasSel] = useState("");
  const [filtro, setFiltro] = useState("");
  const [fechaSel, setFechaSel] = useState("");
  const [afianzadora, setAfianzadora] = useState("");
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);

  // Selección y modales
  const [selected, setSelected] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDialogAprobar, setShowDialogAprobar] = useState(false);
  const [showDialogFactura, setShowDialogFactura] = useState(false);
  const [showDialogBorrar, setShowDialogBorrar] = useState(false);
  const [showDialogCan, setShowDialogCan] = useState(false);
  const [enableInput, setEnableInput] = useState(false);
  const [editarTramite, setEditarTramite] = useState(false);
  const [idTramite, setID] = useState(false);

  // Carga inicial: todas las peticiones en paralelo; si una falla, las demás siguen
  useEffect(() => {
    let activo = true;
    (async () => {
      const [fact, pag, afz, dat, tram] = await Promise.allSettled([
        getFacturas(),
        getPagados(),
        getAfianzadoras(),
        datosTramites(),
        obtenerTramites(),
      ]);
      if (!activo) return;

      if (fact.status === "fulfilled" && Array.isArray(fact.value)) {
        setFacturasAgrupadas(
          fact.value.reduce((acc, item) => {
            (acc[item.afianzadora] = acc[item.afianzadora] || []).push(item);
            return acc;
          }, {}),
        );
      }
      if (pag.status === "fulfilled" && Array.isArray(pag.value))
        setFacturasPagadas(pag.value);
      if (afz.status === "fulfilled" && Array.isArray(afz.value))
        setAfianzadoras(afz.value);
      if (dat.status === "fulfilled" && dat.value) setDatosTramites(dat.value);
      if (tram.status === "fulfilled" && Array.isArray(tram.value))
        setTramites(tram.value);

      [fact, pag, afz, dat, tram].forEach((r) => {
        if (r.status === "rejected")
          console.error("Error al obtener datos RPP:", r.reason);
      });
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
  }, []);

  // --- Selección ---
  const handleCheckboxChange = (id, estatus, costo) => {
    setSelected((prev) =>
      prev.some((item) => item.id === id)
        ? prev.filter((item) => item.id !== id)
        : [...prev, { id, estatus, costo }],
    );
  };

  // --- Filtrado (misma lógica de antes) ---
  const filteredClientes = tramites
    .filter((dato) => {
      if (!dato.folio_re) return true;
      return dato.folio_re.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .filter((c) => (afianzadoraSel ? c.afianzadora === afianzadoraSel : true))
    .filter((c) => (filtro ? c.estatus === filtro : true))
    .filter((c) => (afianzadora ? c.afianzadora === afianzadora : true))
    .filter((dato) => {
      const fecha = String(fechaSel).trim();
      if (!fecha) return true;
      return dato.fecha_factura === fecha;
    });

  const todosSeleccionados =
    filteredClientes.length > 0 &&
    filteredClientes.every((t) => selected.some((s) => s.id === t.id));

  const toggleTodos = () => {
    if (todosSeleccionados) {
      const ids = new Set(filteredClientes.map((t) => t.id));
      setSelected((prev) => prev.filter((s) => !ids.has(s.id)));
    } else {
      setSelected((prev) => {
        const ya = new Set(prev.map((s) => s.id));
        return [
          ...prev,
          ...filteredClientes
            .filter((t) => !ya.has(t.id))
            .map((t) => ({ id: t.id, estatus: t.estatus, costo: t.costo_tramite })),
        ];
      });
    }
  };

  const totalGeneral = Object.values(facturasAgrupadas)
    .flat()
    .reduce((sum, item) => sum + parseFloat(item.total), 0);
  const totalPagadas = Object.values(facturasPagadas)
    .flat()
    .reduce((sum, item) => sum + parseFloat(item.total), 0);

  // Filtros activos (se muestran como chips removibles)
  const activos = [
    searchQuery && { k: "q", label: `Folio: ${searchQuery}`, clear: () => setSearchQuery("") },
    afianzadoraSel && { k: "afs", label: `Afianzadora: ${afianzadoraSel}`, clear: () => setAfianzadorasSel("") },
    filtro && { k: "est", label: `Estatus: ${sentence(filtro)}`, clear: () => setFiltro("") },
    fechaSel && { k: "fec", label: `Factura: ${fechaSel}`, clear: () => setFechaSel("") },
    afianzadora && { k: "afz", label: `Afianzadora: ${afianzadora}`, clear: () => setAfianzadora("") },
  ].filter(Boolean);

  // Antes solo reiniciaba 3 de los 5 filtros; ahora limpia todos
  const limpiarFiltros = () => {
    setSearchQuery("");
    setAfianzadorasSel("");
    setFiltro("");
    setFechaSel("");
    setAfianzadora("");
    setTramiteSeleccionado(null);
  };

  const seleccionarTile = (estado) => {
    setFiltro((prev) => (prev === estado ? "" : estado));
    setFechaSel("");
    setAfianzadora("");
  };

  const abrirEdicion = (id) => {
    setEditarTramite(true);
    setID(id);
  };

  // Acciones masivas disponibles según los estatus seleccionados
  const hayAcciones = selected.length > 0;
  const puedeFacturar = selected.every((i) => i.estatus === "APROBADO");
  const puedeAsignar = selected.every((i) => i.estatus === "NUEVO");
  const puedeEnviar = selected.every(
    (i) => i.estatus === "EN REVISION" || i.estatus === "EN PROCESO",
  );
  const noCancelados = selected.every((i) => i.estatus != "CANCELADO");

  const btnPrimary =
    "h-11 whitespace-nowrap rounded-[10px] bg-[#003f4f] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#002b36] focus:outline-none focus:ring-2 focus:ring-white";
  const btnDanger =
    "h-11 whitespace-nowrap rounded-[10px] border border-red-300 bg-white px-4 text-sm font-semibold text-red-800 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-700";
  const btnNeutral =
    "h-11 whitespace-nowrap rounded-[10px] border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#003f4f]";

  return (
    <div className="space-y-5">
      {/* TILES DE ESTATUS */}
      <section
        aria-label="Resumen por estatus"
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
      >
        {TILES.map(({ estado, label, count, Icon }) => {
          const on = filtro === estado;
          return (
            <button
              key={estado}
              type="button"
              aria-pressed={on}
              onClick={() => seleccionarTile(estado)}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#003f4f] focus:ring-offset-2 ${
                on
                  ? "border-[#003f4f] bg-[#003f4f] text-white"
                  : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  on ? "bg-white/15 text-white" : "bg-gray-100 text-[#003f4f]"
                }`}
              >
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-2xl font-bold leading-tight tabular-nums">
                  {datos[count] ?? "—"}
                </span>
                <span
                  className={`block text-[13px] leading-snug ${
                    on ? "text-white/90" : "text-gray-600"
                  }`}
                >
                  {label}
                </span>
              </span>
            </button>
          );
        })}
      </section>

      {/* PAGOS */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section
          aria-label="Trámites por pagar"
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-bold text-gray-900">Trámites por pagar</h2>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-800 ring-1 ring-red-200">
              Pendiente
            </span>
          </div>
          <div className="max-h-72 space-y-4 overflow-y-auto px-5 py-4">
            {Object.keys(facturasAgrupadas).length === 0 && (
              <p className="text-sm text-gray-600">Sin facturas pendientes.</p>
            )}
            {Object.keys(facturasAgrupadas).map((afz) => (
              <div key={afz}>
                <h3 className="mb-1 text-sm font-bold text-gray-900">{afz}</h3>
                <ul>
                  {facturasAgrupadas[afz].map((item, index) => {
                    const on =
                      fechaSel === item.fecha_factura && afianzadora === item.afianzadora;
                    return (
                      <li key={`${item.fecha_factura}-${index}`}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => {
                            setFechaSel(item.fecha_factura);
                            setFiltro("");
                            setAfianzadora(item.afianzadora);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#003f4f] ${
                            on ? "bg-[#e6f0f2]" : "hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-gray-700">
                            Factura de {item.fecha_factura}
                          </span>
                          <span className="font-semibold tabular-nums text-gray-900">
                            {money(item.total)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-4">
            <span className="font-semibold text-red-800">Monto total</span>
            <span className="text-2xl font-bold tabular-nums text-red-800">
              {money(totalGeneral)}
            </span>
          </div>
        </section>

        <section
          aria-label="Trámites pagados"
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-bold text-gray-900">Trámites pagados</h2>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800 ring-1 ring-green-200">
              Completado
            </span>
          </div>
          <div className="space-y-4 px-5 py-4">
            <div>
              <label
                htmlFor="tramite-select"
                className="mb-1.5 block text-sm font-semibold text-gray-800"
              >
                Seleccionar factura pagada
              </label>
              <div className="relative">
                <select
                  id="tramite-select"
                  value={tramiteSeleccionado?.fecha_factura || ""}
                  onChange={(e) => {
                    const fecha = e.target.value;
                    const tramite = facturasPagadas.find(
                      (t) => t.fecha_factura === fecha,
                    );
                    setTramiteSeleccionado(tramite || null);
                    setFechaSel(tramite?.fecha_factura || "");
                    setFiltro(tramite?.estatus || "");
                    setAfianzadora(tramite?.afianzadora || "");
                  }}
                  className="h-11 w-full cursor-pointer appearance-none rounded-[10px] border border-gray-300 bg-white pl-3 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003f4f]"
                >
                  <option value="">Selecciona una opción</option>
                  {facturasPagadas.map((tramite) => (
                    <option key={tramite.fecha_factura} value={tramite.fecha_factura}>
                      {tramite.afianzadora} {tramite.fecha_factura}
                    </option>
                  ))}
                </select>
                <FiChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

            <dl className="space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Afianzadora</dt>
                <dd className="font-medium text-gray-900">
                  {tramiteSeleccionado?.afianzadora || "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Fecha de pago</dt>
                <dd className="font-medium text-gray-900">
                  {tramiteSeleccionado?.fecha_factura || "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Monto</dt>
                <dd className="text-lg font-semibold tabular-nums text-green-800">
                  {money(tramiteSeleccionado?.total)}
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-4">
            <span className="font-semibold text-green-800">Total pagado</span>
            <span className="text-2xl font-bold tabular-nums text-green-800">
              {money(totalPagadas)}
            </span>
          </div>
        </section>
      </div>

      {/* FILTROS */}
      <section
        aria-label="Filtros"
        className="space-y-3 rounded-2xl border border-gray-200 bg-white px-5 py-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              id="user"
              type="search"
              aria-label="Buscar por folio"
              placeholder="Buscar por folio"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#003f4f]"
            />
          </div>

          <div className="relative w-full sm:w-[260px]">
            <select
              aria-label="Afianzadora"
              value={afianzadoraSel}
              onChange={(e) => setAfianzadorasSel(e.target.value)}
              className="h-11 w-full cursor-pointer appearance-none rounded-[10px] border border-gray-300 bg-white pl-3 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003f4f]"
            >
              <option value="">Todas las afianzadoras</option>
              {afianzadoras.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
            <FiChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>

          {activos.length > 0 && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="h-11 whitespace-nowrap rounded-md px-2 text-sm font-medium text-gray-700 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003f4f]"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {activos.length > 0 && (
          <ul className="flex flex-wrap items-center gap-2" aria-label="Filtros activos">
            {activos.map((f) => (
              <li key={f.k}>
                <button
                  type="button"
                  onClick={f.clear}
                  aria-label={`Quitar filtro ${f.label}`}
                  className="flex h-8 items-center gap-1.5 rounded-full border border-[#003f4f] bg-[#e6f0f2] pl-3 pr-2 text-[13px] font-semibold text-[#003f4f] transition-colors hover:bg-[#d5e6ea] focus:outline-none focus:ring-2 focus:ring-[#003f4f]"
                >
                  {f.label}
                  <X size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* TABLA */}
      <section
        aria-label="Lista de trámites RPP"
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                <th className="w-12 px-4 py-3.5">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos los trámites visibles"
                    className="h-5 w-5 cursor-pointer rounded accent-[#003f4f]"
                    checked={todosSeleccionados}
                    onChange={toggleTodos}
                  />
                </th>
                <th className="px-4 py-3.5">Folio / Fecha</th>
                <th className="px-4 py-3.5">Trámite / Propietario</th>
                <th className="px-4 py-3.5">Afianzadora</th>
                <th className="px-4 py-3.5">Estatus</th>
                <th className="px-4 py-3.5 text-right">Costo</th>
                <th className="px-4 py-3.5">Agente</th>
                <th className="px-4 py-3.5">Observaciones</th>
                <th className="px-4 py-3.5">Factura</th>
                <th className="px-4 py-3.5">Documentos</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      Cargando trámites...
                    </div>
                  </td>
                </tr>
              ) : filteredClientes.length > 0 ? (
                filteredClientes.map((tramite) => {
                  const isSel = selected.some((s) => s.id === tramite.id);
                  return (
                    <tr
                      key={tramite.id}
                      className={`border-b border-gray-100 transition-colors last:border-0 ${
                        isSel ? "bg-[#e6f0f2]" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          aria-label={`Seleccionar trámite ${tramite.folio_re || tramite.id}`}
                          className="h-5 w-5 cursor-pointer rounded accent-[#003f4f]"
                          checked={isSel}
                          onChange={() =>
                            handleCheckboxChange(
                              tramite.id,
                              tramite.estatus,
                              tramite.costo_tramite,
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => abrirEdicion(tramite.id)}
                          className="block rounded text-left focus:outline-none focus:ring-2 focus:ring-[#003f4f]"
                        >
                          <span className="block whitespace-nowrap font-bold text-[#003f4f]">
                            {tramite.folio_re || "Sin folio"}
                          </span>
                          <span className="block whitespace-nowrap text-xs text-gray-600">
                            {tramite.fecha_solicitud}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => abrirEdicion(tramite.id)}
                          className="block max-w-[320px] rounded text-left focus:outline-none focus:ring-2 focus:ring-[#003f4f]"
                        >
                          <span className="block font-semibold text-gray-900">
                            {tramite.tramite_solicitado}
                          </span>
                          <span className="block text-[13px] text-gray-600">
                            {tramite.nombre_propietario_empresa}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">{tramite.afianzadora}</td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={
                            statusStylesRPP[tramite.estatus] ||
                            "rounded-full bg-gray-200 px-3 py-1 text-[13px] font-semibold text-gray-700"
                          }
                        >
                          {sentence(tramite.estatus)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold tabular-nums text-green-800">
                        {money(tramite.costo_tramite)}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">{tramite.agente}</td>
                      <td className="px-4 py-3.5">
                        <p
                          className="line-clamp-2 max-w-[260px] text-gray-700"
                          title={tramite.observaciones || undefined}
                        >
                          {tramite.observaciones || "—"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-gray-700">
                        {tramite.fecha_factura || "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          {DOCS.map(({ key, label, path, Icon, color }) => {
                            const url = tramite[key];
                            return (
                              <button
                                key={key}
                                type="button"
                                disabled={!url}
                                onClick={() =>
                                  window.open(`${BASE_URL}${path}${url}`, "_blank")
                                }
                                aria-label={url ? label : `${label} (no disponible)`}
                                title={url ? label : `${label} (no disponible)`}
                                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#003f4f] ${
                                  url ? color : "cursor-not-allowed text-gray-300"
                                }`}
                              >
                                <Icon size={18} aria-hidden="true" />
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-600">
                    No se encontraron trámites.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* BARRA DE ACCIONES MASIVAS (reemplaza los 5 botones flotantes sueltos) */}
      {hayAcciones && (
        <div className="sticky bottom-4 z-30 flex justify-center px-2">
          <div
            role="toolbar"
            aria-label="Acciones sobre trámites seleccionados"
            className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-gray-700 bg-gray-900 p-3 shadow-2xl"
          >
            <span className="px-2 text-sm font-semibold text-white">
              {selected.length} seleccionado{selected.length === 1 ? "" : "s"}
            </span>
            {puedeAsignar && (
              <button type="button" className={btnPrimary} onClick={() => setShowDialog(true)}>
                Asignar
              </button>
            )}
            {puedeEnviar && (
              <button type="button" className={btnPrimary} onClick={() => setShowDialogAprobar(true)}>
                Enviar
              </button>
            )}
            {puedeFacturar && (
              <button type="button" className={btnPrimary} onClick={() => setShowDialogFactura(true)}>
                Enviar factura
              </button>
            )}
            {noCancelados && (
              <button type="button" className={btnNeutral} onClick={() => setEnableInput(true)}>
                Ajustar costo
              </button>
            )}
            {noCancelados && (
              <button type="button" className={btnDanger} onClick={() => setShowDialogCan(true)}>
                Cancelar
              </button>
            )}
            <button type="button" className={btnDanger} onClick={() => setShowDialogBorrar(true)}>
              Eliminar
            </button>
            <button
              type="button"
              onClick={() => setSelected([])}
              aria-label="Limpiar selección"
              title="Limpiar selección"
              className="flex h-11 w-11 items-center justify-center rounded-[10px] text-gray-200 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* MODALES (sin cambios) */}
      {showDialog && (
        <AsignarAgente
          onClose={() => setShowDialog(false)}
          id_tramite={selected.map((item) => item.id)}
        />
      )}
      {showDialogAprobar && (
        <AprobarTramite
          onClose={() => setShowDialogAprobar(false)}
          id_tramite={selected.map((item) => item.id)}
        />
      )}
      {showDialogFactura && (
        <EnviarFactura
          onClose={() => setShowDialogFactura(false)}
          id_tramite={selected.map((item) => item.id)}
          costo={selected.map((item) => item.costo)}
        />
      )}
      {showDialogCan && (
        <CancelarTramite
          onClose={() => setShowDialogCan(false)}
          id_tramite={selected.map((item) => item.id)}
        />
      )}
      {enableInput && (
        <AjustarPrecio
          onClose={() => setEnableInput(false)}
          id_tramite={selected.map((item) => item.id)}
        />
      )}
      {editarTramite && (
        <EditarTramite
          onClose={() => setEditarTramite(false)}
          id_tramite={idTramite}
        />
      )}
      {showDialogBorrar && (
        <EliminarTramite
          onClose={() => setShowDialogBorrar(false)}
          id_tramite={selected.map((item) => item.id)}
        />
      )}
      <Toaster position="top-center" richColors />
    </div>
  );
}