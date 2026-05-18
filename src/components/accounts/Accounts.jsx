import { MdOutlinePersonAddAlt } from "react-icons/md";
import AccountTable from "./AccountTable";
import getAllUsers from "../../api/accountApi/getAlluser";
import { useEffect, useState } from "react";
import AddStaffModal from "./AddStaffModal";
import { useNavigate } from "react-router-dom";

function Accounts() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      // console.log(res);
      if (res.code === 200) {
        const filteredUsers = res.data.accounts.filter(
          (user) => !user.softDeleted,
        );
        setUsers(filteredUsers);
      } else if (res.code === 403) {
        navigate("/unauthorized");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-full px-3 sm:px-4">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="header ml-8 lg:ml-0 text-xl sm:text-2xl">Accounts</h1>
        <button
          className="button bg-primary text-white hover:bg-primary/80 transition-all duration-300 px-3 sm:px-4 py-2 text-sm sm:text-base"
          onClick={() => setIsModalOpen(true)}
        >
          <MdOutlinePersonAddAlt size={16} className="sm:size-[20px]" />
          <span className="hidden sm:inline ml-2">Add Staff</span>
          <span className="sm:hidden ml-2">Add</span>
        </button>
      </div>

      <AccountTable users={users} refetch={fetchUsers} />

      <AddStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => {
          setIsModalOpen(false);
          fetchUsers();
        }}
      />
    </div>
  );
}

export default Accounts;
