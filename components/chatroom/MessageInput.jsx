/* react */
import { useState, useRef, useEffect } from "react";

/* next */
import Image from "next/image";

/* firebase */
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/client-config";

/* react-icons */
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { IoImageOutline } from "react-icons/io5";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { IoCloseCircleOutline } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import { LuSend } from "react-icons/lu";

/* utils */
import EmojiPicker from "emoji-picker-react";

function MessageInput({ sendMessage, message, setMessage, image, setImage }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUploadBtn, setShowUploadBtn] = useState(false);
  // const [caption, setCaption] = useState("");

  const inputFile = useRef(null);
  const messageInput = useRef(null);

  const handleRemoveFocus = () => {
    messageInput.current.blur();
  };

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
    setShowUploadBtn(false);

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

  useEffect(() => {
    console.log("image | downloadURL: ", image);
    sendMessage();
  }, [image]);

  const handleEmojiClick = (emojiData, event) => {
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
    <div className="relative flex items-center px-0 py-0 shadow-inner">
      {/* image icon */}
      <div className="absolute left-4 mr-4">
        <IoImageOutline
          onClick={() => document.getElementById("dashboard").showModal()}
          className={`cursor-pointer text-gray-40 text-base-content w-[24px] h-[24px]`}
        />
      </div>

      {/* Emoji Picker section */}
      {/* <button
        className="mr-3 text-[18px]"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
      >
        😊
      </button>
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
      )} */}

      {message && (
        <div className="border- absolute left-12 top-[50%] translate-y-[-50%] py-2 px-1">
          <IoCloseCircleOutline
            className="w-[20px] h-[20px] hover:cursor-pointer text-base-content"
            onClick={() => setMessage("")}
          />
        </div>
      )}

      {!imagePreview && (
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleSubmit}
          type="text"
          // autofocus
          // onFocus={handleRemoveFocus}
          ref={messageInput}
          placeholder="Type a message..."
          className={`${
            message ? "pl-[76px]" : "pl-[52px]"
          } pr-10 input-bordered bg-base-300 inpu input-m h-[56px] text-base-content flex-1 w-full`}
        />
      )}
      {/* <FaPaperPlane */}
      {/* <LuSend
      onClick={() => sendMessage()}
      className={`absolute right-[26px] top-[50%] translate-y-[-50%] z-[200] text-base-content cursor-pointer w-[16px] h-[16px]`}
    /> */}
      {/* {message && (
        <LuSend
          onClick={() => sendMessage()}
          className={`ml-4 text-base-content cursor-pointer w-[16px] h-[16px]`}
        />
      )} */}
      {message && (
        <LuSend
          onClick={() => sendMessage()}
          className={`absolute right-4 ml-4 text-base-content cursor-pointer w-[20px] h-[20px]`}
        />
      )}

      {/* small image preview */}
      {/* <div className="absolute right-[16px]">
        <img src={image ? image : ""} alt="" className="h-[40px] rounded" />
      </div> */}

      {/* image preview modal */}
      <dialog id="dashboard" className="modal">
        <div className="modal-box">
          {/* close button */}
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={closeAndClearModal}
          >
            ✕
          </button>

          <div className="pt-2 relative flex flex-col justify-center items-center">
            {/* image preview section */}
            {imagePreview && (
              <div className="relative">
                <div className="flex justify-center relative">
                  {/* upload icon */}
                  {showUploadBtn && (
                    <div className="backdrop-opacity-30 backdrop-invert bg-base-100/30 rounded-full p-1 w-16 h-16 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] hover:cursor-pointer">
                      <AiOutlineCloudUpload
                        className="text-base-content w-full h-full"
                        onClick={handleUpload}
                      />
                    </div>
                  )}

                  {/* image preview */}
                  <Image
                    src={imagePreview}
                    alt="Uploaded"
                    width={200}
                    height={200}
                    className="mb-4 rounded"
                  />

                  {/* radial progress */}
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

            {/* caption input && file input section */}
            <div className="">
              {/* caption input */}
              {imagePreview && (
                <div className="relative">
                  {message && (
                    <div className="border- absolute left-1 top-[50%] translate-y-[-50%] py-2 px-1">
                      <IoCloseCircleOutline
                        className="w-[20px] h-[20px] hover:cursor-pointer text-base-content"
                        onClick={() => setMessage("")}
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Caption(optional)"
                    className={`bg-base-300 rounded-md input-m ${
                      message ? "pl-8" : "pl-4"
                    } pr-4 py-3 w-full max-w-xs text-base-content`}
                  />
                </div>
              )}

              {/* file input */}
              <input
                type="file"
                accept="image/*"
                ref={inputFile}
                className="mt-2 file-input file-input-bordered file-input-primary text-base-content w-full max-w-xs"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default MessageInput;
