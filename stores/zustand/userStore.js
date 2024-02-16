import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set) => ({
      userCredential: null,
      setUserCredential: (newUserCredential) => set(() => ({ userCredential: newUserCredential })),
      userData: {},
      setUserData: (newUserData) => set(() => ({ userData: newUserData })),
    }),
    {
      name: "loginUser", // local storage  
    }
  )
);
