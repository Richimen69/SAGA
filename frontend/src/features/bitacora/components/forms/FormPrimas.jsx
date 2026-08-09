import React from 'react';
import { InputPrima } from "@/features/bitacora/components/ui/InputPrima";

/**
 * * @param {object} props
 * @param {object} props.formData - El objeto de estado actual del formulario.
 * @param {function} props.setFormData - La función para actualizar el estado del formulario.
 */
const FormPrimas = ({ formData, setFormData, negative }) => {

    // Función auxiliar para manejar el cambio en los campos editables
    const handlePrimaChange = (key) => (value) => {
        setFormData((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    // Lógica para calcular la Prima Total
    const calcularPrimaTotal = () => {
        const inicial = parseFloat(formData.prima_inicial) || 0;
        const futura = parseFloat(formData.prima_futura) || 0;
        const total = inicial + futura;
        
        // Devuelve una cadena vacía si el total es 0, de lo contrario devuelve el total
        return total === 0 ? "" : total;
    };

    return (
        <div className="grid gap-6 md:grid-cols-4 w-full">
            {/* 1. Prima inicial */}
            <div>
                <p className="text-sm font-medium text-teal-600">
                    Prima inicial
                </p>
                <InputPrima
                    value={formData.prima_inicial}
                    onChange={handlePrimaChange('prima_inicial')}
                    negative={negative}
                />
            </div>

            {/* 2. Prima futura */}
            <div>
                <p className="text-sm font-medium text-teal-600">
                    Prima futura
                </p>
                <InputPrima
                    value={formData.prima_futura}
                    onChange={handlePrimaChange('prima_futura')}
                    negative={negative}
                />
            </div>

            {/* 3. Prima total (Calculada y deshabilitada) */}
            <div>
                <p className="text-sm font-medium text-teal-600">
                    Prima total
                </p>
                <InputPrima
                    value={calcularPrimaTotal()}
                    disabled // Deshabilitado porque es un campo calculado
                    negative={negative}
                />
            </div>

            {/* 4. Importe total */}
            <div>
                <p className="text-sm font-medium text-teal-600">
                    Importe total
                </p>
                <InputPrima
                    value={formData.importe_total}
                    onChange={handlePrimaChange('importe_total')}
                    negative={negative}
                />
            </div>
        </div>
    );
};

export default FormPrimas;