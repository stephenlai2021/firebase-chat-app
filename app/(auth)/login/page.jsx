"use client";

import { useState } from "react";

/* firebase */
import { auth, firestore } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc, query, collection, getDocs, where } from "firebase/firestore";

/* next */
import { useRouter } from "next/navigation";
import Link from "next/link";

/* 3rd-party libraries */
import { toast } from "react-hot-toast";

function page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {};
    if (!email.trim() || !emailRegex.test(email)) {
      newErrors.email = "Invalid email address";
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    try {
      if (validateForm()) {
        // Register user with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        if (user) {
          /* 把 firestore 的 users 收集的登陸用戶狀態設置為 "online" */
          const loginUserRef = doc(firestore, "users", user.email);
          await updateDoc(loginUserRef, { status: "online" });
          console.log("You are online");

          /* 把 firestore 的 chatrooms 收集的登陸用戶狀態設置為 "online" */
          const chatroomsQuery = query(
            collection(firestore, "chatrooms"),
            where("users", "array-contains", user.uid)
          );
          const querySnapshot = await getDocs(chatroomsQuery);
          querySnapshot.forEach(async (document) => {
            console.log(document.id, " => ", document.data());

            await updateDoc(doc(firestore, "chatrooms", document.id), {
              [`usersData.${user.uid}.status`]: "online",
            });
          });

          router.push("/");
        }
        setErrors({});
      }
    } catch (error) {
      // Handle registration errors
      console.error("Error logging in user:", error.message);
      toast.error(error.message);
      setErrors({});
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen font-primary p-10 m-2">
      {/*form*/}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-2xl shadow-lg p-10"
      >
        <h1 className="font-secondary text-xl text-center font-semibold text-[#0b3a65ff]">
          CHAT<span className="font-bold text-[#eeab63ff]">2</span>CHAT
        </h1>

        {/*email*/}
        <div>
          <label className="label">
            <span className="text-base label-text">Email</span>
          </label>
          <input
            type="text"
            placeholder="Email"
            className="w-full input input-bordered text-base pl-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="text-red-500">{errors.email}</span>}
        </div>

        {/*password*/}
        <div>
          <label className="label">
            <span className="text-base label-text">Password</span>
          </label>
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full input input-bordered text-base pl-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <span className="text-red-500">{errors.password}</span>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="btn btn-block bg-[#0b3a65ff] text-white"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Sign In"
            )}
          </button>
        </div>

        <span>
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Register
          </Link>
        </span>
      </form>
    </div>
  );
}

export default page;
