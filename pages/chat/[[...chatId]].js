import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChatSidebar } from "components/ChatSidebar";
import { Message } from "components/Message";
import Head from "next/head";
import { useState } from "react";
import { v4 as uuid } from "uuid";

export default function ChatPage({ chatId }) {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAskQuestion = async (question) => {
    const storedData = JSON.parse(localStorage.getItem("uploadedDocument"));

    if (!storedData || !storedData.data) {
      alert("No document uploaded. Please upload a document first.");
      return;
    }

    const embeddingId = storedData.data;

    try {
      const response = await fetch("http://localhost:3000/api/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeddingId: embeddingId,
          question: question,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get an answer to the question");
      }

      const data = await response.json();
      return data.answer;
    } catch (error) {
      console.error("Error asking question:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsLoading(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      { _id: uuid(), role: "user", content: messageText },
    ]);
    setMessageText("");

    try {
      const answer = await handleAskQuestion(messageText);
      setMessages((prevMessages) => [
        ...prevMessages,
        { _id: uuid(), role: "assistant", content: answer },
      ]);
    } catch (error) {
      alert("Error getting answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Chat about PDF</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar chatId={chatId} />
        <div className="flex flex-col overflow-hidden bg-gray-700">
          <div className="flex flex-1 flex-col-reverse overflow-scroll text-white">
            {!messages.length && (
              <div className="m-auto flex items-center justify-center text-center">
                <div>
                  <FontAwesomeIcon
                    icon={faRobot}
                    className="text-6xl text-emerald-200"
                  />
                  <h1 className="mt-2 text-4xl font-bold text-white/50">
                    Ask a question about your PDF!
                  </h1>
                </div>
              </div>
            )}
            {!!messages.length && (
              <div className="mb-auto">
                {messages.map((message) => (
                  <Message
                    key={message._id}
                    role={message.role}
                    content={message.content}
                  />
                ))}
              </div>
            )}
          </div>
          <footer className="bg-gray-800 p-10">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2" disabled={isLoading}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={
                    isLoading
                      ? "Getting answer..."
                      : "Ask a question about your PDF..."
                  }
                  className="w-full resize-none rounded-md bg-gray-700 p-2 text-white focus:border-emerald-500 focus:bg-gray-600 focus:outline focus:outline-emerald-500"
                />
                <button type="submit" className="btn">
                  Send
                </button>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}
