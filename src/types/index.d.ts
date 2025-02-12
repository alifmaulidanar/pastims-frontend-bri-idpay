/* eslint-disable @typescript-eslint/no-explicit-any */
// User type definition
export interface User {
  id: string;
  user_id: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  password: string;
}

// Profile type definition
export interface Profile {
  id: integer;
  user_id: string;
  email: string;
  username: string;
  phone: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

// Radar User type definition
export interface UserRadar {
  _id: string;
  userId?: string;
  user_id?: string;
  deviceId?: string;
  ip: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  failureReasons?: string;
  foreground: boolean;
  background: boolean;
  stopped: boolean;
  live: boolean;
  location: { coordinates: [number, number] };
  metadata?: any;
  geofences?: any;
}

// Geofence type definition
export interface Geofence {
  id: string;
  radar_id: string;
  external_id: string;
  description: string;
  tag: string;
  type: string;
  radius: string;
  coordinates: [number, number];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Radar Geofence type definition
export interface GeofenceRadar {
  _id: string;
  createdAt: string;
  updatedAt: string;
  live: boolean;
  description?: string;
  tag?: string;
  externalId?: string;
  type: string;
  mode: string;
  geometryCenter: {
    type: string;
    coordinates: [number, number];
  };
  geometryRadius: number;
  geometry: {
    type: string;
    coordinates: [number, number][];
  };
  enabled: boolean;
}

export interface Ticket {
  id: string;
  ticket_id: string;
  trip_id?: string;
  user_id: string;
  geofence_id: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TicketPhoto {
  photos: string[];
}

export interface Trip {
  externalId: string,
  userId: string,
  username: string,
  geofenceId: string,
  geofenceDescription: string,
  geofenceTag: string,
  status: string,
  createdAt: string,
  updatedAt: string,
}