import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, User, Bot } from "lucide-react";
import { toast } from "sonner";
import {
  getConversationMessages,
  sendMessage,
} from "../../api/chatApi/chatMessages";
import { io } from "socket.io-client";
import Loading from "../utli/Loading";

const socket = io.connect(import.meta.env.VITE_APP_WEBSOCKET_API, {
  transports: ["websocket"],
  secure: true,
});


const ChatDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pagination, setPagination] = useState({});

  // ── Fetch messages + Socket: join room & listen ──────────────────────
  useEffect(() => {
    if (!id) return;


    // 1. Fetch existing messages via API
    fetchMessages();

    // 2. Clean any previous listener
    socket.off("chat:message");


    // 4. Join the conversation room (wait for connection if needed)
    const emitJoin = () => {
      socket.emit("chat:join", id);
      console.log("Joined conversation room:", id);
    };

    emitJoin();


    // 3. Register the message listener
    socket.on("chat:message", (data) => {
      // If data.message is an object, it's the new wrapped format; 
      // otherwise, data itself is likely the message object.
      const message = (data && data.message && typeof data.message === 'object') ? data.message : data;

      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    // 5. Cleanup on unmount or when id changes
    return () => {
      socket.off("chat:message");
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await getConversationMessages(id, 1, 50);
      setConversation(response.data.conversation);
      setMessages(response.data.messages.reverse());
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await sendMessage(id, newMessage.trim());

      if (response.success) {
        setNewMessage("");

      } else {
        toast.error("Failed to send message");
        console.error("Failed to send message:", response.message);
      }
    } catch (error) {
      toast.error("Error sending message");
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Conversation not found
          </h2>
          <button
            onClick={() => navigate("/chat")}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Chat List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between">
      {/* Header - Fixed */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/chat")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {conversation.userId.userName}
              </h1>
              <p className="text-sm text-gray-500">
                {conversation.userId.phoneNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="overflow-y-auto p-6 h-[calc(100vh-200px)]">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isAdmin = message.senderModel === "Admin";
              const showDate =
                index === 0 ||
                formatDate(messages[index - 1].createdAt) !==
                formatDate(message.createdAt);

              return (
                <div key={message._id}>
                  {showDate && (
                    <div className="text-center py-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isAdmin ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAdmin ? "bg-blue-500" : "bg-gray-300"
                          }`}
                      >
                        {isAdmin ? (
                          <Bot className="h-4 w-4 text-white" />
                        ) : (
                          <User className="h-4 w-4 text-gray-600" />
                        )}
                      </div>

                      <div
                        className={`px-4 py-2 rounded-lg ${isAdmin
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                          }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${isAdmin ? "text-blue-100" : "text-gray-500"
                            }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input - Fixed */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={sending}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
};


export default ChatDetail;
