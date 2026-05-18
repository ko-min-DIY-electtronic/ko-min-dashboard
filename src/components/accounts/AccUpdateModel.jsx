import { useEffect, useState } from "react";
import Modal from "../utli/Modal";
import updatePassword from "../../api/accountApi/updatePassword";
import updateDepartment from "../../api/accountApi/updateDeperment";
const UpdateModel = ({ isOpen, onClose, isPasswordOpen, onSubmit, user }) => {
  // console.log(user);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    setName(user?.name || "");
    // setDepartment(user?.role || "");
  }, [user]);
  // console.log(department);

  const handleClose = () => {
    onClose();
    setPassword("");
    setConfirmPassword("");
    setDepartment(user?.role || "");
    setName(user?.name || "");
  };

  const updateInfo = async () => {
    // console.log("updateDepartment");
    const data = {
      role: department,
      name: name,
    };
    const response = await updateDepartment({ id: user?._id, data });
    // console.log(response);
    if (response.success) {
      handleClose();
      onSubmit();
    }
  };

  const passwordSubmit = async () => {
    // onSubmit();
    // console.log("passwordSubmit");
    const data = {
      newPassword: password,
      confirmPassword,
    };
    const response = await updatePassword({ id: user?._id, data });
    // console.log(response);
    if (response.code === 200) {
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={"Edit Staff Password"}
    >
      {isPasswordOpen ? (
        <div className="space-y-6 w-[500px]">
          <div>
            <label htmlFor="name" className="label">
              New Password
            </label>
            <input
              type="text"
              id="name"
              className="input-box"
              placeholder="Enter New Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="name" className="label">
              Confirm Password
            </label>
            <input
              type="text"
              id="name"
              className="input-box"
              placeholder="Enter Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end mt-5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={passwordSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-primary rounded-lg hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              Confirm Edit
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 w-[500px]">
          <div>
            <label htmlFor="name" className="label">
              Staff Name
            </label>
            <input
              type="text"
              id="name"
              className="input-box"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>

          <div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Department
              </label>
              <select
                id="role"
                name="role"
                value={department || user?.role}
                onChange={(e) => setDepartment(e.target.value)}
                className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              transition-colors
             
            `}
              >
                <option value="">Select Department</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end mt-5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => updateInfo()}
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-primary rounded-lg hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              Confirm Edit
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default UpdateModel;
