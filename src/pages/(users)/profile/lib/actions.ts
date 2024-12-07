import { Profile } from "@/types";

export const getProfile = async (user_id: string): Promise<Profile> => {
  try {
    const response = await fetch("http://127.0.0.1:8787/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "user_id": user_id,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      console.error("Error fetching user profile:", data.message || "Unknown error");
      throw new Error(data.message || "Unknown error");
    }

    const data = await response.json();
    return data as Profile;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
