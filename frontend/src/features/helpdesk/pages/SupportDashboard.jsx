import React, { useState, useEffect } from 'react';
import { getSupportTickets, getSupportCategories } from '../services/supportService';
import TicketList from '../components/TicketList';
import CreateTicketForm from '../components/CreateTicketForm';

export default function SupportDashboard({users}) {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('authUser')) || { id: '1', name: 'Juan Pérez', role: 'USER' };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, categoriesRes] = await Promise.all([
        getSupportTickets(), // ¡Ya no pasamos ID ni Rol, Django usa el JWT!
        getSupportCategories()
      ]);
      
      // FIX: Buscamos ".results" por la paginación de Django y validamos que sea arreglo
      const ticketsArray = ticketsRes.results || ticketsRes.data || ticketsRes;
      setTickets(Array.isArray(ticketsArray) ? ticketsArray : []);

      const categoriesArray = categoriesRes.results || categoriesRes.data || categoriesRes;
      setCategories(Array.isArray(categoriesArray) ? categoriesArray : []);
      
    } catch (error) {
      console.error("Error cargando datos:", error);
      // Fallback seguro en caso de error
      setTickets([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTicketCreated = () => {
    setShowCreateForm(false);
    fetchData(); // Recargamos la tabla para mostrar el nuevo ticket
  };

  return (
    <div className="min-h-screen p-6 font-sans text-gray-700">
      {showCreateForm ? (
        <CreateTicketForm 
          categories={categories} 
          currentUser={currentUser}
          onCancel={() => setShowCreateForm(false)}
          onSuccess={handleTicketCreated}
          users={users}
        />
      ) : (
        <TicketList 
          tickets={tickets} 
          loading={loading} 
          onNewTicket={() => setShowCreateForm(true)} 
        />
      )}
    </div>
  );
}