import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import InventoryRequests from "./pages/InventoryRequests";
import SaleCoRequests from "./pages/SaleCoRequests";
import QcmRequests from "./pages/QcmRequest"
import 'bootstrap/dist/css/bootstrap.min.css';
import Auth from "./components/Auth";
import Navbar from './components/Navbar';
import AdminDashboard from "./pages/AdminDashboard"
import EditRequestDocument from "./pages/EditRequestDocument";
import Document from "./pages/Document"
import QualityAssurance from "./pages/QualityAssurance";
import Manufacture from "./pages/Manufacture";
import PdfViewer from "./components/PdfViewer";
import Environment from "./pages/Environment";
import "bootswatch/dist/flatly/bootstrap.min.css";
import 'semantic-ui-css/semantic.min.css';
import ExternalServiceForm from "./pages/ExternalServiceForm";



// Create a separate component that uses the useLocation hook
const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/"; // Check if on login page

  return (
    <div className="main-container">
      {/* Conditionally render the Navbar */}
      {!isLoginPage && <Navbar />} 

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/saleco" element={<SaleCoRequests />} />
          <Route path="/inventory" element={<InventoryRequests />} />
          <Route path="/quality-assurance" element={<QualityAssurance />} />
          <Route path="/manufacture" element={<Manufacture />} />
          <Route path="/environment" element={<Environment />} />
          <Route path="/qcm" element={<QcmRequests />} /> 
          <Route path="/admin" element={<AdminDashboard />} /> 
          <Route path="/edit-failed-qc" element={<EditRequestDocument />} /> {/* Add this */}
          <Route path="/pdf" element={<PdfViewer />} />
          <Route path="/document" element={<Document/>}/>
          <Route path="/external-request" element={<ExternalServiceForm />} />
        </Routes>
      </div>
    </div>
  );
};

// Main App component wrapped with Router
const App = () => {
  return (
    <Router basename="/sid">
      <AppContent />
    </Router>
  );
};

export default App;