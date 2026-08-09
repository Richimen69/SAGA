
import React from 'react';
import DatePicker from 'react-datepicker';
import { parse, format } from 'date-fns'; 
import 'react-datepicker/dist/react-datepicker.css';

const FormDataPicker = ({ label, value, onChange, name }) => {

    const handleDateChange = (date) => {
        if (date) {
            const formattedDate = format(date, "dd/MM/yyyy");
            onChange(name, formattedDate); // Llama al handler en el componente padre
        } else {
             onChange(name, null); // Permite limpiar la fecha
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <p>{label}</p>
            <div className="relative w-full">
                <DatePicker
                    showIcon
                    toggleCalendarOnIconClick
                    selected={
                        value
                            ? parse(value, "dd/MM/yyyy", new Date()) // Convierte el string a Date
                            : null
                    }
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    className="block w-full rounded-md border border-gray-200 text-sm focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-primary"
                    wrapperClassName="w-full"
                />
            </div>
        </div>
    );
};

export default FormDataPicker;