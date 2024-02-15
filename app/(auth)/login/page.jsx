"use client";

/* react */
import { useState, useContext } from "react";

/* context */
import { Context } from "@/context/authContext";

/* firebase */
import { auth, googleAuthProvider, firestore } from "@/firebase/client-config";
import {
  signInWithEmailAndPassword,
  getRedirectResult,
  signInWithRedirect,
} from "firebase/auth";
import {
  doc,
  updateDoc,
  query,
  collection,
  getDocs,
  where,
} from "firebase/firestore";

/* next */
import { useRouter } from "next/navigation";
import Link from "next/link";

/* utils */
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

function LoginPage() {
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
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        if (user) {
          /* 把 users colletion 的用戶狀態設置為 "online" */
          const loginUserRef = doc(firestore, "users", user.email);
          await updateDoc(loginUserRef, { status: "online" });
          console.log("You are online");

          /* 把 chatrooms colletion 的用戶狀態設置為 "online" */
          const chatroomsQuery = query(
            collection(firestore, "chatrooms"),
            where("users", "array-contains", user.uid)
          );
          const querySnapshot = await getDocs(chatroomsQuery);
          querySnapshot.forEach(async (document) => {
            await updateDoc(doc(firestore, "chatrooms", document.id), {
              [`usersData.${user.uid}.status`]: "online",
            });
          });

          router.push("/");
          setLoading(false);
        }
        setErrors({});
      }
    } catch (error) {
      // Handle registration errors
      console.error("Error logging in user:", error.message);
      toast.error(error.message);
      setErrors({});
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen font-primary px-8 m-2">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-[600px] shadow-l pt-10 pl-10 pr-10 form-padding"
      >
        <h1 className="font-secondary text-xl text-center font-semibold text-base-content">
          CHAT<span className="font-bold text-[#eeab63ff]">2</span>CHAT
        </h1>
        <div>
          <label className="label">
            <span className="text-base label-text">Email</span>
          </label>
          <input
            type="text"
            placeholder="Email"
            className="w-full input input-bordered rounded-md text-base-content pl-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="text-red-500">{errors.email}</span>}
        </div>
        <div>
          <label className="label">
            <span className="text-base label-text">Password</span>
          </label>
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full input input-bordered rounded-md text-base-content pl-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <span className="text-red-500">{errors.password}</span>
          )}
        </div>
        <div>
          <button type="submit" className="btn btn-block btn-accent">
            {loading ? (
              <span className="loading loading-spinner loading-sm text-accent-content"></span>
            ) : (
              "Sign In"
            )}
          </button>
        </div>
        <span className="text-base-content">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-base-content hover:underline"
          >
            Register
          </Link>
        </span>
      </form>

      <div className="max-w-[600px] w-full px-10 form-padding">
        <div className="divider divider-base-300 text-base-content">OR</div>
        <button className="btn bg-red-400 w-full" onClick={() => signIn()}>
          <FcGoogle className="w-[20px] h-[20px]" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
