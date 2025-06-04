import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";

const Auth = () => {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    department: "",
    employeeId: "",
    role: "Sale-Co",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("https://saleco.ruu-d.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          department: formData.department,
          employeeId: formData.employeeId,
          role: formData.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Registration failed");
        return;
      }

      setSuccess("Registration successful!");
      setIsRegistered(true);
      setTimeout(() => {
        setMode("login");
      }, 2000);
    } catch (err) {
      setError("An error occurred during registration");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("https://saleco.ruu-d.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Login failed");
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("name", data.user.userName);

      const role = data.user.role;
      if (role === "Sale-Co") {
        window.location.href = "/sid/saleco";
      } else if (role === "Inventory") {
        window.location.href = "/sid/inventory";
      } else if (role === "QCM") {
        window.location.href = "/sid/qcm";
      } else {
        setError("Unknown role");
      }

      setSuccess("Login successful!");
    } catch (err) {
      setError("An error occurred during login");
    }
  };

  return (
    <>
      {/* Background Layer */}
      <div
        style={{
          background: "linear-gradient(135deg, #e6f0fa 0%, #b3cde0 100%)",
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      />
      {/* Content Layer */}
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div
                className="card border-0 shadow-lg animate__animated animate__fadeInUp"
                style={{ borderRadius: "20px", overflow: "hidden" }}
              >
                <div
                  className="card-header text-white text-center py-4"
                  style={{
                    background: "linear-gradient(45deg, #1e90ff, #00ced1)",
                    borderBottom: "none",
                  }}
                >
                  <h3 className="mb-0 fw-bold">
                    {mode === "login" ? "Welcome Back" : "Create Account"}
                  </h3>
                  <p className="text-light mt-2 opacity-75">
                    {mode === "login"
                      ? "Please sign in to continue"
                      : "Join the SaleCo team"}
                  </p>
                </div>
                <div className="card-body p-4">
                  <button
                    className="btn btn-outline-primary btn-lg w-100 mb-4"
                    style={{
                      borderRadius: "25px",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() =>
                      setMode(mode === "login" ? "register" : "login")
                    }
                  >
                    Switch to {mode === "login" ? "Register" : "Login"}
                  </button>

                  {mode === "register" && !isRegistered && (
                    <form onSubmit={handleRegister}>
                      <div className="row">
                        {/* Left Column */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              ชื่อ (ชื่อ-สกุล)
                            </label>
                            <input
                              name="fullName"
                              type="text"
                              className="form-control form-control-lg rounded-pill"
                              value={formData.fullName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              แผนก
                            </label>
                            <input
                              name="department"
                              type="text"
                              className="form-control form-control-lg rounded-pill"
                              value={formData.department}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              รหัสผนักงาน
                            </label>
                            <input
                              name="employeeId"
                              type="text"
                              className="form-control form-control-lg rounded-pill"
                              value={formData.employeeId}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        {/* Right Column */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              ตำแหน่ง
                            </label>
                            <select
                              name="role"
                              className="form-select form-select-lg rounded-pill"
                              value={formData.role}
                              onChange={handleChange}
                              required
                            >
                              <option value="Sale-Co">Sale-Co</option>
                              <option value="Inventory">Inventory</option>
                              <option value="QCM">QCM</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              อีเมล (อีเมลบริษัท)
                            </label>
                            <input
                              name="email"
                              type="email"
                              className="form-control form-control-lg rounded-pill"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              รหัสผ่าน
                            </label>
                            <input
                              name="password"
                              type="password"
                              className="form-control form-control-lg rounded-pill"
                              value={formData.password}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="mb-4">
                            <label className="form-label fw-semibold">
                              ยืนยันรหัสผ่าน
                            </label>
                            <input
                              name="confirmPassword"
                              type="password"
                              className="form-control form-control-lg rounded-pill"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 rounded-pill"
                        style={{
                          background:
                            "linear-gradient(45deg, #1e90ff, #00ced1)",
                          border: "none",
                          padding: "12px",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Register
                      </button>
                    </form>
                  )}

                  {mode === "login" && (
                    <form onSubmit={handleLogin}>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">อีเมล</label>
                        <input
                          name="email"
                          type="email"
                          className="form-control form-control-lg rounded-pill"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label fw-semibold">
                          รหัสผ่าน
                        </label>
                        <input
                          name="password"
                          type="password"
                          className="form-control form-control-lg rounded-pill"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 rounded-pill"
                        style={{
                          background:
                            "linear-gradient(45deg, #1e90ff, #00ced1)",
                          border: "none",
                          padding: "12px",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Login
                      </button>
                    </form>
                  )}

                  {error && (
                    <div
                      className="alert alert-danger mt-3 rounded-pill text-center animate__animated animate__shakeX"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}
                  {success && (
                    <div
                      className="alert alert-success mt-3 rounded-pill text-center animate__animated animate__bounceIn"
                      role="alert"
                    >
                      {success}
                    </div>
                  )}
                </div>
                <div className="card-footer text-center py-3 bg-light">
                  <small className="text-muted">
                    © {new Date().getFullYear()} MIS@PEERAPAT. All rights reserved.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;