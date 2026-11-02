import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Toaster, toast } from "sonner";
import { FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MessageSquare, Pencil, Plus, Search } from "lucide-react";

// Hooks y Servicios
import { useUsuario, useCatalogos } from "../../hooks";
import {
  fetchTramites,
  actualizarEstatusTramite,
} from "../../services/tramites.service";
import {
  fetchMovimientos,
  fetchEstatus,
} from "../../services/catalogos.service";
import fetchApi from "@/shared/services/apiNew";

// Componentes
import FormularioTramite from "@/features/bitacora/components/forms/FormularioTramite";
import TramiteCliente from "../../pages/TramiteCliente";
import GestionObservaciones from "../../components/GestionObservaciones";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { statusStyles } from "@/shared/utils/Constans";

const FILTERS_PAGO = ["PAGADA", "SE MANDÓ RECIBO", "NO PAGADA", "PENDIENTE"];
const PAGE_SIZE = 50;

// Estatus con chip de acceso rápido (los más usados). Edita esta lista a tu gusto;
// el resto de estatus queda en el selector "Otros estatus".
const ESTATUS_RAPIDOS = [
  "EN REVISIÓN DE PREVIAS",
  "PENDIENTE/OTROS",
  "TERMINADO",
];

// --- Helpers de presentación ---
// "EN REVISIÓN DE PREVIAS" -> "En revisión de previas" (solo visual, el valor no cambia)
const sentence = (s = "") =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

const formatFecha = (fecha) => {
  if (!fecha) return "";
  try {
    return format(parseISO(fecha), "dd MMM yyyy", { locale: es });
  } catch (e) {
    return fecha;
  }
};

// Etiqueta de pago: borde de color + texto (el color nunca es la única señal)
const PAGO_STYLES = {
  PAGADA: "border-emerald-300 text-emerald-800",
  PENDIENTE: "border-amber-400 text-amber-900",
  "NO PAGADA": "border-red-300 text-red-800",
  "SE MANDÓ RECIBO": "border-sky-300 text-sky-800",
};

function PagoTag({ valor }) {
  if (!valor) return <span className="text-gray-500">—</span>;
  const style = PAGO_STYLES[valor];
  return style ? (
    <span
      className={`inline-block rounded-lg border bg-white px-3 py-1 text-[13px] font-semibold ${style}`}
    >
      {sentence(valor)}
    </span>
  ) : (
    <span className="text-[13px] font-medium text-gray-600">
      {sentence(valor)}
    </span>
  );
}

function SelectField({
  label,
  value,
  onChange,
  className = "",
  active = false,
  children,
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        aria-label={label}
        value={value}
        onChange={onChange}
        className={`h-11 w-full cursor-pointer appearance-none rounded-[10px] border bg-white pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f4f] ${
          active
            ? "border-[#003f4f] font-semibold text-[#003f4f]"
            : "border-gray-300 text-gray-800"
        }`}
      >
        {children}
      </select>
      <FiChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
      />
    </div>
  );
}

