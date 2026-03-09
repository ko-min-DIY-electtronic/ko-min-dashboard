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
    socket.emit('admin:join', 'admin');

    console.log("socket connected", socket.connected);

    socket.on("admin:new_message", (data) => {
      console.log("New chat message received:", data);
      const { conversation, message, conversationId } = data;

      // Extract details safely, supporting both new format and potentially old format
      const lastMessage = conversation?.lastMessage || message?.message || data.message;
      const lastMessageAt = conversation?.lastMessageAt || message?.createdAt || data.createdAt || new Date().toISOString();
      const isRead = conversation ? conversation.isRead : false;

      setConversations((prev) => {
        const idToFind = conversationId || conversation?._id || data.conversationId;
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
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.userId.userName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                        {!conversation.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-400 mb-1">
                      {conversation.userId.phoneNumber}
                    </p>

                    <p className="text-md text-gray-700 font-semibold truncate">
                      {conversation.lastMessage}
                    </p>
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
