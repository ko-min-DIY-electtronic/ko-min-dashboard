import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { MdOutlineSupportAgent } from "react-icons/md";
import { ClockPlus } from "lucide-react";
import {
  Package,
  ShoppingCart,
  Truck,
  Headphones,
  Menu,
  X,
  User,
  LogOut,
  BarChart3,
  Users,
  Shield,
  Image,
  MessageCircle,
  Settings,
} from "lucide-react";
import logo from "../assets/uedc.png";
import { useContext } from "react";
import { NumberContext } from "../context/NumberContext";
import io from "socket.io-client";

const socket = io.connect(import.meta.env.VITE_APP_WEBSOCKET_API, {
  transports: ["websocket"],
  secure: true,
});

function Navbar() {
  const username = JSON.parse(localStorage.getItem("uedc-user"))?.name;
  const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const { newOrderCount, setNewOrderCount, messageCount, setMessageCount } =
    useContext(NumberContext);

  const location = useLocation();
  const navigate = useNavigate();
  const allNavItems = [
    {
      path: "/",
      icon: Package,
      label: "Inventory",
      role: "inventory",
      secondaryRole: "customer-support",
      secondaryPath: "product",
    },
    {
      path: "/banners",
      icon: Image,
      label: "Banners",
      role: "admin",
      secondaryRole: "admin",
    },
    {
      path: "/orders",
      icon: ShoppingCart,
      label: "Order",
      role: "finance",
      secondaryPath: "order",
      secondaryRole: "customer-support",
    },
    {
      path: "/delivery",
      icon: Truck,
      label: "Delivery",
      role: "delivery",
      secondaryRole: "customer-support",
    },
    {
      path: "/sales-report",
      icon: BarChart3,
      label: "Sales Report",
      role: "finance",
      secondaryRole: "admin",
    },
    {
      path: "/users",
      icon: Users,
      label: "Users",
      role: "admin",
      secondaryRole: "admin",
    },
    {
      path: "/accounts",
      icon: Shield,
      label: "Admin Accounts",
      role: "admin",
      secondaryRole: "admin",
    },
    {
      path: "/chat",
      icon: MessageCircle,
      label: "Chat",
      role: "customer-support",
      secondaryRole: "admin",
    },
    {
      path: "/settings",
      icon: Settings,
      label: "Settings",
      role: "admin",
      secondaryRole: "admin",
    },
  ];

  // Show all nav items to all users
  const navItems = allNavItems;

  const isActive = (path, secondaryPath) =>
    location.pathname === path || location.pathname.includes(secondaryPath);

  const handleLogout = () => {
    localStorage.removeItem("uedc-user");
    localStorage.removeItem("uedc-token");
    window.location.href = "/login";
  };

  useEffect(() => {
    socket.connect();
    socket.emit("admin:join", "admin");

    // console.log("socket connected", socket.connected);

    socket.on("admin:new_message", (data) => {
      // console.log("New chat message received:", data);

      if (!location.pathname.includes("/chat")) {
        setMessageCount((prev) => prev + 1);
      }
    });

    return () => {
      socket.off("admin:new_message");
    };
  }, []);

  // console.log("messageCount", messageCount);

  useEffect(() => {
    // Clear message count when visiting chat page
    if (location.pathname.includes("/chat")) {
      setMessageCount(0);
    }
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center px-4 justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold text-lg text-gray-800">Dashboard</span>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
        lg:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Mobile Header & Close Button */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200 shrink-0">
          <span className="font-semibold text-lg text-gray-800">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${
                          isActive(item.path)
                            ? "bg-primary text-white shadow-lg"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                    {item.path === "/orders" && newOrderCount > 0 && (
                      <span
                        className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive(item.path)
                            ? "bg-white text-primary"
                            : "bg-primary text-white"
                        }`}
                      >
                        {newOrderCount > 9 ? "9+" : newOrderCount}
                      </span>
                    )}
                    {item.path === "/chat" && messageCount > 0 && (
                      <span
                        className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive(item.path)
                            ? "bg-white text-primary"
                            : "bg-primary text-white"
                        }`}
                      >
                        {messageCount > 9 ? "9+" : messageCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile User Profile */}
        <div className="shrink-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Aung</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar Overlay */}
      {isDesktopExpanded && (
        <div
          className="hidden lg:block fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setIsDesktopExpanded(false)}
        />
      )}

      {/* Desktop Sidebar - Click to Expand */}
      <div className="hidden lg:block">
        <div
          className={`
          fixed left-0 px-4 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-in-out shadow-lg
          ${isDesktopExpanded ? "w-64" : "w-20"}
        `}
        >
          {/* Menu Toggle Button */}
          <div className="py-4 border-b border-gray-200 flex justify-between">
            {/* <div
              className={`items-center justify-center ${
                isDesktopExpanded ? "flex" : "hidden"
              }`}
            >
              <img src={logo} alt="logo" className="w-10 h-10 rounded-md" />
            </div> */}
            <button
              onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path} className="relative">
                    <Link
                      to={item.path}
                      className={`
                        flex items-center px-3 py-3 rounded-lg transition-all duration-300 relative group
                        ${
                          isActive(item.path, item.secondaryPath)
                            ? "bg-primary text-white shadow-lg "
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }
 
                      `}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {isDesktopExpanded && (
                        <span className="ml-3 font-medium whitespace-nowrap">
                          {item.label}
                        </span>
                      )}

                      {/* Tooltip for collapsed state */}
                      {!isDesktopExpanded && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </Link>

                    {/* Order Count Badge */}
                    {item.path === "/orders" && newOrderCount > 0 && (
                      <span
                        className={`absolute ${
                          isDesktopExpanded ? "right-4" : "-top-1 -right-1"
                        } flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm transition-all duration-300 ${
                          isActive(item.path, item.secondaryPath)
                            ? "bg-white text-primary"
                            : "bg-primary text-white"
                        }`}
                      >
                        {newOrderCount > 9 ? "9+" : newOrderCount}
                      </span>
                    )}

                    {/* Chat Message Count Badge */}
                    {item.path === "/chat" && messageCount > 0 && (
                      <span
                        className={`absolute ${
                          isDesktopExpanded ? "right-4" : "-top-1 -right-1"
                        } flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm transition-all duration-300 ${
                          isActive(item.path, item.secondaryPath)
                            ? "bg-white text-primary"
                            : "bg-primary text-white"
                        }`}
                      >
                        {messageCount > 9 ? "9+" : messageCount}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200">
            {/* User Info */}
            <div className="p-3 flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-gray-600" />
              </div>
              {isDesktopExpanded && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    Ko Min
                  </p>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    Admin
                  </p>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <div className="p-3 pt-0">
              <button
                className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group relative"
                onClick={handleLogout}
              >
                <LogOut size={16} className="flex-shrink-0" />
                {isDesktopExpanded && (
                  <span className="ml-3 whitespace-nowrap">Logout</span>
                )}

                {/* Tooltip for logout when collapsed */}
                {!isDesktopExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Logout
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
