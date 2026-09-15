import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TramiteView from "../components/TramiteView";
import { format, parseISO } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { IconContext } from "react-icons";
import { TbEdit } from "react-icons/tb";
import {
  fetchTramitesId,
  deleteTramite,
  getCompromiso,
} from "../services/tramites.service";
import { Toaster, toast } from "sonner";
import CancelarComp from "@/features/bitacora/components/modals/CancelarComp";
import { estatusTerminados } from "@/shared/utils/Constans";
import {
  Trash2,
  Info,
  CheckCircle,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { DeleteModal } from "@/features/bitacora/components/modals/ConfirmacionElim";

function VistaTramite(user) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTramite, setSelectedTramite] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [compromisos, setCompromiso] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [dias, setDias] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const { id, listaIds } = location.state || {};
  const [selectedCompromisoId, setSelectedCompromisoId] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clienteEncontrado = await fetchTramitesId(id);
        const compromisosEncontrados = await getCompromiso(
          id,
          clienteEncontrado.data.cliente_id,
        );
        setClientes(clienteEncontrado.data);
        setCompromiso(compromisosEncontrados);
        if (clienteEncontrado) {
          const movimientosData = clienteEncontrado.data.observaciones_detalle;
          if (Array.isArray(movimientosData) && movimientosData.length > 0) {
            setMovimientos(
              movimientosData.map((mov) => ({
                id: mov.id,
                observacion: mov.observacion,
                fecha: mov.fecha,
                nombre: mov.nombre,
              })),
            );
          } else {
            setError("No hay observaciones disponibles.");
          }

          if (
            clienteEncontrado?.data.fecha &&
            clienteEncontrado?.data.fecha_pago
          ) {
            const calcularDiasDeDiferencia = (fecha1, fecha2) => {
              const convertirAFecha = (fechaStr) => {
                const [dia, mes, anio] = fechaStr.split("/").map(Number);
                const fechaFormateada = `${anio}-${
                  mes < 10 ? "0" + mes : mes
                }-${dia < 10 ? "0" + dia : dia}`;
                return new Date(fechaFormateada);
              };

              const date1 = convertirAFecha(fecha1);
              const date2 = convertirAFecha(fecha2);
              const diferenciaEnMilisegundos = date2 - date1;

              if (isNaN(diferenciaEnMilisegundos)) {
                return NaN;
              }
              return Math.floor(
                diferenciaEnMilisegundos / (1000 * 60 * 60 * 24),
              );
            };

            const diasDeDiferencia = calcularDiasDeDiferencia(
              clienteEncontrado.fecha_termino,
              clienteEncontrado.fecha_pago,
            );

            if (diasDeDiferencia >= 0) {
              setDias(diasDeDiferencia);
            } else {
              setDias("0");
            }
          }
        }
      } catch (error) {
        setError("Error al obtener los datos.");
      }
    };
    fetchData();
  }, [id]);

  const clienteEncontrado = clientes;

  const handleDeleteClick = (tramite) => {
    setSelectedTramite(tramite);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTramite(selectedTramite);
      toast.success("Trámite eliminado exitosamente");
      setShowDeleteModal(false);
      navigate("/tramites");
    } catch (error) {
      console.error("Error al eliminar el trámite:", error);
      toast.error("Error al eliminar el trámite");
    } finally {
      setIsDeleting(false);
    }
  };

  const irAlSiguiente = () => {
    if (!listaIds || listaIds.length === 0) return;

    // Encontramos la posición del trámite actual
    const currentIndex = listaIds.indexOf(id);

    // Verificamos que no sea el último elemento de la lista
    if (currentIndex < listaIds.length - 1) {
      const nextId = listaIds[currentIndex + 1];

      // Navegamos a la misma vista, pero con el nuevo ID.
      // Usamos replace: true para no llenar el historial del navegador
      navigate(location.pathname, {
        state: { id: nextId, listaIds },
        replace: true,
      });
    } else {
      toast.info("Has llegado al último trámite de esta página.");
    }
  };
  const irAlAnterior = () => {
    if (!listaIds || listaIds.length === 0) return;

    // Encontramos la posición del trámite actual
    const currentIndex = listaIds.indexOf(id);

    // Verificamos que no sea el primer elemento de la lista
    if (currentIndex > 0) {
      const prevId = listaIds[currentIndex - 1];

      // Navegamos a la misma vista, pero con el ID anterior.
      navigate(location.pathname, {
        state: { id: prevId, listaIds },
        replace: true,
      });
    } else {
      toast.info("Este es el primer trámite de la lista.");
    }
  };

  if (!clienteEncontrado || clienteEncontrado.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <lottie-player
          autoplay
          loop
          mode="normal"
          src="/loader.json"
          style={{ width: "200px", height: "200px" }}
        ></lottie-player>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ENCABEZADO */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extrabold text-[#003f4f]">
                Folio {clienteEncontrado.folio}
              </h1>
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                {clienteEncontrado?.estatus_info?.nombre}
              </span>
            </div>
            <div className="flex gap-4 md:gap-8 text-sm text-gray-700">
              <p>
                <span className="font-bold text-[#003f4f]">Inicio:</span>{" "}
                {clienteEncontrado?.fecha
                  ? format(parseISO(clienteEncontrado.fecha), "dd/MM/yyyy")
                  : "Sin fecha"}
              </p>
              {estatusTerminados.includes(clienteEncontrado.estatus) && (
                <p>
                  <span className="font-bold text-[#003f4f]">Término:</span>{" "}
                  {clienteEncontrado?.fecha_termino
                    ? format(
                        parseISO(clienteEncontrado.fecha_termino),
                        "dd/MM/yyyy",
                      )
                    : ""}
                </p>
              )}
              <p>
                <span className="font-bold text-[#003f4f]">Fianza:</span>{" "}
                {clienteEncontrado.numero_fianza}
              </p>
            </div>
          </div>
          <button
            className="text-red-500 hover:text-red-700 transition-colors p-2"
            onClick={() => handleDeleteClick(clienteEncontrado.id)}
          >
            <Trash2 size={24} />
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL (GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMNA IZQUIERDA (Info + Compromisos + Observaciones) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información General */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#003f4f]"></div>
              <div className="flex items-center gap-2 mb-6 text-[#003f4f]">
                <Info size={20} />
                <h2 className="text-lg font-bold">Información General</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Fiado
                  </p>
                  <p className="font-medium">
                    {clienteEncontrado.cliente_nombre}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {clienteEncontrado.movimiento === 28
                      ? "Aseguradora"
                      : "Afianzadora"}
                  </p>
                  <p className="font-medium">
                    {clienteEncontrado.afianzadora_nombre}
                  </p>
                </div>

                <div className="md:col-span-2 border-t border-gray-100 pt-4"></div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Beneficiario
                  </p>
                  <p className="font-medium">
                    {clienteEncontrado.beneficiario_nombre}
                  </p>
                </div>
                <div></div>

                <div className="md:col-span-2 border-t border-gray-100 pt-4"></div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Agente
                  </p>
                  <p className="font-medium">
                    {clienteEncontrado.agente_nombre}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Movimiento
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    {clienteEncontrado?.movimiento_info?.nombre ||
                      "Cargando..."}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Responsable
                  </p>
                  <p className="font-medium">
                    {clienteEncontrado.tipo_proceso}
                  </p>
                </div>
              </div>
            </div>

            {/* Compromisos */}
            {compromisos && compromisos.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-[#003f4f] mb-4">
                  Compromisos
                </h2>
                <div className="space-y-6">
                  {/* Contenedor con espacio entre compromisos */}
                  {compromisos.map((comp, index) => (
                    <div
                      key={comp.id || index}
                      className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                    >
                      {/* Fila superior: Responsable y Status */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="font-bold text-gray-700 text-sm">
                          Responsable: {comp.nombre_persona || "N/A"}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-bold ${comp.completado ? "bg-green-100 text-green-700" : comp.esta_vencido ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {comp.completado
                            ? "Completado"
                            : comp.esta_vencido
                              ? "Vencido"
                              : "Pendiente"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                            Compromiso
                          </p>
                          <p className="font-medium">{comp.categoria}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                            Fecha Compromiso
                          </p>
                          <p className="font-medium">
                            {comp.fecha_vencimiento
                              ? format(
                                  parseISO(comp.fecha_vencimiento),
                                  "dd/MM/yyyy",
                                )
                              : ""}
                          </p>
                        </div>

                        {comp.completado === false ? (
                          <div className="col-span-2">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                              Observaciones
                            </p>
                            <div className="flex gap-2 items-center">
                              <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium">
                                {comp.observaciones}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedCompromisoId(comp.id);
                                  setShowDialog(true);
                                }}
                                title="Completar compromiso"
                                className="flex items-center justify-center p-2 border border-gray-300 text-gray-500 rounded-md hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all duration-200 shadow-sm"
                              >
                                <CheckCircle size={18} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                                Completado el
                              </p>
                              <p className="font-medium">
                                {comp.fecha_completado}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                                Notas de cierre
                              </p>
                              <p
                                className="font-medium truncate"
                                title={comp.completado_por}
                              >
                                {comp.completado_por || "-"}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observaciones (Timeline) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-8 text-[#003f4f]">
                <MessageSquare size={20} />
                <h2 className="text-lg font-bold">
                  Observaciones y Comentarios
                </h2>
              </div>

              <div className="relative border-l border-gray-300 ml-3 space-y-6 pb-4">
                {movimientos.map((dato, index) => (
                  <div key={index} className="relative pl-6">
                    <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full border-2 border-[#003f4f] bg-white"></div>
                    <div className="bg-[#f8f9fa] rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-[#003f4f]">
                          {dato.nombre}
                        </span>
                        <span className="text-xs font-mono text-gray-500">
                          {format(parseISO(dato.fecha), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {dato.observacion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA (Finanzas y Pagos) */}
          <div className="space-y-6">
            {estatusTerminados.includes(clienteEncontrado.estatus) && (
              <>
                {/* Estado de Pago */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-6 text-[#003f4f]">
                    <CheckCircle size={20} />
                    <h2 className="text-lg font-bold">Estado de Pago</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Estado
                      </p>
                      <span
                        className={`px-3 py-1 rounded text-xs font-bold ${
                          clienteEncontrado.estatus_pago === "PAGADA"
                            ? "bg-[#107c41] text-white"
                            : clienteEncontrado.estatus_pago ===
                                "SE MANDO RECIVO"
                              ? "bg-[#F57F17] text-white"
                              : clienteEncontrado.estatus_pago === "NO PAGADA"
                                ? "bg-red-500 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {clienteEncontrado.estatus_pago || "SIN ESTADO"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Fecha de pago
                      </p>
                      <p className="font-mono text-sm">
                        {clienteEncontrado.fecha_pago || "—"}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Días de atraso
                      </p>
                      <p className="font-mono text-sm">{dias || "0"}</p>
                    </div>

                    {clienteEncontrado.observaciones_pago && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Notas
                        </p>
                        <p className="text-sm text-gray-600">
                          {clienteEncontrado.observaciones_pago}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumen Financiero */}
                <div className="bg-[#003f4f] rounded-xl shadow-sm text-white p-6">
                  <h2 className="text-lg font-bold mb-6">Resumen Financiero</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-blue-100">Prima Inicial</p>
                      <p className="font-mono text-sm">
                        ${clienteEncontrado.prima_inicial} MXN
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-blue-100">Prima Futura</p>
                      <p className="font-mono text-sm">
                        ${clienteEncontrado.prima_futura} MXN
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-blue-100">Prima Total</p>
                      <p className="font-mono text-sm">
                        ${clienteEncontrado.prima_total} MXN
                      </p>
                    </div>

                    <div className="pt-4 mt-2 border-t border-[#005a70] flex justify-between items-center">
                      <p className="text-sm font-bold tracking-wider uppercase text-blue-100">
                        Importe Total
                      </p>
                      <p className="text-xl font-bold font-mono">
                        ${clienteEncontrado.importe_total}{" "}
                        <span className="text-sm font-normal">MXN</span>
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Acciones Finales (Botones) */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
          {listaIds && listaIds.indexOf(id) > 0 && (
            <button
              onClick={irAlAnterior}
              className="px-6 py-2 bg-primary hover:bg-gray-500 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center"
            >
              <ChevronLeft />
              Anterior Trámite
            </button>
          )}
          {listaIds && listaIds.indexOf(id) < listaIds.length - 1 && (
            <button
              onClick={irAlSiguiente}
              className="px-6 py-2 bg-primary hover:bg-gray-500 text-white rounded-lg font-medium transition-colors shadow-sm mr-auto flex items-center"
            >
              Siguiente Trámite
              <ChevronRight />
            </button>
          )}
          <button
            onClick={() => navigate(`/tramitecliente`, { state: { id: id } })}
            className="flex items-center gap-2 px-6 py-2 border border-gray-300 bg-white rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <IconContext.Provider value={{ size: "1.2em" }}>
              <TbEdit />
            </IconContext.Provider>
            Editar
          </button>
          <button
            onClick={() => navigate("/tramites")}
            className="px-6 py-2 bg-[#003f4f] hover:bg-[#002b36] text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            Aceptar
          </button>
        </div>

        {/* Componentes Extras (TramiteView y Tareas) */}
        {clienteEncontrado.movimiento === 21 && (
          <div className="mt-8">
            <TramiteView
              id={clienteEncontrado.id}
              fianza={clienteEncontrado.numero_fianza}
            />
          </div>
        )}
      </div>

      {showDialog && (
        <CancelarComp
          onClose={() => {
            setShowDialog(false);
            setSelectedCompromisoId(null);
          }}
          tramite={clientes}
          compromiso={selectedCompromisoId}
        />
      )}
      <Toaster position="top-center" richColors />
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        tramiteName={selectedTramite?.nombre}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default VistaTramite;
