/* react */
import { useState } from "react";

/* firebase */
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "@/lib/firebase";

/* 3rd-pary libraries */
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function MessageInput({ sendMessage, message, setMessage, image, setImage }) {
// function MessageInput({ sendMessage, message, setMessage }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // const [image, setImage] = useState('')

  // Initialize storage object
  // const storage = getStorage(storage);

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

          // Reset file state and update message with download URL
          setFile(null);
          setImage(downloadURL);

          // Clear image preview
          setImagePreview(null);
          document.getElementById("my_modal_3").close();
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
    <div className="bg-gray-900 relative flex items-center p-4">
      <FaPaperclip
        onClick={() => document.getElementById("my_modal_3").showModal()}
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
        className="rounded bg-gray-700 flex-1 border-none p-2 outline-none text-gray-200"
      />

      <FaPaperPlane
        onClick={() => sendMessage()}
        className="text-blue-500 cursor-pointer ml-2"
      />

      {showEmojiPicker && (
        <div className="absolute right-0 bottom-full p-2">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            disableAutoFocus={true}
          />
        </div>
      )}

      {/* Image Upload Modal */}
      {/* <dialog id="my_modal_3" className="modal">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Edit Profile</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  defaultValue="Pedro Duarte"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  defaultValue="@peduarte"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </dialog> */}

      <dialog id="my_modal_3" className="modal">
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
            {/* <div onClick={() => {handleUpload()}}  */}
            <div onClick={handleUpload} 
              className="btn btn-sm btn-primary"
            >
              Upload
            </div>
            <progress value={uploadProgress} max="100"></progress>
          </form>
          <button
            onClick={() => document.getElementById("my_modal_3").close()}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default MessageInput;
