import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  User,
  Bot,
  ImagePlus,
  Mic,
  Square,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getConversationMessages,
  sendMessage,
} from "../../api/chatApi/chatMessages";
import { markConversationAsRead } from "../../api/chatApi/getConversations";
import startNewConversation from "../../api/chatApi/startNewConversation";
import { io } from "socket.io-client";
import Loading from "../utli/Loading";

const socket = io.connect(import.meta.env.VITE_APP_WEBSOCKET_API, {
  transports: ["websocket"],
  secure: true,
});

const ChatDetail = () => {
  const { id, userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pagination, setPagination] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isNewConversation, setIsNewConversation] = useState(false);
  const timerRef = useRef(null);

  // Determine if this is a new conversation or existing one
  const conversationId = id || conversation?._id;
  const isUserChat = !!userId;

  // ── Fetch messages + Socket: join room & listen ──────────────────────
  useEffect(() => {
    if (isUserChat) {
      // New conversation - don't fetch messages, just set up for new chat
      setLoading(false);
      setIsNewConversation(true);
      return;
    }

    if (!conversationId) return;

    // Existing conversation - fetch messages and join socket room
    fetchMessages();

    // Clean any previous listener
    socket.off("chat:message");

    // Join the conversation room
    const emitJoin = () => {
      socket.emit("chat:join", conversationId);
      // console.log("Joined conversation room:", conversationId);
    };

    emitJoin();

    // Register the message listener
    socket.on("chat:message", (data) => {
      const message =
        data && data.message && typeof data.message === "object"
          ? data.message
          : data;

      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    // Cleanup on unmount or when id changes
    return () => {
      socket.off("chat:message");
    };
  }, [isUserChat, conversationId]);

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

      // Mark as read when conversation is opened
      if (!response.data.conversation.isRead) {
        await markConversationAsRead(id);
      }
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
      const text = newMessage.trim();
      setNewMessage(""); // Clear early for better UX

      // If this is a new conversation, create it and send the first message
      if (isUserChat && !conversation) {
        const newConv = await startNewConversation(userId, text);
        if (!newConv) {
          toast.error("Failed to start conversation");
          setNewMessage(text); // Restore on failure
          return;
        }
        setConversation(newConv);

        // Navigate to the new conversation URL
        navigate(`/chat/${newConv._id}`, { replace: true });

        // Add the sent message to the messages list
        const sentMessage = {
          _id: Date.now().toString(), // Temporary ID
          message: text,
          senderModel: "Admin",
          createdAt: new Date().toISOString(),
        };
        setMessages([sentMessage]);
        return; // Exit early since message was already sent
      }

      // For existing conversations, send message normally
      const response = await sendMessage(conversationId, text);

      if (!response.success) {
        toast.error("Failed to send message");
        setNewMessage(text); // Restore on failure
      }
    } catch (error) {
      toast.error("Error sending message");
      console.error("Error sending message:", error);
      setNewMessage(newMessage.trim()); // Restore on failure
    } finally {
      setSending(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || sending) return;

    // Validate if it's an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      setSending(true);
      const response = await sendMessage(id, file);

      if (response.success) {
        return null;
      } else {
        toast.error("Failed to send image");
      }
    } catch (error) {
      toast.error("Error sending image");
      console.error("Error sending image:", error);
    } finally {
      setSending(false);
      e.target.value = null; // Reset input
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/m4a" });
        const audioFile = new File(
          [audioBlob],
          `voice-message-${Date.now()}.m4a`,
          { type: "audio/m4a" },
        );

        try {
          setSending(true);
          const response = await sendMessage(id, audioFile);
          if (!response.success) {
            toast.error("Failed to send voice message");
          }
        } catch (error) {
          toast.error("Error sending voice message");
        } finally {
          setSending(false);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      setRecorder(mediaRecorder);
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (recorder) {
      recorder.onstop = () => {
        setIsRecording(false);
        setRecorder(null);
        clearInterval(timerRef.current);
      };
      recorder.stop();
      recorder.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

  // For new conversations, we don't need the conversation check
  if (!conversation && !isUserChat) {
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
                {isUserChat
                  ? "New Conversation"
                  : conversation?.userId?.userName || "Customer"}
              </h1>
              <p className="text-sm text-gray-500">
                {isUserChat
                  ? "Start chatting with customer"
                  : conversation?.userId?.phoneNumber || ""}
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
                {isUserChat
                  ? "Start a new conversation with this customer"
                  : "No messages yet. Start the conversation!"}
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
                    className={`flex ${
                      isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                        isAdmin ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isAdmin ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        {isAdmin ? (
                          <Bot className="h-4 w-4 text-white" />
                        ) : (
                          <User className="h-4 w-4 text-gray-600" />
                        )}
                      </div>

                      <div
                        className={`rounded-lg overflow-hidden ${
                          message.messageType === "image" ||
                          message.messageType === "voice"
                            ? "p-0 bg-transparent"
                            : `px-4 py-2 ${isAdmin ? "bg-blue-500 text-white" : "bg-white text-gray-900 border border-gray-200"}`
                        }`}
                      >
                        {message.messageType === "image" ? (
                          <div className="space-y-1">
                            <img
                              src={message.message}
                              alt="Shared"
                              className="max-w-full rounded-md cursor-pointer hover:opacity-95 transition-opacity max-h-72 object-cover"
                              onClick={() =>
                                window.open(message.message, "_blank")
                              }
                            />
                          </div>
                        ) : message.messageType === "voice" ? (
                          <div className="flex items-center min-w-[240px]">
                            <audio
                              controls
                              controlsList="nodownload"
                              className="h-10 w-full"
                            >
                              <source src={message.message} type="audio/mpeg" />
                              <source src={message.message} type="audio/mp4" />
                              <source
                                src={message.message}
                                type="audio/x-m4a"
                              />
                              Your browser does not support audio.
                            </audio>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">
                            {message.message}
                          </p>
                        )}
                        <p
                          className={`text-xs mt-1 ${
                            message.messageType === "image" ||
                            message.messageType === "voice"
                              ? "text-gray-500 px-2 pb-1"
                              : isAdmin
                                ? "text-blue-100"
                                : "text-gray-500"
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

      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {isRecording ? (
            <div className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-700">
                  Recording... {formatDuration(recordingDuration)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={cancelRecording}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Cancel"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={stopRecording}
                  disabled={sending}
                  className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSendMessage}
              className="flex items-center space-x-4"
            >
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="file"
                  id="image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={sending}
                />
                <label
                  htmlFor="image-upload"
                  className={`p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors ${
                    sending ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  title="Send Image"
                >
                  <ImagePlus className="h-5 w-5" />
                </label>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={sending}
                />
              </div>
              <div className="flex items-center space-x-2">
                {!newMessage.trim() ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={sending}
                    className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
