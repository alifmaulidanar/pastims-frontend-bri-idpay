import { Ticket } from '@/types';
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
