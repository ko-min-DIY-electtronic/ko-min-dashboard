import { useState } from "react";
import { Eye, EyeClosedIcon } from "lucide-react";
import { MdLogin } from "react-icons/md";
import handleLogin from "../../api/auth/login";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../../axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible); // Toggle password visibility
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await handleLogin({ name, password });
    console.log(res);

    if (res.success) {
      const token = res.data.token;
      console.log(token);
      // const user = {
      //   name: username,
      //   role: res.data.user.role,
      // };
      setAuthToken(token);
      // localStorage.setItem("uedc-user", JSON.stringify(user));
      sessionStorage.setItem("ko-min-token", token);
      // if (user.role === "admin") {
      navigate("/");
      // }
    }
  };

  // console.log(formData);

  return (
    <div className="flex w-full justify-center items-center h-screen">
      <div className="w-full md:w-[450px] bg-white rounded-lg p-6">
        <h2 className="header font-bold mb-10 border-b pb-5">
          Sign in to Ko Min DIY Store
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Name"
              required
              className="block w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-4 relative">
            <label className="block text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type={isPasswordVisible ? "text" : "password"} // Toggle input type
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
              className="block w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {/* Use the reusable EyeToggle component */}
            <div
              className="absolute top-[50%] justify-center right-3 flex items-center"
              onClick={togglePasswordVisibility}
            >
              {isPasswordVisible ? <Eye /> : <EyeClosedIcon />}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary mt-5 text-white font-bold py-4 rounded hover:bg-blue-600 transition duration-200 rounded-lg"
          >
            <div className="flex items-center justify-center gap-5">
              <MdLogin size={22} />
              <p>Login</p>
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
