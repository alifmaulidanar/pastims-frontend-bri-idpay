/* eslint-disable @typescript-eslint/no-explicit-any */
import { Geofence, Ticket, TicketPhoto, User } from '@/types';

const BASE_URL = import.meta.env.VITE_abu_V2;

// Fetch tickets from the backend API
export const fetchTickets = async (): Promise<{
  users: User[];
  geofences: Geofence[];
  tickets: Ticket[];
  trips: any[];
}> => {
  try {
    const token = localStorage.getItem("sb-dobdbdahljvbkymkssgm-auth-token");
    const response = await fetch(`${BASE_URL}/admin/tickets`, {
      headers: {
        Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch tickets data:", errorData.message);
      throw new Error(errorData.message);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching tickets data:", error);
    throw error;
  }
};

// Fetch ticket with photos by ticket_id from the backend API
export const fetchTicketPhotos = async (ticket_id: string): Promise<TicketPhoto> => {
  try {
    const token = localStorage.getItem("sb-dobdbdahljvbkymkssgm-auth-token");
    const response = await fetch(`${BASE_URL}/admin/tickets/photo/${ticket_id}`, {
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