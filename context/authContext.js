"use client"

/* react */
import { createContext, useState, useEffect } from "react";

/* firebase */
import { auth } from "@/firebase/client-config";
import { onAuthStateChanged } from "firebase/auth";

export const Context = createContext()

export function AuthContext({ children }) {
  const [loginUser, setLoginUser] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, currentUser => {
      setLoading(false)
      if (currentUser) setUser(currentUser)
      else setLoginUser(null)
    })
    return () => unsub()
  }, [])

  const values = {
    loginUser,
    setLoginUser,
    loading,
    setLoading
  }

  return (
    <Context.Provider value={values}>
      {!loading && children}
    </Context.Provider>
  )
}
