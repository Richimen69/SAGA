import React from 'react'
import { DollarSign } from 'lucide-react'

export default function DesglosePrimas() {
    return (
        <div className='p-5 bg-white rounded-xl'>
            <div className='flex gap-2 items-center'>
                <span className='text-white bg-gray-500 rounded-full p-1.5 flex items-center justify-center'><DollarSign /></span>
                <p className='text-xl text-primary font-bold'>Desglose</p>
            </div>
            <div>
                
            </div>
        </div>
    )
}
