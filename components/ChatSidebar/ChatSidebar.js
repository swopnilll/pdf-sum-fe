import axios from "axios";

import {
  faUpload,
  faMessage,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export const ChatSidebar = ({ chatId }) => {
  const [chatList, setChatList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadChatList = async () => {
      const response = await fetch(`/api/chat/getChatList`, {
        method: "POST",
      });
      const json = await response.json();
      console.log("CHAT LIST: ", json);
      setChatList(json?.chats || []);
    };
    loadChatList();
  }, [chatId]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (file && file.type === "application/pdf") {
      setIsUploading(true);

      const formData = new FormData();

      formData.append("document", file);

      try {
        // Upload the file
        const response = await fetch("http://localhost:3000/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload file");
        }

        // Get the response data
        const data = await response.json();
        alert("PDF uploaded and processed successfully!");

        // Store the response data in local storage
        localStorage.setItem("uploadedDocument", JSON.stringify(data));
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file");
      } finally {
        setIsUploading(false);
      }
    } else {
      alert("Please select a PDF file");
    }
  };

  return (
    <div className="flex flex-col overflow-hidden bg-gray-900 text-white">
      <label className="side-menu-item cursor-pointer bg-emerald-500 hover:bg-emerald-600">
        <FontAwesomeIcon icon={faUpload} />{" "}
        {isUploading ? "Uploading..." : "Upload PDF"}
        <input
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf"
          disabled={isUploading}
        />
      </label>
      <div className="flex-1 overflow-auto bg-gray-950">
        {chatList.map((chat) => (
          <Link
            key={chat._id}
            href={`/chat/${chat._id}`}
            className={`side-menu-item ${
              chatId === chat._id ? "bg-gray-700 hover:bg-gray-700" : ""
            }`}
          >
            <FontAwesomeIcon icon={faMessage} className="text-white/50" />{" "}
            <span
              title={chat.title}
              className="overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {chat.title}
            </span>
          </Link>
        ))}
      </div>
      <Link href="/api/auth/logout" className="side-menu-item">
        <FontAwesomeIcon icon={faRightFromBracket} /> Logout
      </Link>
    </div>
  );
};
