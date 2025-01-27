/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRadar, User } from "@/types";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch users from the backend API
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const token = localStorage.getItem("sb-dobdbdahljvbkymkssgm-auth-token");
    const response = await fetch(`${BASE_URL}/user/users`, {
      headers: {
        Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
      },
    });
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Get Radar Users
export const fetchRadarUsers = async (setUsers: any) => {
  try {
    const token = localStorage.getItem("sb-dobdbdahljvbkymkssgm-auth-token");
    const response = await fetch(`${BASE_URL}/user/radar/users`, {
      headers: {
        Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch users:", errorData.message);
      return;
    }
    const data = await response.json();
    setUsers(data.users);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

// Get Radar Users' Locations
export const fetchUserLocations = async (): Promise<UserRadar[] | undefined> => {
  try {
    const token = localStorage.getItem("sb-dobdbdahljvbkymkssgm-auth-token");
    const response = await fetch(`${BASE_URL}/user/radar/users`, {
      headers: {
        Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch user locations:", errorData.message);
      return;
    }

    const data = await response.json();
    const uniqueUsers = data.users.reduce((acc: Record<string, UserRadar>, user: UserRadar) => {
      const existingUser = user.userId ? acc[user.userId] : undefined;
      if (!existingUser || new Date(user.updatedAt) > new Date(existingUser.updatedAt)) {
        if (user.userId) {
          acc[user.userId] = user;
        }
      }
      return acc;
    }, {});
    return Object.values(uniqueUsers);
  } catch (error) {
    console.error("Error fetching user locations:", error);
  }
};