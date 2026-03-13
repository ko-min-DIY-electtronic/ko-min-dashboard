import { useEffect, useState } from "react";
import getUserDetail from "../api/userApi/getUserDetail";
import updateUserBanStatus from "../api/userApi/updateUserBanStatus";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdOutlinePhone,
  MdLocationOn,
  MdHome,
} from "react-icons/md";
import { Shield, ShieldOff, UserCheck, Calendar, UserX } from "lucide-react";
import Loading from "../components/utli/Loading";
import avatar from "../assets/Oval.png";

export default function UserDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const response = await getUserDetail(id);
      if (response.success) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error("Error fetching user detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanStatus = async (isBanned) => {
    try {
      await updateUserBanStatus(user._id, isBanned);
      // Refresh user data to show updated status
      fetchUserDetail();
    } catch (error) {
      console.error("Error updating ban status:", error);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (user) => {
    if (user.isBanned) {
      return (
        <span className="px-4 py-2 text-sm rounded-full bg-red-100 text-red-800">
          Banned
        </span>
      );
    }
    return (
      <span className="px-4 py-2 text-sm rounded-full bg-yellow-100 text-yellow-800">
        Active
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
        className={`px-4 py-2 text-sm rounded-full ${roleColors[role] || "bg-gray-100 text-gray-800"
          }`}
      >
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </span>
    );
  };

  if (loading || !userData) {
    return <Loading />;
  }

  const { user, userAddressInfo } = userData;

  return (
    <div className="h-[calc(100vh-50px)] overflow-y-auto px-3 sm:px-5">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-gray-200 pb-4 gap-4">
          <div className="flex gap-2 items-center">
            <MdArrowBack size={24} onClick={() => navigate("/users")} />
            <h1 className="header text-xl sm:text-2xl">User Details</h1>
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            {user.isBanned ? (
              <button
                className="flex items-center gap-2 w-full sm:w-auto border border-green-500 px-3 sm:px-4 py-2 sm:py-3 rounded-3xl text-green-500 hover:bg-green-500 hover:text-white transition-colors duration-300 text-sm sm:text-[16px]"
                onClick={() => handleBanStatus(false)}
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Unban User</span>
                <span className="sm:hidden">Unban</span>
              </button>
            ) : (
              <button
                className="flex items-center gap-2 w-full sm:w-auto border border-red-500 px-3 sm:px-4 py-2 sm:py-3 rounded-3xl text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-300 text-sm sm:text-[16px]"
                onClick={() => handleBanStatus(true)}
              >
                <ShieldOff className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Ban User</span>
                <span className="sm:hidden">Ban</span>
              </button>
            )}
          </div>
        </div>

        <div>
          <form className="space-y-6">
            <div className="flex flex-col md:flex-row gap-20">
              <div className="space-y-10 w-full">
                {/* User Information */}
                <div className="py-4 px-3 sm:px-5 border rounded-lg">
                  <h1 className="font-semibold text-xl sm:text-[24px] mb-6">
                    User Information
                  </h1>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-20">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={avatar}
                        alt=""
                        className="w-16 h-16 sm:w-20 sm:h-20"
                      />
                      <div className="flex-1 sm:flex-none">
                        <p className="font-bold text-lg sm:text-[24px] break-words">
                          {user.userName}
                        </p>
                        <span className="font-bold flex items-center gap-2 text-sm sm:text-base">
                          <MdOutlinePhone /> {user.phoneNumber}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
                      <div>
                        <p className="font-semibold text-[14px] sm:text-[16px] mb-2">
                          User Status
                        </p>
                        <div>{getStatusBadge(user)}</div>
                      </div>

                      <div>
                        <p className="font-semibold text-[14px] sm:text-[16px] mb-2">
                          User Role
                        </p>
                        <div>{getRoleBadge(user.role)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Additional User Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-10">
                    <div>
                      <label htmlFor="userId" className="label">
                        User ID
                      </label>
                      <input
                        type="text"
                        id="userId"
                        name="userId"
                        readOnly
                        value={user._id}
                        className="input-box text-xs sm:text-sm"
                      />
                    </div>

                    {/* <div>
                      <label htmlFor="lastActive" className="label">
                        Last Active
                      </label>
                      <input
                        type="text"
                        id="lastActive"
                        name="lastActive"
                        readOnly
                        value={formatDate(user.lastActiveAt)}
                        className="input-box text-xs sm:text-sm"
                      />
                    </div> */}

                    <div>
                      <label htmlFor="createdAt" className="label">
                        Member Since
                      </label>
                      <input
                        type="text"
                        id="createdAt"
                        name="createdAt"
                        readOnly
                        value={formatDate(user.createdAt)}
                        className="input-box text-xs sm:text-sm"
                      />
                    </div>

                    {/* <div>
                      <label htmlFor="updatedAt" className="label">
                        Last Updated
                      </label>
                      <input
                        type="text"
                        id="updatedAt"
                        name="updatedAt"
                        readOnly
                        value={formatDate(user.updatedAt)}
                        className="input-box text-xs sm:text-sm"
                      />
                    </div> */}
                  </div>
                </div>

                {/* Address Information */}
                <div className="py-4 px-3 sm:px-5 border rounded-lg">
                  <h1 className="font-semibold text-xl sm:text-[24px] mb-6">
                    Saved Addresses
                  </h1>

                  {userAddressInfo && userAddressInfo.length > 0 ? (
                    <div className="space-y-4 sm:space-y-6">
                      {userAddressInfo.map((address, index) => (
                        <div
                          key={address._id}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <MdLocationOn className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              {address.note}
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                              <label className="label">Address</label>
                              <input
                                type="text"
                                readOnly
                                value={address.address}
                                className="input-box text-xs sm:text-sm"
                              />
                            </div>

                            <div>
                              <label className="label">City</label>
                              <input
                                type="text"
                                readOnly
                                value={address.city}
                                className="input-box text-xs sm:text-sm"
                              />
                            </div>

                            <div>
                              <label className="label">Township</label>
                              <input
                                type="text"
                                readOnly
                                value={address.township}
                                className="input-box text-xs sm:text-sm"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="label">Address ID</label>
                              <input
                                type="text"
                                readOnly
                                value={address._id}
                                className="input-box text-xs sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 sm:p-8 text-center text-gray-500">
                      <MdHome className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm sm:text-base">
                        No saved addresses found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>

          {/* User Statistics */}
          {/* <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mt-6 sm:mt-10">
            <div className="flex justify-between items-center mb-6 sm:mb-8 pb-4">
              <h2 className="header text-xl sm:text-2xl">User Statistics</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <MdLocationOn className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Saved Addresses
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {userAddressInfo?.length || 0}
                </p>
              </div>

              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Days Since Joined
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {Math.floor(
                    (new Date() - new Date(user.createdAt)) /
                      (1000 * 60 * 60 * 24),
                  )}
                </p>
              </div>

              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {user.isVerified ? (
                    <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  ) : (
                    <UserX className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Verification Status
                </p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {user.isVerified ? "Verified" : "Unverified"}
                </p>
              </div>

              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {user.isBanned ? (
                    <ShieldOff className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                  ) : (
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Account Status
                </p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {user.isBanned ? "Banned" : "Active"}
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
