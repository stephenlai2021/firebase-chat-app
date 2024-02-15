"use client";

/* react */
import { useEffect, useState } from "react";

/* next */
import { useRouter } from "next/navigation";

/* firebase */
import { auth } from "@/firebase/client-config";
import { onAuthStateChanged } from "firebase/auth";

export default function DashboardPageLayout({ children }) {
  const router = useRouter();
  const [isUserValid, setIsUserValid] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      onAuthStateChanged(auth, user => {
        if (user) setIsUserValid(true)
        else router.push('/login')
      })
    }
    checkAuth()
  }, [])

  if (isUserValid) {
    return children
  }
}