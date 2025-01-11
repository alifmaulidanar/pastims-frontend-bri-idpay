import { Ticket, TicketPhoto } from '@/types';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch tickets from the backend API
export const fetchTickets = async (): Promise<Ticket[]> => {
  try {
    const response = await fetch(`${BASE_URL}/tickets`);
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }
};

// Fetch ticket with photos by ticket_id from the backend API
export const fetchTicketPhotos = async (ticket_id: string): Promise<TicketPhoto> => {
  try {
    const response = await fetch(`${BASE_URL}/ticket/photo/${ticket_id}`);
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return { photos: [] } as TicketPhoto;
  }
};