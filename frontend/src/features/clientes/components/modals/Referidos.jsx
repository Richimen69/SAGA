import { useState, useEffect } from "react";
import React from "react";
import { addReferido } from "../../services/clientes";
import { Phone, Mail, FileText, X, User, Users } from "lucide-react";
import { obtenerReferidos } from "../../services/clientes";
export const Referidos = ({
  isOpen,
  onClose,
  cliente,
  id_cli,
  onSuccess,
  isLoading = false,
}) => {
  if (!isOpen) return null;
  const [form, setForm] = useState(false);
  const [totalReferidos, setTotalReferidos] = useState([]);
  const [formData, setFormData] = useState({
    id_cli: id_cli,
    referido: "",
    telefono: "",
    correo: "",
    observaciones: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addReferido({ ...formData });
      setFormData({
        id_cli: "",
        referido: "",
        telefono: "",
        correo: "",
        observaciones: "",
      });
      setForm(false);
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error al agregar referido:", error);
    }
  };
  useEffect(() => {
    const fetchReferidos = async () => {
      try {
        const response = await obtenerReferidos(id_cli);
        setTotalReferidos(response);
        console.log(response);
      } catch (error) {
        console.error("Error al obtener referidos:", error);
      }
    };
    fetchReferidos();
  }, [id_cli]);
  const getInitials = (nombre) => {
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-4/6 mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Referidos de {cliente}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Agregar Referido
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        {/* Body */}
        {form ? (
          <div className="flex flex-col gap-6 p-6">
            {/* Nombre del referido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del referido
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="referido"
                  value={formData.referido}
                  onChange={handleChange}
                  placeholder="Nombre completo del referido"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Número de teléfono"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Correo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <div className="relative">
                <FileText
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  placeholder="Notas adicionales sobre el referido..."
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                type="button"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Registrar Referido
              </button>
            </div>
          </div>
        ) : totalReferidos.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {totalReferidos.map((referido) => (
                <div
                  key={referido.id_referido}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium text-sm">
                        {getInitials(referido.referido)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {referido.referido}
                        </h4>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-300">
                      Referido
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {referido.correo && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-3 w-3" />
                        {referido.correo}
                      </div>
                    )}
                    {referido.telefono && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-3 w-3" />
                        {referido.telefono}
                      </div>
                    )}
                    {referido.observaciones && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="h-3 w-3" />
                        {referido.observaciones}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              Este cliente aún no tiene referidos registrados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
