/* react */
import { useState, useEffect } from "react";

/* firebase */
import { firestore, auth } from "@/firebase/client-config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";

/* Donot delete this hook !!! */
// export function useUser() {
//   const [user, setUser] = useState(null | false)

//   useEffect(() => {
//     return onAuthStateChanged(auth, user => setUser(user))
//   }, [])

//   return { user }
// }

export function useUserData() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // console.log("user credential | useUserData hooks: ", user);
        const docRef = doc(firestore, "users", user.email);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
        } else {
          console.log("No such document!");
        }
      }
    });
  }, []);

  return { userData };
}
