import React, { useEffect, useState } from "react";
import { obtenerTramites } from "@/features/rpp/services/rpp";
import { FaSearch } from "react-icons/fa";
import { IconContext } from "react-icons";
import { AsignarAgente } from "@/features/rpp/components/modals/AsignarAgente";
import AprobarTramite from "@/features/rpp/components/modals/AprobarTramite";
import { statusStylesRPP } from "@/shared/utils/Constans";
import { Toaster } from "sonner";
import EnviarFactura from "@/features/rpp/components/modals/EnviarFactura";
import AjustarPrecio from "@/features/rpp/components/modals/AjustarPrecio";
import CancelarTramite from "@/features/rpp/components/modals/CancelarTramite";
import EditarTramite from "@/features/rpp/components/modals/EditarTramite";
import { FiChevronDown } from "react-icons/fi";
import { PiCurrencyDollarLight } from "react-icons/pi";
import EliminarTramite from "@/features/rpp/components/modals/EliminarTramite";
import {
  FcClock,
  FcOk,
  FcHighPriority,
  FcMoneyTransfer,
  FcCalendar,
  FcPlus,
} from "react-icons/fc";
import { Trash } from "lucide-react";
import Card from "@/features/rpp/components/modals/Card";
import { datosTramites } from "@/features/rpp/services/rpp";
import {
  getFacturas,
  getPagados,
  getAfianzadoras,
} from "@/features/rpp/services/rpp";
export default function TableRpp() {
  const [tramites, setTramites] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDialogAprobar, setShowDialogAprobar] = useState(false);
  const [showDialogFactura, setShowDialogFactura] = useState(false);
  const [showDialogBorrar, setShowDialogBorrar] = useState(false);
  const [showDialogCan, setShowDialogCan] = useState(false);
  const [enableInput, setEnableInput] = useState(false);
  const [editarTramite, setEditarTramite] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [idTramite, setID] = useState(false);
  const id = localStorage.getItem("id");
  const [showTooltip, setShowTooltip] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [datos, setDatosTramites] = useState([]);
  const [afianzadora, setAfianzadora] = useState("");
  const [fechaSel, setFechaSel] = useState([]);
  const [facturasAgrupadas, setFacturasAgrupadas] = useState([]);
  const [facturasPagadas, setFacturasPagadas] = useState([]);
  const [afianzadoras, setAfianzadoras] = useState([]);
  const [afianzadoraSel, setAfianzadorasSel] = useState("");
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);
  useEffect(() => {
    const fetchFechas = async () => {
      try {
        const response = await getFacturas();

        // Agrupar las facturas por 'afianzadora'
        const agrupadas = response.reduce((acc, item) => {
          if (!acc[item.afianzadora]) {
            acc[item.afianzadora] = [];
          }
          acc[item.afianzadora].push(item);
          return acc;
        }, {});

        setFacturasAgrupadas(agrupadas);
      } catch (error) {
        console.error("Error al obtener las opciones:", error);
      }
    };

    fetchFechas();
  }, []);
  useEffect(() => {
    const fetchFechas = async () => {
      try {
        const response = await getPagados();
        setFacturasPagadas(response);
      } catch (error) {
        console.error("Error al obtener las opciones:", error);
      }
    };

    fetchFechas();
  }, []);

  useEffect(() => {
    const fetchAfianzadoras = async () => {
      try {
        const response = await getAfianzadoras();
        setAfianzadoras(response);
        console.log(response);
      } catch (error) {
        console.error("Error al obtener las opciones:", error);
      }
    };

    fetchAfianzadoras();
  }, []);
  useEffect(() => {
    // Solicitar opciones al backend
    const fetchDatosTramites = async () => {
      try {
        const response = await datosTramites();
        setDatosTramites(response);
      } catch (error) {
        console.error("Error al obtener las opciones:", error);
      }
    };
    fetchDatosTramites();
  }, []);
  useEffect(() => {
    const fetchTramites = async () => {
      try {
        const response = await obtenerTramites();
        setTramites(response);
      } catch (error) {
        console.error("Error al obtener las opciones:", error);
      }
    };
    fetchTramites();
  }, []);
  const [selected, setSelected] = useState([]);

  // Manejar selección de un solo checkbox
  const handleCheckboxChange = (id, estatus, costo) => {
    setSelected((prev) => {
      const exists = prev.some((item) => item.id === id);
      return exists
        ? prev.filter((item) => item.id !== id) // Elimina si ya existe
        : [...prev, { id, estatus, costo }]; // Agrega el nuevo objeto
    });
  };

  const filteredClientes = tramites
    .filter((dato) => {
      if (!dato.folio_re) return true;
      return dato.folio_re.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .filter((cliente) => {
      if (!afianzadoraSel) return true;
      return afianzadoraSel ? cliente.afianzadora === afianzadoraSel : true;
    })
    .filter((cliente) =>
      // Filtramos por "movimiento" y "estatus"
      filtro ? cliente.estatus === filtro : true
    )
    .filter((cliente) =>
      // Filtramos por "movimiento" y "estatus"
      afianzadora ? cliente.afianzadora === afianzadora : true
    )
    .filter((dato) => {
      const fecha = String(fechaSel).trim();

      // Si no hay filtro de fecha, mostrar todos
      if (!fecha) return true;

      // Si hay filtro, mostrar solo los que coincidan
      return dato.fecha_factura === fecha;
    });

  const totalGeneral = Object.values(facturasAgrupadas)
    .flat()
    .reduce((sum, item) => sum + parseFloat(item.total), 0);
  const totalPagadas = Object.values(facturasPagadas)
    .flat()
    .reduce((sum, item) => sum + parseFloat(item.total), 0);
  return (
    <div className="flex flex-col ">
      <div className="my-5 overflow-hidden w-full">
        <div className="grid 2xl:grid-cols-12 md:grid-cols-6 grid-cols-1 gap-2 justify-between">
          <div
            className="grid lg:col-span-1 cursor-pointer"
            onClick={() => {
              {
                setFiltro("NUEVO"), setFechaSel(""), setAfianzadora("");
              }
            }}
          >
            <Card icono={<FcPlus />} text={datos.nuevo} estado={"NUEVO"} />
          </div>
          <div
            className="grid lg:col-span-1 cursor-pointer"
            onClick={() => {
              {
                setFiltro("CORRECCION"), setFechaSel(""), setAfianzadora("");
              }
            }}
          >
            <Card
              icono={<FcHighPriority />}
              text={datos.correccion}
              estado={"CORRECCION"}
            />
          </div>
          <div
            className="grid lg:col-span-1 cursor-pointer"
            onClick={() => {
              {
                setFiltro("EN PROCESO"), setFechaSel(""), setAfianzadora("");
              }
            }}
          >
            <Card
              icono={<FcClock />}
              text={datos.en_proceso_count}
              estado={"EN PROCESO"}
            />
          </div>
          <div
            className="grid lg:col-span-1 cursor-pointer"
            onClick={() => {
              {
                setFiltro("EN ESPERA DE APROBACION"),
                  setFechaSel(""),
                  setAfianzadora("");
              }
            }}
          >
            <Card
              icono={<FcCalendar />}
              text={datos.error_count}
              estado={"EN ESPERA DE APROBACION"}
            />
          </div>
          <div
            className="grid lg:col-span-1 cursor-pointer"
            onClick={() => {
              {
                setFiltro("ESPERANDO PAGO"),
                  setFechaSel(""),
                  setAfianzadora("");
              }
            }}
          >
            <Card
              icono={<FcMoneyTransfer />}
              text={datos.esperando_pago}
              estado={"ESPERANDO PAGO"}
            />
          </div>
          <div
            className="grid lg:col-span-1 cursor-pointer"
            onClick={() => {
              {
                setFiltro("FINALIZADO"), setFechaSel(""), setAfianzadora("");
              }
            }}
          >
            <Card
              icono={<FcOk />}
              text={datos.terminado_count}
              estado={"FINALIZADO"}
            />
          </div>
          <div className="grid md:col-span-6 col-span-1">
            <div className="grid md:grid-cols-2 gap-2">
              <div className="grid col-span-1">
                <div className="bg-gray-50 rounded-lg shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                        <IconContext.Provider
                          value={{
                            className: "global-class-name",
                            size: "2em",
                          }}
                        >
                          <PiCurrencyDollarLight />
                        </IconContext.Provider>
                      </div>
                      <h3 className="text-lg font-medium text-gray-800">
                        Trámites por pagar
                      </h3>
                    </div>
                    <div className="px-3 py-1 text-sm font-medium bg-red-100 text-red-500 rounded-full">
                      Pendiente
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {Object.keys(facturasAgrupadas).map((afianzadora) => (
                      <div key={afianzadora}>
                        <h3 className="text-xl font-bold">{afianzadora}</h3>
                        {facturasAgrupadas[afianzadora].map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => {
                              setFechaSel(item.fecha_factura);
                              setFiltro("");
                              setAfianzadora(item.afianzadora);
                            }}
                          >
                            <span className="text-gray-700 hover:bg-slate-200 rounded-md p-1">
                              Factura de {item.fecha_factura}:
                            </span>
                            <span className="text-lg font-semibold">
                              ${parseFloat(item.total).toLocaleString("es-MX")}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}

                    <div className="flex justify-between items-center pt-3 mt-2 border-t">
                      <span className="text-red-600 font-medium">
                        Monto Total:
                      </span>
                      <span className="text-2xl font-bold text-red-600">
                        ${totalGeneral.toLocaleString("es-MX")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg shadow-xs overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">
                      Trámites pagados
                    </h3>
                  </div>
                  <div className="px-3 py-1 text-sm font-medium bg-green-100 text-green-500 rounded-full">
                    Completado
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Select para elegir trámite */}
                  <div className="w-full">
                    <label
                      htmlFor="tramite-select"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Seleccionar trámite:
                    </label>
                    <select
                      id="tramite-select"
                      value={tramiteSeleccionado?.fecha_factura || ""}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      onChange={(e) => {
                        const fecha = e.target.value;
                        const tramite = facturasPagadas.find(
                          (t) => t.fecha_factura === fecha
                        );

                        setTramiteSeleccionado(tramite);
                        setFechaSel(tramite?.fecha_factura || ""); // ← para el filtro de fecha
                        setFiltro(tramite?.estatus || ""); // ← si lo usas como filtro
                        setAfianzadora(tramite?.afianzadora || ""); // ← para el filtro de afianzadora
                      }}
                    >
                      <option value="">Selecciona una opción</option>
                      {facturasPagadas.map((tramite) => (
                        <option
                          key={tramite.fecha_factura}
                          value={tramite.fecha_factura}
                        >
                          {tramite.afianzadora} {tramite.fecha_factura}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Detalles del trámite seleccionado */}
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Cliente:</span>
                      <span className="font-medium">
                        {tramiteSeleccionado?.afianzadora || "--"}{" "}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Fecha de pago:</span>
                      <span
                        className="font-medium cursor-pointer"
                        onClick={() => {
                          setFechaSel(tramiteSeleccionado?.fecha_factura);
                          setFiltro("");
                          setAfianzadora(tramiteSeleccionado?.afianzadora);
                        }}
                      >
                        {tramiteSeleccionado?.fecha_factura || "--"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Monto:</span>
                      <span className="text-lg font-semibold text-green-600">
                        ${tramiteSeleccionado?.total || "0.00"}
                      </span>
                    </div>
                  </div>

                  {/* Total pagado */}
                  <div className="flex justify-between items-center pt-3 mt-2 border-t">
                    <span className="text-green-600 font-medium">
                      Total pagado:
                    </span>
                    <span className="text-2xl font-bold text-green-500">
                      ${totalPagadas.toLocaleString("es-MX")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-5 pb-5">
        <div className="relative">
          <input
            id="user"
            type="text"
            placeholder="Folio"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
          <div className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500">
            <IconContext.Provider
              value={{
                color: "#076163",
                className: "global-class-name",
              }}
            >
              <FaSearch />
            </IconContext.Provider>
          </div>
        </div>

        <div className="relative">
          <select
            value={afianzadoraSel}
            onChange={(e) => setAfianzadorasSel(e.target.value)}
            className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
          >
            <option value="">Afianzadora</option>
            {afianzadoras.map((afianzadora) => (
              <option key={afianzadora.value} value={afianzadora.value}>
                {afianzadora.label}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none text-gray-500" />
        </div>
        <div className="flex items-center">
          <button
            onClick={() => {
              {
                setFiltro(""),
                  setFechaSel(""),
                  setAfianzadora("");
              }
            }}
          >
            <Trash color="#872222"/>
          </button>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 w-10">
                  <div className="dark:bg-black/10">
                    <label className="text-white"></label>
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  FECHA
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  FOLIO
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  AFIANZADORA
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  TRÁMITE
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  PROPIETARIO/EMPRESA
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  ESTATUS
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  COSTO
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  AGENTE
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  OBSERVACIONES
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  FACTURA
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-gray-600"
                  colSpan={5}
                >
                  DOCUMENTOS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length > 0 ? (
                filteredClientes.map((tramite) => (
                  <tr
                    key={tramite.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="p-4 w-10">
                      <div className="dark:bg-black/10">
                        <label className="text-white">
                          <input
                            className="dark:border-white-400/20 dark:scale-100 transition-all duration-500 ease-in-out dark:hover:scale-110 dark:checked:scale-100 w-5 h-5 cursor-pointer"
                            type="checkbox"
                            checked={selected.some(
                              (item) => item.id === tramite.id
                            )}
                            onChange={() =>
                              handleCheckboxChange(
                                tramite.id,
                                tramite.estatus,
                                tramite.costo_tramite
                              )
                            }
                          />
                        </label>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 text-nowrap">
                      {tramite.fecha_solicitud}
                    </td>
                    <td
                      className="px-4 py-3 font-medium text-gray-900"
                      onClick={() => {
                        setEditarTramite(true);
                        setID(tramite.id);
                      }}
                    >
                      {tramite.folio_re}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {tramite.afianzadora}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {tramite.tramite_solicitado}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-600"
                      onClick={() => {
                        setEditarTramite(true);
                        setID(tramite.id);
                      }}
                    >
                      {tramite.nombre_propietario_empresa}
                    </td>
                    <td className="px-4 py-3 text-nowrap text-center">
                      <span
                        className={
                          statusStylesRPP[tramite.estatus] ||
                          "bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-base font-semibold"
                        }
                      >
                        {tramite.estatus}
                      </span>
                    </td>
                    <td className="p-4 text-green-500 font-semibold text-nowrap">
                      ${tramite.costo_tramite}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {tramite.agente}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {tramite.observaciones}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {tramite.fecha_factura}
                    </td>
                    <td className="text-center relative">
                      <button
                        onClick={() =>
                          window.open(
                            `https://bitacorabc.site/Backend_RPP/uploads/${tramite.url_archivo}`,
                            "_blank"
                          )
                        }
                        className={`p-2 ${
                          tramite.url_archivo
                            ? "text-blue-600 hover:bg-blue-50 cursor cursor-pointer"
                            : "text-gray-400 cursor-not-allowed"
                        } rounded-full`}
                        disabled={!tramite.url_archivo}
                        onMouseEnter={() =>
                          setShowTooltip({
                            id: tramite.id,
                            type: "archivo",
                          })
                        }
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" x2="8" y1="13" y2="13"></line>
                          <line x1="16" x2="8" y1="17" y2="17"></line>
                          <line x1="10" x2="8" y1="9" y2="9"></line>
                        </svg>
                      </button>
                      {showTooltip?.id === tramite.id &&
                        showTooltip?.type === "archivo" && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                            Archivo
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                    </td>
                    <td className="text-center relative">
                      <button
                        onClick={() =>
                          window.open(
                            `https://bitacorabc.site/Backend_RPP/uploads/${tramite.url_cert_revisado}`,
                            "_blank"
                          )
                        }
                        className={`p-2 ${
                          tramite.url_cert_revisado
                            ? "text-green-600 hover:bg-green-50 cursor cursor-pointer"
                            : "text-gray-400 cursor-not-allowed"
                        } rounded-full`}
                        disabled={!tramite.url_cert_revisado}
                        onMouseEnter={() =>
                          setShowTooltip({
                            id: tramite.id,
                            type: "certificado",
                          })
                        }
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" x2="8" y1="13" y2="13"></line>
                          <line x1="16" x2="8" y1="17" y2="17"></line>
                          <line x1="10" x2="8" y1="9" y2="9"></line>
                        </svg>
                      </button>
                      {showTooltip?.id === tramite.id &&
                        showTooltip?.type === "certificado" && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                            Certificado
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                    </td>
                    <td className="text-center relative">
                      <button
                        onClick={() =>
                          window.open(
                            `https://bitacorabc.site/Backend_RPP/uploads/${tramite.url_pago}`,
                            "_blank"
                          )
                        }
                        className={`p-2 ${
                          tramite.url_pago
                            ? "text-amber-600 hover:bg-amber-50 cursor-pointer"
                            : "text-gray-400 cursor-not-allowed"
                        } rounded-full cursor`}
                        disabled={!tramite.url_pago}
                        onMouseEnter={() =>
                          setShowTooltip({
                            id: tramite.id,
                            type: "compPago",
                          })
                        }
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"></path>
                          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                          <path d="M12 17.5v-11"></path>
                        </svg>
                      </button>
                      {showTooltip?.id === tramite.id &&
                        showTooltip?.type === "compPago" && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                            Comprobante de pago
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                    </td>
                    <td className="text-center relative">
                      <button
                        onClick={() =>
                          window.open(
                            `https://bitacorabc.site/Backend_RPP/${tramite.url_factura}`,
                            "_blank"
                          )
                        }
                        disabled={!tramite.url_factura}
                        className={`p-2 ${
                          tramite.url_factura
                            ? "text-purple-600 hover:bg-purple-50 cursor-pointer"
                            : "text-gray-400 cursor-not-allowed"
                        } rounded-full `}
                        onMouseEnter={() =>
                          tramite.id &&
                          setShowTooltip({
                            id: tramite.id,
                            type: "factura",
                          })
                        }
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            width="16"
                            height="20"
                            x="4"
                            y="2"
                            rx="2"
                          ></rect>
                          <path d="M8 10h8"></path>
                          <path d="M8 14h8"></path>
                          <path d="M8 18h5"></path>
                        </svg>
                      </button>
                      {showTooltip?.id === tramite.id &&
                        showTooltip?.type === "factura" && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                            Factura
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                    </td>
                    <td className="text-center relative">
                      <button
                        onClick={() =>
                          window.open(
                            `https://bitacorabc.site/Backend_RPP/uploads/${tramite.url_xml}`,
                            "_blank"
                          )
                        }
                        disabled={!tramite.url_xml}
                        className={`p-2 ${
                          tramite.url_xml
                            ? "text-red-600 hover:bg-red-50 cursor-pointer"
                            : "text-gray-400 cursor-not-allowed"
                        } rounded-full`}
                        onMouseEnter={() =>
                          tramite.id &&
                          setShowTooltip({
                            id: tramite.id,
                            type: "xml",
                          })
                        }
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <path d="M14 2v6h6"></path>
                          <path d="m8 16 2-2-2-2"></path>
                          <path d="m14 12-2 2 2 2"></path>
                        </svg>
                      </button>
                      {showTooltip?.id === tramite.id &&
                        showTooltip?.type === "xml" && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                            XML
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="p-4 text-center text-gray-600">
                    No se encontraron trámites.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {selected.length > 0 && (
          <div className="flex">
            {selected.every((item) => item.estatus === "APROBADO") && (
              <button
                className="fixed bottom-5 bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:opacity-80"
                onClick={() => {
                  setShowDialogFactura(true);
                }}
              >
                Enviar factura ({selected.length})
              </button>
            )}
            {selected.every((item) => item.estatus === "NUEVO") && (
              <button
                className="fixed bottom-5 right-5 bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:opacity-80"
                onClick={() => {
                  setShowDialog(true);
                }}
              >
                Asignar ({selected.length})
              </button>
            )}
            {selected.every(
              (item) =>
                item.estatus === "EN REVISION" || item.estatus === "EN PROCESO"
            ) && (
              <button
                className="fixed bottom-5 left-96 bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:opacity-80"
                onClick={() => {
                  setShowDialogAprobar(true);
                }}
              >
                Enviar ({selected.length})
              </button>
            )}
            {selected.every((item) => item.estatus != "CANCELADO") && (
              <button
                className="fixed bottom-5 right-96 bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:opacity-80"
                onClick={() => {
                  setEnableInput(true);
                }}
              >
                Ajustar costo ({selected.length})
              </button>
            )}
            {selected.every((item) => item.estatus != "CANCELADO") && (
              <button
                className="fixed bottom-5 right-40 bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:opacity-80"
                onClick={() => {
                  setShowDialogCan(true);
                }}
              >
                Cancelar ({selected.length})
              </button>
            )}
            {selected.every((item) => item) && (
              <button
                className="fixed bottom-5 bg-primary left-56 text-white px-6 py-3 rounded-full shadow-lg hover:opacity-80"
                onClick={() => {
                  setShowDialogBorrar(true);
                }}
              >
                Eliminar ({selected.length})
              </button>
            )}
          </div>
        )}
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
    </div>
  );
}
