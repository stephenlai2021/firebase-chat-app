/* react */
import { useState, useRef } from "react";

/* firebase */
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

/* 3rd-pary libraries */
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import EmojiPicker from "emoji-picker-react";

function MessageInput({ sendMessage, message, setMessage, image, setImage }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [input, setInput] = useState(null)

  const inputFile = useRef(null)

  const handleFileChange = (e) => {
    setInput(null);
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
          console.log("File available at", downloadURL);
          // save downloadURL into message

          // Reset file && upload progress state and update message with download URL
          setFile(null);
          setUploadProgress(0);
          setImage(downloadURL);

          // Clear image preview
          setImagePreview(null);
          document.getElementById("dashboard").close();
        });
      }
    );
  };

  const handleEmojiClick = (emojiData, event) => {
    // Append the selected emoji to the message state
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  const handleSubmit = (event) => {
    if (event.key === "Enter") sendMessage();
  };

  const closeAndClearModal = () => {
    inputFile.current.value = ""
    setImagePreview(null);
    document.getElementById("dashboard").close();
  };

  return (
    <div className="relative bg-gray-900 relative flex items-center p-4">
      <FaPaperclip
        onClick={() => document.getElementById("dashboard").showModal()}
        className={`${
          image ? "text-blue-500" : "text-gray-500"
        } mr-2 cursor-pointer`}
      />

      {/* Emoji Picker Button */}
      <button
        className="mr-2"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
      >
        😊
      </button>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleSubmit}
        type="text"
        placeholder="Type a message..."
        className="rounded bg-gray-700 flex-1 border-none p-2 pr-[60px] outline-none text-gray-200"
      />

      <div className="absolute right-[40px]">
        <img src={image ? image : ""} alt="" className="h-[40px] rounded" />
      </div>

      <FaPaperPlane
        onClick={() => sendMessage()}
        className="text-blue-500 cursor-pointer ml-2"
      />

      {showEmojiPicker && (
        <div className="absolute right-0 bottom-full p-2">
          <span
            className="absolute top-[10px] right-[10px] z-50 hover:cursor-pointer text-black text-lg font-bold"
            onClick={() => setShowEmojiPicker(false)}
          >
            <IoIosCloseCircleOutline />
          </span>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            disableAutoFocus={true}
          />
        </div>
      )}

      {/* image preview modal */}
      <dialog id="dashboard" className="modal">
        <div className="modal-box relative">
          <form method="dialog" className="flex justify-center">
            <div className="">
              {imagePreview && (
                <div className="relative">
                  <img
                    src="./upload-icon.png"
                    alt="upload icon"
                    className="w-[40px] absolute top-2 left-2 hover:cursor-pointer"
                    onClick={handleUpload}
                  />
                  <img
                    src={imagePreview}
                    alt="Uploaded"
                    className="max-h-60 w-full max-w-xs mb-4 rounded"
                  />
                  <progress
                    value={uploadProgress}
                    className="progress progress-primary w-full absolute bottom-0 left-0 z-50"
                    max="100"
                  ></progress>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                ref={inputFile}
                className="file-input file-input-bordered file-input-primary w-full max-w-xs"
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

export default MessageInput;
