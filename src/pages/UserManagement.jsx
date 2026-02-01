import { useEffect, useState } from "react";
import getAllUsers from "../api/userApi/getAllUsers";
import Loading from "../components/utli/Loading";
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { Eye, Shield, ShieldOff, UserCheck, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTab, setSelectedTab] = useState("All Users");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      if (response.success) {
        setUsers(response.data.user || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const tabs = [
    "All Users",
    // "Verified Users",
    // "Unverified Users",
    // "Banned Users",
  ];

  const filteredUsers = users.filter((user) => {
    switch (selectedTab) {
      case "Verified Users":
        return user.isVerified === true && user.isBanned === false;
      case "Unverified Users":
        return user.isVerified === false && user.isBanned === false;
      case "Banned Users":
        return user.isBanned === true;
      default:
        return true;
    }
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (user) => {
    if (user.isBanned) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          Banned
        </span>
      );
    }
    if (user.isVerified) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          Verified
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
        Unverified
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: "bg-purple-100 text-purple-800",
      user: "bg-blue-100 text-blue-800",
      staff: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          roleColors[role] || "bg-gray-100 text-gray-800"
        }`}
      >
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="w-full px-4">
      <div className="">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div>
            <h1 className="header ml-8 lg:ml-0">User Management</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="pt-6 flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setSelectedTab(tab);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-300 ${
                selectedTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto  w-[calc(100vw-70px)] lg:w-auto h-[calc(100vh-160px)]">
          <table className="w-full table-auto">
            <thead
              className="bg-gray-50 border-b border-gray-200"
              style={{ position: "sticky", top: 0 }}
            >
              <tr>
                <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider">
                  No
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Role
                </th>
                {/* <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Last Active
                </th> */}
                <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="ms-1">{startIndex + index + 1}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <UserCheck className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.userName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.phoneNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getRoleBadge(user.role)}
                    </td>
                    {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getStatusBadge(user)}
                    </td> */}
                    {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.lastActiveAt)}
                    </td> */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/user/${user._id}`)}
                          className="flex items-center px-3 py-1 text-xs border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>

                        {/* {user.isBanned ? (
                          <button
                            className="flex items-center px-3 py-1 text-xs border border-green-500 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                            title="Unban User"
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            Unban
                          </button>
                        ) : (
                          <button
                            className="flex items-center px-3 py-1 text-xs border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                            title="Ban User"
                          >
                            <ShieldOff className="w-3 h-3 mr-1" />
                            Ban
                          </button>
                        )} */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <span className="hidden lg:block text-sm text-gray-700">View</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-1 lg:px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden lg:block text-sm text-gray-700">
              {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} of{" "}
              {filteredUsers.length} Users
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden lg:block">Previous</span>
                <span className="lg:hidden">
                  <MdArrowBackIosNew className="w-4 h-5" />
                </span>
              </button>

              <div className="flex space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const pageNum =
                    currentPage <= 3 ? index + 1 : currentPage - 2 + index;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === pageNum
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden lg:block">Next</span>
                <span className="lg:hidden">
                  <MdArrowForwardIos className="w-4 h-5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
