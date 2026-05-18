import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Clock, User } from "lucide-react";
import io from "socket.io-client";
import { getConversations } from "../../api/chatApi/getConversations";
import Loading from "../utli/Loading";

const socket = io.connect(import.meta.env.VITE_APP_WEBSOCKET_API, {
  transports: ["websocket"],
  secure: true,
});

const ChatList = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchConversations();
  }, [currentPage]);

  // ── Socket: listen for new messages to update the list in real-time ──
  useEffect(() => {
    socket.connect();
    socket.emit("admin:join", "admin");

    // console.log("socket connected", socket.connected);

    socket.on("admin:new_message", (data) => {
      // console.log("New chat message received:", data);
      const { conversation, message, conversationId } = data;

      // Extract details safely, supporting both new format and potentially old format
      const lastMessage =
        conversation?.lastMessage || message?.message || data.message;
      const lastMessageAt =
        conversation?.lastMessageAt ||
        message?.createdAt ||
        data.createdAt ||
        new Date().toISOString();
      const isRead = conversation ? conversation.isRead : false;

      setConversations((prev) => {
        const idToFind =
          conversationId || conversation?._id || data.conversationId;
        const existingIndex = prev.findIndex((c) => c._id === idToFind);

        if (existingIndex !== -1) {
          // Conversation exists — update & move to top
          const updated = [...prev];
          const [conv] = updated.splice(existingIndex, 1);

          // Update existing conversation state with new data from payload
          const updatedConv = {
            ...conv,
            lastMessage: lastMessage,
            lastMessageAt: lastMessageAt,
            isRead: isRead,
          };

          return [updatedConv, ...updated];
        } else {
          // New conversation (not in current list) — re-fetch to get full conversation data
          fetchConversations();
          return prev;
        }
      });
    });

    return () => {
      socket.off("admin:new_message");
    };
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await getConversations(currentPage, 10);
      // console.log("Conversations:", response.data.conversations);
      setConversations(response.data.conversations);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleConversationClick = (conversationId) => {
    navigate(`/chat/${conversationId}`);
  };

  if (loading && conversations.length === 0) {
    return <Loading />;
  }

  return (
    <div className="w-full h-screen p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Chat Conversations
        </h1>
        <p className="text-gray-600">
          Manage customer conversations and support tickets
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-500">
              Customer conversations will appear here when they start chatting.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => handleConversationClick(conversation._id)}
                className={`p-4 hover:bg-gray-100 transition-colors cursor-pointer border-l-4 ${
                  !conversation.isRead
                    ? "bg-blue-50/40 border-blue-500 shadow-sm"
                    : "bg-white border-transparent"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        !conversation.isRead ? "bg-blue-200" : "bg-gray-100"
                      }`}
                    >
                      <User
                        className={`h-6 w-6 ${
                          !conversation.isRead
                            ? "text-blue-700"
                            : "text-gray-500"
                        }`}
                      />
                    </div>
                    {!conversation.isRead && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white"></span>
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`text-sm tracking-tight truncate ${
                          !conversation.isRead
                            ? "font-bold text-gray-900"
                            : "font-medium text-gray-700"
                        }`}
                      >
                        {conversation?.userId?.userName}
                      </h3>
                      <span
                        className={`text-xs ${
                          !conversation.isRead
                            ? "text-blue-600 font-bold"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">
                          {conversation?.userId?.phoneNumber}
                        </p>
                        <p
                          className={`text-sm truncate ${
                            !conversation.isRead
                              ? "text-gray-900 font-bold"
                              : "text-gray-600 font-normal"
                          }`}
                        >
                          {conversation.lastMessage?.startsWith("http") ? (
                            <span className="flex items-center gap-1.5 italic">
                              {conversation.lastMessage.includes(
                                "chat-images",
                              ) ? (
                                <>
                                  <span role="img" aria-label="photo">
                                    📷
                                  </span>{" "}
                                  Photo
                                </>
                              ) : conversation.lastMessage.includes(
                                  "chat-voice",
                                ) ? (
                                <>
                                  <span role="img" aria-label="voice">
                                    🎤
                                  </span>{" "}
                                  Voice message
                                </>
                              ) : (
                                conversation.lastMessage
                              )}
                            </span>
                          ) : (
                            conversation.lastMessage
                          )}
                        </p>
                      </div>

                      {!conversation.isRead && (
                        <div className="ml-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          New
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.hasMore && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>

      {pagination.totalConversations > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {conversations.length} of {pagination.totalConversations}{" "}
          conversations
        </div>
      )}
    </div>
  );
};

export default ChatList;
