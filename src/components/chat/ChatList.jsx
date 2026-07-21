import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, User, Search, Image as ImageIcon, Mic, RefreshCw } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm]);

  // ── Socket: listen for new messages to update the list in real-time ──
  useEffect(() => {
    socket.connect();
    socket.emit("admin:join", "admin");

    socket.on("admin:new_message", (data) => {
      const { conversation, message, conversationId } = data;

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
          const updated = [...prev];
          const [conv] = updated.splice(existingIndex, 1);

          const updatedConv = {
            ...conv,
            lastMessage: lastMessage,
            lastMessageAt: lastMessageAt,
            isRead: isRead,
          };

          return [updatedConv, ...updated];
        } else {
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
      const response = await getConversations(currentPage, 10, searchTerm);
      setConversations(response.data.conversations || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const unreadCount = conversations.filter((c) => !c.isRead).length;

  if (loading && conversations.length === 0) {
    return <Loading />;
  }

  return (
    <div className="h-[calc(100vh-20px)] w-full px-3 sm:px-6 py-4 flex flex-col overflow-hidden">
      {/* Fixed Header & Controls */}
      <div className="flex-shrink-0 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="header text-xl sm:text-2xl ml-8 lg:ml-0">
              Chat Conversations
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage customer support messages and live inquiries
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
            />
          </div>
          <button
            onClick={fetchConversations}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh conversations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Internal Scrollable Conversations Container */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {conversations.length === 0 ? (
          <div className="text-center py-16 px-4 my-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {searchTerm ? "No matching conversations" : "No conversations yet"}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {searchTerm
                ? `No user found matching "${searchTerm}". Try searching with a different keyword.`
                : "Customer conversations will appear here in real-time when they start chatting."}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100">
            {conversations.map((conversation) => {
              const isUnread = !conversation.isRead;
              const isMediaMessage = conversation.lastMessage?.startsWith("http");
              const isPhoto = isMediaMessage && conversation.lastMessage?.includes("chat-images");
              const isVoice = isMediaMessage && conversation.lastMessage?.includes("chat-voice");

              return (
                <div
                  key={conversation._id}
                  onClick={() => handleConversationClick(conversation._id)}
                  className={`p-3.5 sm:p-4 hover:bg-gray-50/80 transition-all cursor-pointer border-l-4 ${isUnread
                    ? "bg-blue-50/50 border-blue-500"
                    : "bg-white border-transparent"
                    }`}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    {/* Avatar & Badge */}
                    <div className="flex-shrink-0 relative">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${isUnread
                          ? "bg-blue-100 text-blue-700 font-semibold"
                          : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        <User className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600 border-2 border-white"></span>
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3
                          className={`text-sm sm:text-base tracking-tight truncate ${isUnread
                            ? "font-bold text-gray-900"
                            : "font-semibold text-gray-800"
                            }`}
                        >
                          {conversation?.userId?.userName || "Unknown Customer"}
                        </h3>
                        <span
                          className={`text-xs whitespace-nowrap flex-shrink-0 ${isUnread
                            ? "text-blue-600 font-bold"
                            : "text-gray-400"
                            }`}
                        >
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {conversation?.userId?.phoneNumber && (
                            <p className="text-xs text-gray-400 font-medium mb-0.5">
                              {conversation.userId.phoneNumber}
                            </p>
                          )}
                          <p
                            className={`text-xs sm:text-sm truncate ${isUnread
                              ? "text-gray-900 font-semibold"
                              : "text-gray-500 font-normal"
                              }`}
                          >
                            {isMediaMessage ? (
                              <span className="inline-flex items-center gap-1.5 italic text-gray-600">
                                {isPhoto ? (
                                  <>
                                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Photo message</span>
                                  </>
                                ) : isVoice ? (
                                  <>
                                    <Mic className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Voice message</span>
                                  </>
                                ) : (
                                  <span>Attachment</span>
                                )}
                              </span>
                            ) : (
                              conversation.lastMessage || "No message"
                            )}
                          </p>
                        </div>

                        {isUnread && (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-blue-600 text-white text-[10px] rounded-full font-bold uppercase tracking-wider shadow-sm">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {pagination.hasMore && (
          <div className="flex-shrink-0 p-3.5 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {loading ? "Loading conversations..." : "Load More Conversations"}
            </button>
          </div>
        )}
      </div>

      {/* Fixed Footer Counter */}
      {pagination.totalConversations > 0 && (
        <div className="flex-shrink-0 pt-2 text-center text-xs sm:text-sm text-gray-500">
          Showing {conversations.length} of {pagination.totalConversations} conversations
        </div>
      )}
    </div>
  );
};

export default ChatList;
