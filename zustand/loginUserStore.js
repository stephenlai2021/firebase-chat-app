import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useLoginUserStore = create(
  persist(
    (set) => ({
      loginUser: null,
      userCredential: null,
      setLoginUser: (newLoginUser) => set(() => ({ loginUser: newLoginUser })),
      setUserCredential: (newUserCredential) => set(() => ({ userCredential: newUserCredential }))
    }),
    {
      // name of the item in the storage (must be unique)
      name: "loginUser-storage", 
      // (optional) by default, 'localStorage' is used
      // storage: createJSONStorage(() => sessionStorage), 
    }
  )
);
