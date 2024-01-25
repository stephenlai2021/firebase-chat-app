"use client";

/* react */
import { useState, useRef } from "react";

/* next */
import Link from "next/link";
import { useRouter } from "next/navigation";

/* 3rd party libraries */
import { toast } from "react-hot-toast";

/* firebase */
import { auth, firestore } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";


function page() {  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);

  const router = useRouter();
  const inputFile = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      setFile(selectedFile);
    } else {
      setFile(null);
      return;
    }

    // Display image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected.");
      return;
    }
    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Error uploading file:", error.message);
      },
      () => {
        // Upload complete, get download URL and log it
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // Reset file && upload progress state and update message with download URL
          setFile(null);
          setUploadProgress(0);
          console.log("File available at", downloadURL);

          // setImage(downloadURL);
          setAvatarUrl(downloadURL)
          console.log("image | downloadURL: ", downloadURL);

          // Clear image preview
          setImagePreview(null);
          inputFile.current.value = "";
          document.getElementById("dashboard").close();
        });
      }
    );
  };

  const closeAndClearModal = () => {
    inputFile.current.value = "";
    setImagePreview(null);
    document.getElementById("dashboard").close();
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!email.trim() || !emailRegex.test(email)) {
      newErrors.email = "Invalid email address";
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    try {
      if (validateForm()) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user

        const docRef = doc(firestore, "users", email);
        await setDoc(docRef, {
          id: user.uid,
          name,
          email,
          avatarUrl,
          status: "online",
          createdAt: serverTimestamp(),
        });
        console.log('You are online')

        router.push("/");
        setErrors({});
      }
    } catch (error) {
      console.error("Error registering user:", error.message);
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

        {/* Display the avatar and upload button */}
        <div className="flex items-center space-y-2 justify-between p-2">
          <img
            src={avatarUrl ? avatarUrl : './avatar.png'}
            alt="Avatar"
            className="rounded-full h-[50px] w-[50px]"
          />
          <button
            type="button"
            className="btn btn-outline btn-md"
            onClick={() => document.getElementById("dashboard").showModal()}
          >
            Upload Image
          </button>
        </div>

        <div>
          <label className="label">
            <span className="text-base label-text">Name</span>
          </label>
          <input
            type="text"
            placeholder="Name"
            className="w-full input input-bordered pl-1 text-base"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <span className="text-red-500">{errors.name}</span>}
        </div>

        <div>
          <label className="label">
            <span className="text-base label-text">Email</span>
          </label>
          <input
            type="text"
            placeholder="Email"
            className="w-full input input-bordered pl-1 text-base"
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
            className="w-full input input-bordered pl-1 text-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <span className="text-red-500">{errors.password}</span>
          )}
        </div>

        <div>
          <label className="label">
            <span className="text-base label-text">Confirm Password</span>
          </label>
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full input input-bordered pl-1 text-base"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <span className="text-red-500">{errors.confirmPassword}</span>
          )}
        </div>

        <div>
          <button type="submit" className="btn btn-block bg-[#0b3a65ff] text-white">
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Sign Up"
            )}
          </button>
        </div>

        <span className="">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Login
          </Link>
        </span>
      </form>

      {/* image preview modal */}
      <dialog id="dashboard" className="modal">
        <div className="modal-box relative">
          <form method="dialog" className="flex justify-center">
            <div className="border border-2">
              {imagePreview && (
                <div className="relative">
                  <img
                    src="./upload-icon.png"
                    alt="upload icon"
                    className="w-[40px] absolute top-[-20px] left-[50%] translate-x-[-50%] hover:cursor-pointer"
                    onClick={handleUpload}
                  />
                  <div className="flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Uploaded"
                      className="max-h-60 max-w-xs mb-4 rounded"
                    />
                  </div>
                  <progress
                    value={uploadProgress}
                    className="progress progress-primary absolute bottom-0 left-0 z-50"
                    max="100"
                  ></progress>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                ref={inputFile}
                className="mt-2 file-input file-input-bordered file-input-primary w-full max-w-xs"
                onChange={handleFileChange}
              />
            </div>
          </form>
          <button
            className="btn btn-sm btn-circle btn-ghost absolute top-0 right-2 top-2"
            onClick={closeAndClearModal}
          >
            ✕
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default page;
