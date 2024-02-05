/* react */
import { useState, useRef, useEffect } from "react";

/* next */
import Image from "next/image"

/* firebase */
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/client-config";

/* react-icons */
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { IoImageOutline } from "react-icons/io5";
import { AiOutlineCloudUpload } from "react-icons/ai";

/* utils */
import EmojiPicker from "emoji-picker-react";

function MessageInput({ sendMessage, message, setMessage, image, setImage }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUploadBtn, setShowUploadBtn] = useState(false);

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
      setShowUploadBtn(true);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected.");
      return;
    }
    setShowUploadBtn(false)

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
          setUploadProgress(null);
          console.log("File available at", downloadURL);

          setImage(downloadURL);
          console.log("image | downloadURL: ", image);

          // Clear image preview
          setImagePreview(null);
          inputFile.current.value = "";
          document.getElementById("dashboard").close();
        });
      }
    );
  };

  const handleEmojiClick = (emojiData, event) => {
    // Append the selected emoji to the message state
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  const handleSubmit = async (event) => {
    if (event.key == "Enter") sendMessage();
  };

  const closeAndClearModal = () => {
    inputFile.current.value = "";
    setImagePreview(null);
    document.getElementById("dashboard").close();
  };

  return (
    <div className="relative flex items-center px-4 py-3 shadow-inner">
      {/* file input icon */}
      <div className="mr-3">
        <IoImageOutline
          onClick={() => document.getElementById("dashboard").showModal()}
          className={`cursor-pointer text-gray-400 w-[22px] h-[22px]`}
        />
      </div>

      {/* Emoji Picker Button */}
      <button
        className="mr-3 text-[18px]"
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
        className={`rounded-md input-bordered bg-base-200 input input-sm text-base-content flex-1 p-2 pr-8 w-full outline-non
        `}
      />
      <FaPaperPlane
        onClick={() => sendMessage()}
        className={`absolute right-[26px] top-[50%] translate-y-[-50%] z-[200] text-base-content cursor-pointer w-[16px] h-[16px]`}
      />

      {/* small image preview */}
      <div className="absolute right-[16px]">
        <img src={image ? image : ""} alt="" className="h-[40px] rounded" />
      </div>

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
          <form
            method="dialog"
            className="flex flex-col justify-center items-center"
          >
            {imagePreview && (
              <div className="relative">
                <div className="flex justify-center relative">
                  {showUploadBtn && (
                    <div className="backdrop-opacity-30 backdrop-invert bg-base-100/30 rounded-full p-1 w-16 h-16 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] hover:cursor-pointer">
                      <AiOutlineCloudUpload
                        className="text-base-content w-full h-full"
                        onClick={handleUpload}
                      />
                    </div>
                  )}
                  {/* <img
                    src={imagePreview}
                    alt="Uploaded"
                    className="max-h-60 max-w-xs mb-4 rounded"
                  /> */}
                  <Image 
                    src={imagePreview}
                    alt="Uploaded"
                    width={300}
                    height={300}
                    // placeholder="blur"
                    className="mb-4 rounded"
                  />
                  {uploadProgress !== null && (
                    <div
                      className="w-16 h-16 backdrop-opacity-30 backdrop-invert bg-base-100/30 radial-progress text-base-content absolute z-[500] top-[50%] translate-y-[-50%]"
                      style={{ "--value": uploadProgress }}
                      role="progressbar"
                    >
                      {uploadProgress.toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={inputFile}
              className="mt-2 file-input file-input-bordered file-input-primary text-base-content w-full max-w-xs"
              onChange={handleFileChange}
            />
          </form>
          <button
            className="btn btn-sm btn-circle btn-ghost absolute top-0 right-1 top-1"
            onClick={closeAndClearModal}
          >
            <IoIosCloseCircleOutline className="w-[22px] h-[22px] text-base-content" />
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default MessageInput;
