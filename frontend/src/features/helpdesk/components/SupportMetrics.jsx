import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
// Importamos los iconos de Lucide
import { Ticket, UserCheck, Archive, Clock, Activity } from 'lucide-react';
import { getSupportMetrics } from '../services/supportService';

// Paleta de colores moderna
const COLORS = {
  opened: '#6366f1',   // Indigo
  solved: '#10b981',   // Emerald
  closed: '#64748b',   // Slate
  pending: '#f59e0b',  // Amber
  problems: '#f43f5e', // Rose
  barDefault: '#8b5cf6' // Violet
};

export default function SupportMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await getSupportMetrics();
        setMetrics(res.data || res);
      } catch (error) {
        console.error("Error cargando métricas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <div className="min-h-screen flex justify-center items-center text-gray-500">Cargando métricas...</div>;
  if (!metrics) return null;

  const { kpis, monthlyData, topCategories, topSources, topRequesters } = metrics;

  return (
    <div className="min-h-screen p-6 font-sans text-gray-700">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Soporte IT</h1>
        </div>

        {/* LAYOUT PRINCIPAL: Grid de 12 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUMNA IZQUIERDA: KPIs (Ocupa 2 columnas) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <KpiCard 
              title="Total Casos" 
              value={kpis.total} 
              color="bg-indigo-50" 
              textColor="text-indigo-700" 
              icon={<Ticket size={24} strokeWidth={2} />} 
            />
            <KpiCard 
              title="Asignados" 
              value={kpis.assigned} 
              color="bg-white" 
              textColor="text-gray-800" 
              icon={<UserCheck size={24} strokeWidth={2} className="text-gray-500" />} 
            />
            <KpiCard 
              title="Cerrados" 
              value={kpis.closed} 
              color="bg-slate-800" 
              textColor="text-white" 
              icon={<Archive size={24} strokeWidth={2} className="text-slate-400" />} 
            />
            <KpiCard 
              title="Pendientes" 
              value={kpis.pending} 
              color="bg-amber-50" 
              textColor="text-amber-700" 
              icon={<Clock size={24} strokeWidth={2} />} 
            />
            <KpiCard 
              title="En Progreso" 
              value={kpis.problems} 
              color="bg-rose-50" 
              textColor="text-rose-700" 
              icon={<Activity size={24} strokeWidth={2} />} 
            />
          </div>

          {/* COLUMNA DERECHA: Gráficos (Ocupa 10 columnas) */}
          <div className="lg:col-span-10 flex flex-col gap-6">
            
            {/* FILA 1: Gráficos de Tiempo (Área y Barras Apiladas) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Evolución (Área) */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Evolución del caso (Últimos 6 meses)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.opened} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS.opened} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Area type="monotone" name="Abiertos" dataKey="opened" stroke={COLORS.opened} strokeWidth={3} fillOpacity={1} fill="url(#colorOpened)" />
                      <Area type="monotone" name="Cerrados" dataKey="closed" stroke={COLORS.closed} strokeWidth={3} fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Estado por Mes (Barras Apiladas) */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Estado de casos por mes</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Bar name="Pendientes" dataKey="pending" stackId="a" fill={COLORS.pending} radius={[0, 0, 4, 4]} />
                      <Bar name="Resueltos" dataKey="solved" stackId="a" fill={COLORS.solved} />
                      <Bar name="Cerrados" dataKey="closed" stackId="a" fill={COLORS.closed} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* FILA 2: Gráficos de Barras (Categorías, Fuentes, Solicitantes) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Categorías (Barras Horizontales) */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Principales Categorías</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCategories} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="count" fill={COLORS.solved} radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fill: '#94a3b8', fontSize: 12 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Fuentes (Barras Verticales) */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Fuentes de Solicitud</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSources} margin={{ top: 20, right: 0, left: -30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="count" fill={COLORS.opened} radius={[4, 4, 0, 0]} barSize={40} label={{ position: 'top', fill: '#94a3b8', fontSize: 12 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Solicitantes (Barras Horizontales) */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Principales Solicitantes</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topRequesters} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={90} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="count" fill={COLORS.barDefault} radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fill: '#94a3b8', fontSize: 12 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar actualizado para recibir el Icono de Lucide
function KpiCard({ title, value, color, textColor, icon }) {
  return (
    <div className={`${color} p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center h-32 transition-transform hover:scale-[1.02]`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className={`text-xs font-bold uppercase tracking-wider opacity-80 ${textColor}`}>{title}</h3>
        {/* Renderizamos el icono directamente */}
        <div className={textColor}>{icon}</div>
      </div>
      <p className={`text-4xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}