import React from "react";
import { useNavigate } from "react-router-dom";
import { FaFolderOpen } from "react-icons/fa";
import logo from "./FIFO+.png";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top">
      <div className="container">
        <div className="navbar-brand d-flex align-items-center">
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              height: "30px", 
              transform: "scale(1.8)", 
              transformOrigin: "left center" 
            }} 
            className="me-2" 
          />
        </div>
        <div className="ms-auto d-flex align-items-center">
          <button 
            className="btn document-btn me-3 d-flex align-items-center"
            onClick={() => navigate('/document')}
          >
            <FaFolderOpen className="me-1" /> Documents
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
