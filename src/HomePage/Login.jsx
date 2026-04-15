import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Users, Admins } from "./constants";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [role, setRole] = useState("user"); // default user

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Validation
  const validate = () => {
    let newErrors = {};

    // Email
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (form.email.length > 255) {
      newErrors.email = "Email must be less than 255 characters";
    } else if (/\s/.test(form.email)) {
      newErrors.email = "Email cannot contain spaces";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (/\s/.test(form.password)) {
      newErrors.password = "Password cannot contain spaces";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent whitespace at start
    if (value.startsWith(" ")) return;

    setForm({ ...form, [name]: value });
    setErrors({});
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      const user = Users.find(
        (u) =>
          u.email === form.email &&
          u.password === form.password &&
          u.role === role // match selected role
      );

      const admin = Admins.find(
        (u) =>
          u.email === form.email &&
          u.password === form.password &&
          u.role === role // match selected role
      );

      if (admin?.role === "admin") {
        navigate("/organisationHome");
      } else if (user?.role === "user") {
        navigate("/dashboard");
      } else {
        alert("Invalid credentials or role");
        return;
      }

      if (!localStorage.getItem("data")) {
        localStorage.setItem("data", JSON.stringify(user || admin));
      }
    }
  };

  const isFormValid =
    form.email &&
    form.password &&
    !/\s/.test(form.email) &&
    !/\s/.test(form.password) &&
    form.email.length <= 255;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">
            OPEN <span className="text-blue-500">FEEDBACK</span>
          </h1>
          <p className="text-gray-500 text-xs">
            Give anonymous feedback easily
          </p>
        </div>

        {/* ROLE TOGGLE */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                role === "user"
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-500"
              }`}
            >
              User
            </button>

            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                role === "admin"
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="text"
              name="email"
              value={form.email}
              onChange={handleChange}
              maxLength={255}
              placeholder="Enter your email"
              className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none pr-10"
              />

              {/* Eye Icon */}
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 transition"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </span>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2.5 rounded-xl text-white font-medium transition ${
              isFormValid
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Login
          </button>
        </form>

        {/* Footer */}
        {/* <p className="text-center text-sm text-gray-500 mt-4">
          Don’t have an account?{" "}
          <span className="text-blue-500 cursor-pointer hover:underline">
            Sign up
          </span>
        </p> */}
      </div>
    </div>
  );
};

export default Login;
