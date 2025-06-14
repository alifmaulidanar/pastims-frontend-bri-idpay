/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from '@/utils/supabase';

// Interfaces for ticket search
interface Ticket {
  ticket_id?: string;
  geofence_id?: string;
  geofence_tag?: string;
  description?: string;
  trip_id?: string;
  sn_edc?: string;
  additional_info?: {
    tag?: string;
    TID?: string;
    tid?: string;
    ["SN EDC"]?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface TicketDetails {
  ticket: Ticket;
  ticket_extras: unknown[];
  geofence?: any;
  user?: any;
}

// Search for ticket by ticket_id
export const searchTicketByTicketId = async (ticketId: string): Promise<TicketDetails | null> => {
  try {
    // Trim the ticket_id to remove any spaces
    const trimmedTicketId = ticketId.trim();

    if (!trimmedTicketId) {
      return null;
    }

    // Search in tickets table
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .select(
        'ticket_id,trip_id,user_id,geofence_id,description,status,created_at,updated_at,validation_status,validated_at,validated_by,hold_noted,hold_at,hold_by'
      )
      .eq('ticket_id', trimmedTicketId)
      .single();

    if (ticketError) {
      console.error("Error searching for ticket:", ticketError);
      return null;
    }

    // If ticket found, search for ticket_extras
    if (ticketData) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', ticketData.user_id)
        .single();

      if (userError) {
        console.error("Error searching for user:", userError);
      }

      const { data: ticketExtrasData, error: ticketExtrasError } = await supabase
        .from('ticket_extras')
        .select('*')
        .eq('ticket_id', trimmedTicketId);

      if (ticketExtrasError) {
        console.error("Error searching for ticket extras:", ticketExtrasError);
      }

      const { data: geofenceData, error: geofenceError } = await supabase
        .from('geofences')
        .select('*')
        .eq('external_id', ticketData.geofence_id)
        .single();

      if (geofenceError) {
        console.error("Error searching for geofence:", geofenceError);
      }

      // Return combined data
      return {
        user: userData || null,
        ticket: ticketData,
        ticket_extras: ticketExtrasData || [],
        geofence: geofenceData || null,
      };
    }

    return null;
  } catch (error) {
    console.error("Error in searchTicketByTicketId:", error);
    return null;
  }
};

// Unified quick search function
export const quickSearch = async (query: string): Promise<TicketDetails[] | null> => {
  try {
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery) return null;

    // Perform a combined search for both ticket_id and tid in a single query
    const { data: ticketsData, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .or(`ticket_id.eq.${trimmedQuery}`)

    if (ticketError) {
      console.error('Error searching for tickets:', ticketError);
      return null;
    }
    if (!ticketsData || ticketsData.length === 0) return [];

    // For each ticket, fetch user, ticket_extras, geofence
    const results: TicketDetails[] = await Promise.all(
      ticketsData.map(async (ticketData: any) => {
        const [{ data: userData }, { data: ticketExtrasData }, { data: geofenceData }] = await Promise.all([
          supabase.from('users').select('*').eq('user_id', ticketData.user_id).single(),
          supabase.from('ticket_extras').select('*').eq('ticket_id', ticketData.ticket_id),
          supabase.from('geofences').select('*').eq('external_id', ticketData.geofence_id).single(),
        ]);
        return {
          user: userData || null,
          ticket: ticketData,
          ticket_extras: ticketExtrasData || [],
          geofence: geofenceData || null,
        };
      })
    );
    return results;
  } catch (error) {
    console.error("Error in quickSearch:", error);
    return null;
  }
};

// Function to load ticket details to form data (for start ticket)
export const loadTicketToStartFormData = (ticketDetails: TicketDetails) => {
  if (!ticketDetails || !ticketDetails.ticket) {
    return null;
  }

  // Extract needed data from the ticket and ticket_extras
  const { ticket } = ticketDetails;

  return {
    ticket_id: ticket.ticket_id || "",
    geofence_id: ticket.geofence_id || "",
    geofence_tag: ticket.additional_info?.tag || "",
    description: ticket.description || "",
    tid: ticket.additional_info?.TID || ticket.additional_info?.tid || "",
    sn_edc: ticket.additional_info?.["SN EDC"] || ticket.sn_edc || "",
  };
};

// Function to load ticket details to form data (for fix ticket)
export const loadTicketToFixFormData = (ticketDetails: TicketDetails) => {
  if (!ticketDetails || !ticketDetails.ticket) {
    return null;
  }

  // Extract needed data from the ticket and ticket_extras
  const { ticket } = ticketDetails;

  return {
    ticket_id: ticket.ticket_id || "",
    trip_id: ticket.trip_id || "",
    tid: ticket.additional_info?.TID || ticket.additional_info?.tid || "",
    sn_edc: ticket.additional_info?.["SN EDC"] || ticket.sn_edc || "",
  };
};
