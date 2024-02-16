"use client";

/* react */
import { useEffect, useState } from "react";

/* next */
import { useRouter } from "next/navigation";

/* firebase */
import { auth, firestore } from "@/firebase/client-config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

/* components */
import LoadingSkeleton from "@/components/skeleton/LoadingSkeleton";

/* stores - zustand */
import { useUserStore } from "@/stores/zustand/userStore";

/* 
  Donot remove this block !!! 
  It works with useUser hook in Main component
*/
// export default function DashboardPageLayout({ children }) {
//   const router = useRouter();
//   const [isUserValid, setIsUserValid] = useState(false);

//   useEffect(() => {
//     const checkAuth = () => {
//       onAuthStateChanged(auth, user => {
//         if (user) setIsUserValid(true)
//         if (!user) router.push('/login')
//       })
//     }
//     checkAuth()
//     console.log()
//   }, [isUserValid, router])

//   if (isUserValid) return children
//   if (!isUserValid) return <LoadingSkeleton />
// }

export default function DashboardPageLayout({ children }) {
  const [isUserValid, setIsUserValid] = useState(false);

  const router = useRouter();
  const { setUserData } = useUserStore();

  useEffect(() => {
    const checkAuthAndGetUserData = () => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) router.push("/login");

        if (user) {
          
          const docRef = doc(firestore, "users", user.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setIsUserValid(true);
          } else {
            console.log("No such document!");
          }
        }
      });
    };
    checkAuthAndGetUserData();
    console.log();
  }, [isUserValid, router]);

  if (isUserValid) return children;
  if (!isUserValid) return <LoadingSkeleton />;
}
