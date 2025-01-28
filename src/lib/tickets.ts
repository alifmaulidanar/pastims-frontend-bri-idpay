import { Ticket, TicketPhoto } from '@/types';
const BASE_URL = import.meta.env.VITE_API_BASE_URL_V2;

// Fetch tickets from the backend API
export const fetchTickets = async (): Promise<Ticket[]> => {
  try {
    const token = localStorage.getItem("sb-dobdbdahljvbkymkssgm-auth-token");
    const response = await fetch(`${BASE_URL}/ticket/admin/tickets`, {
      // const response = await fetch(`${BASE_URL}/ticket/tickets`, {
      headers: {
        Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch users:", errorData.message);
      return [];
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }
};

// Fetch ticket with photos by ticket_id from the backend API
export const fetchTicketPhotos = async (ticket_id: string): Promise<TicketPhoto> => {
  try {
    const token = localStorage.getItem("sb-dobdbdahljvbkymkssgm-auth-token");
    const response = await fetch(`${BASE_URL}/ticket/photo/${ticket_id}`, {
      headers: {
        Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch users:", errorData.message);
      return { photos: [] } as TicketPhoto;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return { photos: [] } as TicketPhoto;
  }
};