import React, { useEffect, useState } from 'react'
import { BadgeInfo } from 'lucide-react'
import TextInput from './ui/TextInput'
import Select from 'react-select'
import { getTiposFianza, getRamosFianza } from '../services/tramites.service'

export default function InfoTramite({ formData, setFormData }) {
    const [tiposOpciones, setTiposOpciones] = useState([])

    useEffect(() => {
        getTiposFianza().then(res => {
            const opciones = res.results.map(t => ({
                value: t.id,
                label: `${t.ramo_nombre} – ${t.nombre}`,
            }))
            setTiposOpciones(opciones)
        })

    }, [formData])

    const handleChange = (e) =>
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

    const handleTipoFianza = (opcion) =>
        setFormData(prev => ({ ...prev, tipo_fianza: opcion ? opcion.value : null }))

    const tipoSeleccionado = tiposOpciones.find(o => o.value === formData.tipo_fianza) || null

    return (
        <div className=' bg-white rounded-xl w-full'>
            <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-4'>
                    <TextInput
                        label="Número de Fianza"
                        name="fianza"
                        value={formData.fianza || ''}
                        onChange={handleChange}
                    />
                    <TextInput
                        label="Relativo A"
                        name="relativo_a"
                        value={formData.relativo_a || ''}
                        onChange={handleChange}
                    />
                    <div>
                        <p className='text-sm text-teal-600 mb-1'>Tipo de Fianza</p>
                        <Select
                            options={tiposOpciones}
                            value={tipoSeleccionado}
                            onChange={handleTipoFianza}
                            placeholder="Selecciona un tipo..."
                            isClearable
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}