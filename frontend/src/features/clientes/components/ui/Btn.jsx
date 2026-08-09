import React from "react";

const colorVariants = {
  default: "bg-primary hover:bg-blue-700",
  secondary: "bg-white-600 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300",
  green: "bg-[#22AB74] hover:bg-[#1A8057] text-white ",
  gray: "bg-gray-500 hover:bg-gray-600 focus:ring-gray-400",
  red: "bg-red-500 hover:bg-red-600 focus:ring-red-500",
};

export const Btn = ({
  children,
  onClick,
  color = "default", // Color por defecto es 'blue'
  icon = null, // El ícono es opcional, por defecto es null
  ...props // Permite pasar otras props de botón como 'type', 'disabled', etc.
}) => {
  // Clases base que siempre se aplican
  const baseClasses =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  // Selecciona las clases de color del objeto, o usa 'secondary' si el color no existe
  const colorClasses = colorVariants[color] || colorVariants.secondary;

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${colorClasses}`}
      {...props} // Aplica cualquier otra prop adicional
    >
      {/* Renderiza el ícono solo si fue proporcionado */}
      {icon && icon}
      
      {/* El texto del botón */}
      {children}
    </button>
  );
};