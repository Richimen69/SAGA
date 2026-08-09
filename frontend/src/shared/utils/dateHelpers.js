import { format, parseISO } from "date-fns";

/**
 * Convierte una fecha del backend (string) a objeto Date
 * Soporta formatos: ISO (yyyy-MM-dd) y dd/MM/yyyy
 */
export const parseDateFromBackend = (dateStr) => {
  if (!dateStr) return null;
  
  try {
    // Si viene en formato ISO (yyyy-MM-dd o yyyy-MM-ddTHH:mm:ss)
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      return parseISO(dateStr);
    }
    
    // Si viene en formato dd/MM/yyyy
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
  
  return null;
};

/**
 * Convierte un objeto Date a formato ISO (yyyy-MM-dd)
 * Para enviar al backend
 */
export const formatToISO = (dateValue) => {
  if (!dateValue) return null;
  if (!(dateValue instanceof Date)) return null;
  
  return format(dateValue, "yyyy-MM-dd");
};

/**
 * Convierte un objeto Date a formato DD/MM/YYYY
 * Para mostrar al usuario
 */
export const formatToDisplay = (dateValue) => {
  if (!dateValue) return null;
  if (!(dateValue instanceof Date)) return null;
  
  return format(dateValue, "dd/MM/yyyy");
};