export default function TableTramites() {
  const navigate = useNavigate();
  const usuario = useUsuario();
  const { catalogos, loading: catalogosLoading } = useCatalogos();
  // --- Estado de datos ---
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [afianzadoras, setAfianzadoras] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [estatus, setEstatus] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // --- Estados para Modales ---
  const [modalEdicion, setModalEdicion] = useState({
    isOpen: false,
    tramiteId: null,
  });
  const [modalObservaciones, setModalObservaciones] = useState({
    isOpen: false,
    tramiteId: null,
  });

  // --- Estado de paginación ---
  const [pagination, setPagination] = useState({
    count: 0,
    currentPage: 1,
    totalPages: 0,
    next: null,
    previous: null,
  });

  // --- Estado de filtros ---
  const [filters, setFilters] = useState(() => ({
    search: localStorage.getItem("searchQuery") || "",
    numero_fianza: localStorage.getItem("searchQueryFianza") || "",
    movimiento: localStorage.getItem("movimientoFiltro") || "",
    estatus: localStorage.getItem("estatusFiltro") || "",
    estatus_pago: localStorage.getItem("pagoFilter") || "",
    agente_nombre: localStorage.getItem("agenteFiltro") || "",
    afianzadora_id: localStorage.getItem("afianzadoraFiltro") || "",
  }));

  // --- Cargar catálogos ---
  useEffect(() => {
    const loadCatalogos = async () => {
      try {
        const [movimientosData, estatusData] = await Promise.all([
          fetchMovimientos(),
          fetchEstatus(),
        ]);
        setMovimientos(
          Array.isArray(movimientosData)
            ? movimientosData
            : movimientosData?.results || [],
        );
        setEstatus(
          Array.isArray(estatusData) ? estatusData : estatusData?.results || [],
        );
      } catch (error) {
        console.error("Error al cargar catálogos:", error);
      }
    };
    loadCatalogos();
  }, []);

  useEffect(() => {
    if (catalogosLoading) return;
    setAfianzadoras(catalogos?.afianzadoras || []);
  }, [catalogos, catalogosLoading]);

  // --- Obtener trámites ---
  const obtenerTramites = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const data = await fetchTramites(page, filters);
        const resultados = Array.isArray(data)
          ? data
          : data?.data || data?.results || [];
        setTramites(resultados);
        setPagination({
          count: data?.count || 0,
          currentPage: page,
          totalPages: Math.ceil((data?.count || 0) / PAGE_SIZE),
          next: data?.next || null,
          previous: data?.previous || null,
        });
      } catch (error) {
        console.error("Error al obtener los trámites:", error);
        setTramites([]);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    obtenerTramites(1);
  }, [filters, obtenerTramites]);

  useEffect(() => {
    localStorage.setItem("searchQuery", filters.search);
    localStorage.setItem("searchQueryFianza", filters.numero_fianza);
    localStorage.setItem("movimientoFiltro", filters.movimiento);
    localStorage.setItem("estatusFiltro", filters.estatus);
    localStorage.setItem("pagoFilter", filters.estatus_pago);
    localStorage.setItem("afianzadoraFiltro", filters.afianzadora_id || "");
  }, [filters]);

  // --- Actualización de Estatus Inline ---
  const actualizarEstatusRapido = async (tramiteId, nuevoEstatusNombre) => {
    try {
      // 1. Buscar el ID del estatus seleccionado del catálogo
      const estatusObj = estatus.find((e) => e.nombre === nuevoEstatusNombre);
      if (!estatusObj) return;

      // 2. Usar tu servicio centralizado
      const response = await actualizarEstatusTramite(tramiteId, estatusObj.id);

      // Si tu fetchApi devuelve el error o no es exitoso
      if (response?.error) {
        throw new Error(response.error);
      }

      toast.success("Estatus actualizado exitosamente");
      obtenerTramites(pagination.currentPage); // Refresca la tabla para ver el cambio
    } catch (error) {
      toast.error(
        `Error al actualizar: ${error.message || "Fallo en el servidor"}`,
      );
      console.error("Detalle del error:", error);
    }
  };

  // --- Definición de Columnas para TanStack Table ---
  // meta.className = ancho/alineación aplicados al <th> y al <td>
  const columns = useMemo(
    () => [
      {
        accessorKey: "folio",
        header: "Folio",
        meta: { className: "w-[88px]" },
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-bold text-[#003f4f]">
            {row.original.folio}
          </span>
        ),
      },
      {
        id: "beneficiario",
        header: "Beneficiario / Fiado",
        meta: { className: "min-w-[260px]" },
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <p className="font-semibold text-gray-900">
              {row.original.beneficiario_nombre}
            </p>
            {row.original.cliente_nombre && (
              <p className="text-[13px] text-gray-600">
                Fiado: {row.original.cliente_nombre}
              </p>
            )}
          </div>
        ),
      },
      {
        id: "fianza",
        header: "Fianza",
        meta: { className: "min-w-[170px]" },
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <p className="whitespace-nowrap tabular-nums text-gray-900">
              {row.original.numero_fianza || "—"}
            </p>
            {row.original.afianzadora_nombre && (
              <p className="text-xs text-gray-600">
                {row.original.afianzadora_nombre}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "movimiento_nombre",
        header: "Movimiento",
        meta: { className: "w-[120px]" },
        cell: ({ row }) => (
          <span className="font-medium">
            {sentence(row.original.movimiento_nombre)}
          </span>
        ),
      },
      {
        accessorKey: "fecha",
        header: "Fecha",
        meta: { className: "w-[110px]" },
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums text-gray-700">
            {formatFecha(row.original.fecha)}
          </span>
        ),
      },
      {
        accessorKey: "estatus_nombre",
        header: "Estatus",
        meta: { className: "w-[210px]" },
        cell: ({ row }) => {
          const tramite = row.original;
          // Sigue siendo un <select> (edición inline), con apariencia de pastilla
          return (
            <div className="relative inline-flex items-center">
              <select
                aria-label={`Estatus del folio ${tramite.folio}`}
                className={`cursor-pointer appearance-none rounded-full py-1.5 pl-3 text-[13px] font-semibold outline-none focus:ring-2 focus:ring-[#003f4f] ${
                  statusStyles[tramite.estatus_nombre] ||
                  "bg-gray-200 text-gray-700"
                }`}
                style={{ paddingRight: "1.75rem" }}
                value={tramite.estatus_nombre}
                onChange={(e) =>
                  actualizarEstatusRapido(tramite.id, e.target.value)
                }
                onClick={(e) => e.stopPropagation()}
              >
                <option value={tramite.estatus_nombre}>
                  {sentence(tramite.estatus_nombre)}
                </option>
                {estatus
                  .filter((e) => e.nombre !== tramite.estatus_nombre)
                  .map((e) => (
                    <option key={e.id} value={e.nombre}>
                      {sentence(e.nombre)}
                    </option>
                  ))}
              </select>
              <FiChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-2 h-4 w-4 opacity-70"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "tipo_proceso",
        header: "Responsable",
        meta: { className: "w-[110px]" },
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[13px] font-semibold text-gray-700">
            {row.original.tipo_proceso || "—"}
          </span>
        ),
      },
      {
        accessorKey: "estatus_pago",
        header: "Pago",
        meta: { className: "w-[130px]" },
        cell: ({ row }) => <PagoTag valor={row.original.estatus_pago} />,
      },
      {
        id: "acciones",
        header: "Acciones",
        meta: { className: "w-[112px] text-right" },
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setModalObservaciones({
                  isOpen: true,
                  tramiteId: row.original.id,
                });
              }}
              aria-label={`Observaciones del folio ${row.original.folio}`}
              title="Ver/Agregar Observaciones"
              className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-gray-300 bg-white text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[#003f4f]"
            >
              <MessageSquare size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setModalEdicion({ isOpen: true, tramiteId: row.original.id });
              }}
              aria-label={`Editar folio ${row.original.folio}`}
              title="Edición completa"
              className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#003f4f] text-white transition-colors hover:bg-[#002b36] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003f4f]"
            >
              <Pencil size={20} aria-hidden="true" />
            </button>
          </div>
        ),
      },
    ],
    [estatus, pagination.currentPage],
  );

  // --- Instancia de TanStack Table ---
  const tramitesList = Array.isArray(tramites) ? tramites : [];
  const table = useReactTable({
    data: tramitesList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // --- Filtros Handlers ---
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSelectChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const limpiarFiltros = () => {
    setFilters({
      search: "",
      numero_fianza: "",
      movimiento: "",
      estatus: "",
      estatus_pago: "",
      agente_nombre: "",
      afianzadora_id: "",
    });
  };

  // Chips rápidos vs. resto de estatus (se comparan en mayúsculas)
  const esRapido = (nombre = "") =>
    ESTATUS_RAPIDOS.includes(nombre.toUpperCase());
  const estatusRapidos = estatus.filter((e) => esRapido(e.nombre));
  const estatusOtros = estatus.filter((e) => !esRapido(e.nombre));
  const estatusOtroActivo = estatusOtros.some(
    (e) => e.nombre === filters.estatus,
  );

  const hayFiltrosActivos = Object.values(filters).some((v) => v !== "");
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) obtenerTramites(page);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      {/* ENCABEZADO */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Trámites
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {pagination.count.toLocaleString()} trámites encontrados
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="h-11 whitespace-nowrap rounded-[10px] border border-gray-300 bg-white px-[18px] text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#003f4f]"
            onClick={() => navigate("/comparar-tramites")}
          >
            Comparar trámites
          </button>
          <button
            type="button"
            className="flex h-11 items-center gap-2 whitespace-nowrap rounded-[10px] bg-[#003f4f] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#002b36] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003f4f]"
            onClick={() => setIsFormVisible(true)}
          >
            <Plus size={18} aria-hidden="true" />
            Nuevo trámite
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <section
        aria-label="Filtros"
        className="space-y-4 rounded-2xl border border-gray-200 bg-white px-5 py-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="search"
              aria-label="Buscar por folio, fianza, fiado o beneficiario"
              placeholder="Buscar por folio, fianza, fiado o beneficiario"
              defaultValue={filters.search || filters.numero_fianza}
              onChange={(e) => {
                const value = e.target.value;
                if (searchTimeout) clearTimeout(searchTimeout);
                const timeout = setTimeout(() => {
                  setFilters((prev) => ({
                    ...prev,
                    search: value,
                    numero_fianza: "",
                  }));
                }, 500);
                setSearchTimeout(timeout);
              }}
              className="h-11 w-full rounded-[10px] border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#003f4f]"
            />
          </div>

          <SelectField
            label="Movimiento"
            value={filters.movimiento}
            onChange={(e) => handleSelectChange("movimiento", e.target.value)}
            className="w-full sm:w-[220px]"
          >
            <option value="">Todos los movimientos</option>
            {movimientos.map((m) => (
              <option key={m.id} value={m.nombre}>
                {m.nombre}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Pago"
            value={filters.estatus_pago}
            onChange={(e) => handleSelectChange("estatus_pago", e.target.value)}
            className="w-full sm:w-[190px]"
          >
            <option value="">Todos los pagos</option>
            {FILTERS_PAGO.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Afianzadora"
            value={filters.afianzadora_id}
            onChange={(e) =>
              handleSelectChange("afianzadora_id", e.target.value)
            }
            className="w-full sm:w-[230px]"
          >
            <option value="">Todas las afianzadoras</option>
            {afianzadoras.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </SelectField>

          {/* Checkbox real (antes era un div con onClick): accesible por teclado */}
          <label className="flex h-11 cursor-pointer items-center gap-2 font-semibold text-gray-800">
            <input
              type="checkbox"
              className="h-5 w-5 cursor-pointer rounded accent-[#003f4f]"
              checked={filters.agente_nombre === "RBG-PP"}
              onChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  agente_nombre: prev.agente_nombre === "RBG-PP" ? "" : "RBG-PP",
                }))
              }
            />
            PP
          </label>

          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="h-11 whitespace-nowrap px-2 text-sm font-medium text-gray-700 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003f4f] rounded-md"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Estatus: chips solo para los más usados + selector con el resto */}
        <div
          role="group"
          aria-label="Filtrar por estatus"
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-[13px] font-semibold text-gray-600">
            Estatus
          </span>
          {[{ id: "todos", nombre: "" }, ...estatusRapidos].map((e) => {
            const on = filters.estatus === e.nombre;
            return (
              <button
                key={e.id}
                type="button"
                aria-pressed={on}
                onClick={() => handleSelectChange("estatus", e.nombre)}
                className={`h-9 whitespace-nowrap rounded-full border px-4 text-[13px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#003f4f] focus:ring-offset-1 ${
                  on
                    ? "border-[#003f4f] bg-[#003f4f] text-white"
                    : "border-gray-300 bg-white text-gray-900 hover:bg-gray-100"
                }`}
              >
                {e.nombre ? sentence(e.nombre) : "Todos"}
              </button>
            );
          })}

          {estatusOtros.length > 0 && (
            <SelectField
              label="Otros estatus"
              value={estatusOtroActivo ? filters.estatus : ""}
              onChange={(e) => handleSelectChange("estatus", e.target.value)}
              active={estatusOtroActivo}
              className="w-[240px]"
            >
              <option value="" disabled={estatusOtroActivo}>
                Otros estatus ({estatusOtros.length})
              </option>
              {estatusOtros.map((e) => (
                <option key={e.id} value={e.nombre}>
                  {sentence(e.nombre)}
                </option>
              ))}
            </SelectField>
          )}
        </div>
      </section>

      {/* RENDERIZADO DE LA TANSTACK TABLE */}
      <section
        aria-label="Lista de trámites"
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-gray-200 bg-gray-50"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-600 ${
                        header.column.columnDef.meta?.className || ""
                      }`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-gray-600"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Cargando trámites...
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-gray-600"
                  >
                    No se encontraron trámites
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50"
                    onClick={() => {
                      navigate(`/vistaprevia`, {
                        state: {
                          id: row.original.id,
                          listaIds: tramitesList.map((t) => t.id),
                        },
                      });
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`px-4 py-3.5 align-middle text-gray-800 ${
                          cell.column.columnDef.meta?.className || ""
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3">
            <div className="text-sm text-gray-600">
              Página {pagination.currentPage} de {pagination.totalPages} {" · "}{" "}
              {pagination.count.toLocaleString()} registros
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(1)}
                disabled={pagination.currentPage === 1 || loading}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50"
              >
                Primera
              </button>
              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={!pagination.previous || loading}
                aria-label="Página anterior"
                className="rounded-md border border-gray-300 bg-white p-2 hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>

              <div className="flex gap-1">
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) pageNum = i + 1;
                  else if (pagination.currentPage <= 3) pageNum = i + 1;
                  else if (pagination.currentPage >= pagination.totalPages - 2)
                    pageNum = pagination.totalPages - 4 + i;
                  else pageNum = pagination.currentPage - 2 + i;
                  if (pageNum < 1 || pageNum > pagination.totalPages)
                    return null;

                  return (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => goToPage(pageNum)}
                      disabled={loading}
                      aria-current={
                        pageNum === pagination.currentPage ? "page" : undefined
                      }
                      className={`rounded-md border px-3 py-1.5 text-sm ${
                        pageNum === pagination.currentPage
                          ? "border-[#003f4f] bg-[#003f4f] text-white"
                          : "border-gray-300 bg-white hover:bg-gray-100"
                      } disabled:cursor-not-allowed`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={!pagination.next || loading}
                aria-label="Página siguiente"
                className="rounded-md border border-gray-300 bg-white p-2 hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronRight />
              </button>
              <button
                onClick={() => goToPage(pagination.totalPages)}
                disabled={
                  pagination.currentPage === pagination.totalPages || loading
                }
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50"
              >
                Última
              </button>
            </div>
          </div>
        )}
      </section>

      <FormularioTramite
        isVisible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        onSuccess={() => obtenerTramites(1)}
      />

      {/* MODAL: Edición Completa */}
      <Dialog
        open={modalEdicion.isOpen}
        onOpenChange={(open) =>
          setModalEdicion({ isOpen: open, tramiteId: null })
        }
      >
        <DialogContent className="max-w-6xl w-full p-0 overflow-hidden bg-[#f4f6f8]">
          <DialogTitle className="sr-only">Editar Trámite</DialogTitle>
          {modalEdicion.tramiteId && (
            <TramiteCliente
              idTramite={modalEdicion.tramiteId}
              onClose={() => {
                setModalEdicion({ isOpen: false, tramiteId: null });
                obtenerTramites(pagination.currentPage);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: Observaciones */}
      <Dialog
        open={modalObservaciones.isOpen}
        onOpenChange={(open) =>
          setModalObservaciones({ isOpen: open, tramiteId: null })
        }
      >
        <DialogContent className="max-w-3xl w-full p-6">
          <DialogTitle className="sr-only">Gestionar Observaciones</DialogTitle>
          {modalObservaciones.tramiteId && (
            <GestionObservaciones
              tramiteId={modalObservaciones.tramiteId}
              usuario={usuario}
            />
          )}
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" richColors />
    </div>
  );
}