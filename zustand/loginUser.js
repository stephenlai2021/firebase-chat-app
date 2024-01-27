import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStore = create(
  persist(
    (set) => ({
      loginUser: {},
      // inc: () => set((state) => ({ count: state.count + 1 })),
      // dec: () => set((state) => ({ count: state.count - 1 })),
    }),
    {
      // name of the item in the storage (must be unique)
      name: "users-storage", 
      // (optional) by default, 'localStorage' is used
      // storage: createJSONStorage(() => sessionStorage), 
    }
  )
);

export default useStore;
