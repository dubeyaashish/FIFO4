import React, { useState, useEffect, useRef } from "react";

const Auth = () => {
  const [mode, setMode] = useState("login"); // "login", "register", "telegram-register"
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
  const [telegramData, setTelegramData] = useState(null);
  const telegramContainerRef = useRef(null);

  // Load Telegram Login Widget script
  useEffect(() => {
    // Add global callback function first
    window.onTelegramAuth = async (user) => {
      console.log('Telegram auth received:', user);
      setTelegramData(user);
      
      // Check if user exists in database
      try {
        const response = await fetch("https://saleco.ruu-d.com/telegram-check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            telegramId: user.id,
            telegramUsername: user.username,
            telegramFirstName: user.first_name,
            telegramLastName: user.last_name,
          }),
        });

        if (response.ok) {
          // User exists, proceed with login - EXACTLY like manual login
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
          
        } else if (response.status === 404) {
          // User doesn't exist, show registration form
          setMode("telegram-register");
          setSuccess("Welcome! Please complete your registration:");
        } else {
          setError("Failed to authenticate with Telegram");
        }
      } catch (err) {
        console.error("Telegram check error:", err);
        // If check fails, assume new user and show registration
        setMode("telegram-register");
        setSuccess("Welcome! Please complete your registration:");
      }
    };

    // Create and configure the script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'updatesale_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    // Insert the script into the telegram container
    if (telegramContainerRef.current) {
      telegramContainerRef.current.innerHTML = '';
      telegramContainerRef.current.appendChild(script);
    }

    return () => {
      // Cleanup
      if (telegramContainerRef.current && telegramContainerRef.current.contains(script)) {
        telegramContainerRef.current.removeChild(script);
      }
      delete window.onTelegramAuth;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTelegramRegister = async (e) => {
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
          // Include Telegram data
          telegramId: telegramData.id,
          telegramUsername: telegramData.username,
          telegramFirstName: telegramData.first_name,
          telegramLastName: telegramData.last_name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Registration failed");
        return;
      }

      const data = await response.json();
      
      // If backend returns token, login immediately - EXACTLY like manual login
      if (data.token) {
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

        setSuccess("Registration successful! Logging you in...");
      } else {
        // Fallback to traditional registration flow
        setSuccess("Registration successful!");
        setIsRegistered(true);
        setTimeout(() => {
          setMode("login");
        }, 2000);
      }
      
    } catch (err) {
      setError("An error occurred during registration");
    }
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
          // Include Telegram data if available
          ...(telegramData && {
            telegramId: telegramData.id,
            telegramUsername: telegramData.username,
            telegramFirstName: telegramData.first_name,
            telegramLastName: telegramData.last_name,
          })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Registration failed");
        return;
      }

      const data = await response.json();
      
      // If backend returns token, login immediately - EXACTLY like manual login
      if (data.token) {
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

        setSuccess("Registration successful! Logging you in...");
      } else {
        // Traditional registration flow
        setSuccess("Registration successful!");
        setIsRegistered(true);
        setTimeout(() => {
          setMode("login");
        }, 2000);
      }
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

  const resetToLogin = () => {
    setMode("login");
    setTelegramData(null);
    setError("");
    setSuccess("");
    setIsRegistered(false);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      department: "",
      employeeId: "",
      role: "Sale-Co",
    });
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
                    {mode === "login" ? "Welcome Back" : 
                     mode === "register" ? "Create Account" : 
                     "Complete Registration"}
                  </h3>
                  <p className="text-light mt-2 opacity-75">
                    {mode === "login" ? "Please sign in to continue" :
                     mode === "register" ? "Join the SaleCo team" :
                     "Finish setting up your account"}
                  </p>
                </div>
                
                <div className="card-body p-4">

                  {/* Telegram Connected Status - Only show in telegram-register mode */}
                  {mode === "telegram-register" && telegramData && (
                    <div className="mb-4">
                      <div style={{
                        backgroundColor: '#d4edda',
                        border: '1px solid #c3e6cb',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#155724', marginBottom: '0.5rem' }}>
                          ✅ Telegram Connected!
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#155724' }}>
                          👤 <strong>{telegramData.first_name} {telegramData.last_name}</strong>
                          {telegramData.username && (
                            <span> (@{telegramData.username})</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={resetToLogin}
                          className="btn btn-link btn-sm text-primary mt-2"
                          style={{ textDecoration: 'underline', padding: 0 }}
                        >
                          Use different account
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Telegram Login Section - Only show on login/register modes */}
                  {(mode === "login" || mode === "register") && (
                    <>
                      <div className="mb-4">
                        <div style={{
                          backgroundColor: '#f8f9fa',
                          border: '2px solid #e9ecef',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          textAlign: 'center'
                        }}>
                          <h5 style={{ color: '#495057', marginBottom: '1rem' }}>
                            🚀 Quick Login with Telegram
                          </h5>
                          <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '1rem' }}>
                            Fast and secure authentication
                          </p>
                          <div 
                            ref={telegramContainerRef}
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              minHeight: '50px'
                            }}
                          >
                            <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                              Loading Telegram login...
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* OR Divider */}
                      <div className="d-flex align-items-center my-4">
                        <hr className="flex-grow-1" />
                        <span className="mx-3 text-muted">OR</span>
                        <hr className="flex-grow-1" />
                      </div>
                    </>
                  )}

                  {/* Switch Button - Only show on login/register modes */}
                  {(mode === "login" || mode === "register") && (
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
                  )}

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
                          background: "linear-gradient(45deg, #1e90ff, #00ced1)",
                          border: "none",
                          padding: "12px",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Register
                      </button>
                    </form>
                  )}

                  {/* Telegram Registration Form */}
                  {mode === "telegram-register" && (
                    <form onSubmit={handleTelegramRegister}>
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
                              placeholder={telegramData ? `${telegramData.first_name} ${telegramData.last_name}` : ""}
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
                        className="btn btn-lg w-100 rounded-pill"
                        style={{
                          background: "linear-gradient(45deg, #22c55e, #1e90ff)",
                          border: "none",
                          padding: "12px",
                          transition: "all 0.3s ease",
                          color: "white",
                          fontWeight: "600"
                        }}
                      >
                        Complete Registration with Telegram
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
                          background: "linear-gradient(45deg, #1e90ff, #00ced1)",
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