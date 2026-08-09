import { useState, useEffect, useRef } from "react";

export function InputPrima({ value, onChange, disabled, negative, ...props }) {
  const inputRef = useRef(null);
  // Función para convertir número a formato con comas
  const formatNumber = (num) => {
    if (num === "" || num === null || num === undefined || isNaN(num))
      return "";
    return Number(num).toLocaleString("en-US", { minimumFractionDigits: 2 });
  };

  // Función para limpiar el formato y obtener el número
  const parseNumber = (str) => {
    if (!str || str === "") return "";
    // Limpia comas y convierte a número
    const cleaned = str.replace(/,/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? "" : num;
  };

  const [inputValue, setInputValue] = useState(() => formatNumber(value));

  // Solo actualiza el input cuando cambia el valor desde el padre Y no estamos escribiendo
  useEffect(() => {
    // Solo actualiza si el valor formateado es diferente al actual
    // y si no estamos en medio de una edición
    const formattedValue = formatNumber(value);
    if (
      formattedValue !== inputValue &&
      document.activeElement !== inputRef.current
    ) {
      setInputValue(formattedValue);
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;

    // Permitir solo números, comas, puntos y espacios
    if (!/^[\d,.\s]*$/.test(raw)) return;

    // Guardamos en el input local (sin formato mientras escribe)
    setInputValue(raw);

    // Convertimos y enviamos al padre
    const numericValue = parseNumber(raw);
    if (onChange) {
      onChange(numericValue);
    }
  };

  const handleBlur = () => {
    // Al perder el foco, formateamos el número
    const numericValue = parseNumber(inputValue);
    if (numericValue !== "") {
      const rounded = parseFloat(numericValue.toFixed(2));
      setInputValue(formatNumber(rounded));
    } else {
      setInputValue("");
    }
  };

  return (
    <div className="mt-1 flex rounded-md">
      <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-200 bg-gray-50 px-3 text-gray-500">
        {negative && <span className="mr-1">-</span>}$
      </span>
      <input
        ref={inputRef}
        type="text"
        placeholder="0.00"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={`block w-full rounded-r-md border border-gray-200 px-3 py-2 text-sm text-right focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-primary ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        {...props}
      />
    </div>
  );
}
