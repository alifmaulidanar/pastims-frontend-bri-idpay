// User type definition
export interface User {
  id: string;
  user_id: string;
  email: string;
  username: string;
  password: string;
  phone: string;
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
