/* react */
import { useState } from "react";

/* firebase */
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

/* 3rd-pary libraries */
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { IoIosCloseCircleOutline } from "react-icons/io";

// function MessageInput({ showEmojiPicker, setShowEmojiPicker, sendMessage, message, setMessage, image, setImage }) {
function MessageInput({ sendMessage, message, setMessage, image, setImage }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

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
          setUploadProgress(null);
          setImage(downloadURL);

          // Clear image preview
          setImagePreview(null);
          document.getElementById("dashboard").close();
          // setShowImagePreviewModal(false);
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

  return (
    <div className="relative bg-gray-900 relative flex items-center p-4">
      <FaPaperclip
        onClick={() => document.getElementById("dashboard").showModal()}
        // onClick={() => setShowImagePreviewModal(true)}
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

      {/* {showImagePreviewModal && ( */}
      {/* <dialog id="dashboard" className="absolute top-0 right-0 p-2"> */}
      <dialog id="dashboard" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Uploaded"
                className="max-h-60 w-60 mb-4"
              />
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} />

            <div onClick={handleUpload} className="btn btn-sm btn-primary">
              Upload
            </div>
            <progress value={uploadProgress} max="100"></progress>
            <button
              // onClick={() => document.getElementById("my_modal_3").close()}
              // onClick={() => setShowImagePreviewModal(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
          </form>
        </div>
      </dialog>
      {/* )} */}
    </div>
  );
}

export default MessageInput;
