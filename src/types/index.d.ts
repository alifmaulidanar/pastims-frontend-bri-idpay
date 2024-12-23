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
  ticket_id: string;
  trip_id?: string;
  user_id: string;
  geofence_id: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}