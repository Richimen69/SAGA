import fetchApi from "@/shared/services/apiNew";

// Asumimos que fetchApi ya apunta a "/api/", 
// por lo que solo agregamos "helpdesk/" al inicio de cada ruta.

export const createSupportTicket = async (ticketData, files) => {
  const formData = new FormData();

  formData.append("title", ticketData.title);
  formData.append("description", ticketData.description);
  if (ticketData.categoryId) formData.append("categoryId", ticketData.categoryId);
  if (ticketData.caseType) formData.append("caseType", ticketData.caseType);
  if (ticketData.source) formData.append("source", ticketData.source);
  
  if (ticketData.creatorId) formData.append("creatorId", ticketData.creatorId);

  if (files && files.length > 0) {
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
  }

  return await fetchApi("helpdesk/tickets/", { method: "POST", body: formData });
};

export const addSupportComment = async (ticketId, text, files) => {
  const formData = new FormData();

  formData.append("ticketId", ticketId);
  formData.append("text", text);

  if (files && files.length > 0) {
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
  }

  return await fetchApi("helpdesk/comments/", {
    method: "POST",
    body: formData,
  });
};

export const updateSupportTicketStatus = async (ticketId, status, techId) => {
  return await fetchApi(`helpdesk/tickets/${ticketId}/status/`, {
    method: "PATCH", // Para actualizar un solo campo usamos PATCH
    body: JSON.stringify({
      newStatus: status,
      techId: techId,
    }),
  });
};

export const getSupportTickets = async () => {
  return await fetchApi("helpdesk/tickets/");
};

export const getSupportTicketById = async (ticketId) => {
  return await fetchApi(`helpdesk/tickets/${ticketId}/`);
};

export const getSupportMetrics = async () => {
  return await fetchApi("helpdesk/metrics/metrics/");
};

export const getSupportCategories = async () => {
  return await fetchApi("helpdesk/categories/");
};

export const createSupportCategory = async (data) => {
  return await fetchApi("helpdesk/categories/", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateSupportCategory = async (id, data) => {
  return await fetchApi(`helpdesk/categories/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// Si configuraste la vista para traer a los técnicos en Django
export const getTechUsers = async () => {
  return await fetchApi("helpdesk/techs/"); 
};