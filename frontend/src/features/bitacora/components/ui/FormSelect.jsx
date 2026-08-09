import React from 'react';
import { ChevronDown } from 'lucide-react'; 

const FormSelectField = ({ 
    label, 
    value, 
    onChange, 
    options = [],
    defaultLabel = "Selecciona una opción",
    name,
    required
}) => {
    
    // Función que llama al handler pasado por props
    const handleSelectChange = (e) => {
        const selectedValue = e.target.value;
        onChange(name, selectedValue); 
    };

    return (
        <div className="flex flex-col gap-1">
            <p>{label}</p>
            <div className="relative w-full"> 
                <select
                    value={value}
                    required={required}
                    onChange={handleSelectChange}
                    className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                >
                    <option value="">{defaultLabel}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none text-gray-500 w-4 h-4" />
            </div>
        </div>
    );
};

export default FormSelectField;