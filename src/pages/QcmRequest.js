import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  ListGroup,
  Pagination,
  Collapse,
  Alert,
  Badge,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { 
  FaSearch, 
  FaUserCircle, 
  FaClipboard, 
  FaCheck, 
  FaTimes, 
  FaFileAlt, 
  FaImage, 
  FaArrowLeft, 
  FaArrowRight, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUser, 
  FaBuilding, 
  FaInfoCircle, 
  FaHistory, 
  FaBoxOpen, 
  FaClipboardCheck,
  FaWarehouse,
  FaCheckCircle,
  FaTimesCircle 
} from "react-icons/fa";
import "./midnight.css";
import loadingSvg from "./Loading.svg"; // Import the SVG file from the same directory

// Styles object for consistent styling
const styles = {
  pageContainer: {
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    paddingTop: "3rem",
    paddingBottom: "2rem",
    width: "100vw",
    margin: 0,
    position: "absolute",
    left: 0,
    overflow: "hidden"
  },
  headerTitle: {
    color: "#2c3e50",
    fontWeight: "bold",
    borderBottom: "2px solid #3498db",
    paddingBottom: "0.75rem",
    marginBottom: "0.5rem",
    fontSize: "2rem"
  },
  card: {
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "none",
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    marginBottom: "1.5rem"
  },
  cardHover: {
    transform: "translateY(-3px)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)"
  },
  cardHeader: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
    padding: "1rem 1.25rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardHeaderIcon: {
    marginRight: "0.75rem",
    color: "#3498db"
  },
  primaryButton: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
    boxShadow: "0 2px 4px rgba(52, 152, 219, 0.3)",
    transition: "all 0.2s"
  },
  secondaryButton: {
    backgroundColor: "#95a5a6",
    borderColor: "#95a5a6",
    boxShadow: "0 2px 4px rgba(149, 165, 166, 0.3)",
    transition: "all 0.2s"
  },
  dangerButton: {
    backgroundColor: "#e74c3c",
    borderColor: "#e74c3c",
    boxShadow: "0 2px 4px rgba(231, 76, 60, 0.3)",
    transition: "all 0.2s"
  },
  successButton: {
    backgroundColor: "#2ecc71",
    borderColor: "#2ecc71",
    boxShadow: "0 2px 4px rgba(46, 204, 113, 0.3)",
    transition: "all 0.2s"
  },
  infoButton: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
    boxShadow: "0 2px 4px rgba(52, 152, 219, 0.3)",
    transition: "all 0.2s"
  },
  outlineButton: {
    borderColor: "#3498db",
    color: "#3498db",
    transition: "all 0.2s"
  },
  buttonHover: {
    transform: "translateY(-1px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)"
  },
  table: {
    boxShadow: "0 2px 3px rgba(0, 0, 0, 0.05)",
    borderRadius: "0.5rem",
    overflow: "hidden"
  },
  navItem: {
    margin: "0.25rem 0",
    borderRadius: "0.5rem",
    fontWeight: "500",
    transition: "all 0.3s"
  },
  navItemActive: {
    backgroundColor: "#3498db !important",
    color: "white !important",
    boxShadow: "0 2px 5px rgba(52, 152, 219, 0.5)"
  },
  sidebar: {
    backgroundColor: "#ffffff",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)",
    position: "sticky",
    top: "1rem"
  },
  badge: {
    padding: "0.5em 0.75em",
    borderRadius: "30px",
    fontWeight: "normal",
    fontSize: "0.75rem"
  },
  infoBox: {
    borderLeft: "4px solid #3498db",
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    padding: "1rem",
    borderRadius: "0 0.5rem 0.5rem 0",
    marginBottom: "1rem"
  },
  paginationContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "1.5rem",
    gap: "0.5rem"
  },
  paginationButton: {
    display: "flex",
    alignItems: "center",
    padding: "0.4rem 0.8rem"
  },
  tableHeader: {
    backgroundColor: "#f8f9fa",
    color: "#2c3e50",
    fontWeight: "600"
  },
  searchContainer: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center"
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)",
    marginBottom: "1rem"
  },
  dataRow: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginBottom: "0.5rem"
  },
  dataLabel: {
    fontWeight: "600",
    color: "#7f8c8d",
    fontSize: "0.875rem",
    marginBottom: "0.25rem",
    display: "flex",
    alignItems: "center"
  },
  dataIcon: {
    marginRight: "0.5rem",
    color: "#3498db"
  },
  dataValue: {
    color: "#2c3e50",
    fontSize: "1rem"
  },
  serialItem: {
    border: "1px solid #e9ecef",
    borderRadius: "0.5rem",
    padding: "1rem",
    marginBottom: "1rem",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
  },
  formControl: {
    border: "1px solid #e9ecef",
    borderRadius: "0.375rem",
    padding: "0.6rem 1rem",
    fontSize: "0.95rem",
    boxShadow: "none",
    transition: "border-color 0.15s ease-in-out"
  },
  imagePreviewContainer: {
    border: "1px solid #e9ecef",
    borderRadius: "0.5rem",
    padding: "0.5rem",
    marginTop: "0.5rem",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f8f9fa"
  },
  imagePreview: {
    height: "40px",
    width: "40px",
    marginRight: "0.75rem",
    objectFit: "cover",
    borderRadius: "0.25rem"
  },
  modalBody: {
    padding: "1.5rem"
  },
  modalHeader: {
    backgroundColor: "#f8f9fa",
    border: "none",
    padding: "1.25rem 1.5rem"
  },
  modalFooter: {
    border: "none",
    padding: "0.75rem 1.5rem 1.5rem"
  },
  modalImage: {
    maxWidth: "100%",
    maxHeight: "300px",
    borderRadius: "0.5rem",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
  }
};

// Custom LoadingSpinner component using SVG
const LoadingSpinner = React.memo(({ size = '60px' }) => (
  <div className="text-center my-4 d-flex justify-content-center align-items-center" style={{ height: size }}>
    <img src={loadingSvg} alt="Loading..." style={{ height: size, width: size }} />
  </div>
));

// Enhanced search input component
const SearchInput = React.memo(({ value, onChange, placeholder }) => (
  <InputGroup className="mb-4">
    <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}>
      <FaSearch style={{ color: "#3498db" }} />
    </InputGroup.Text>
    <Form.Control
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={styles.formControl}
    />
  </InputGroup>
));

// Helper function to group an array of requests by their document_id
const groupByDocumentId = (requests) => {
  return requests.reduce((groups, request) => {
    const { document_id } = request;
    if (!groups[document_id]) {
      groups[document_id] = [];
    }
    groups[document_id].push(request);
    return groups;
  }, {});
};

// Helper function to split the combined "ชื่อประสานงานขาย" field
const splitNameAndDept = (combinedName) => {
  if (!combinedName) return { name: "N/A", department: "" };
  const regex = /(.*?)\s*แผนก\s*(.*)/;
  const match = combinedName.match(regex);
  if (match) {
    return { name: match[1].trim(), department: match[2].trim() };
  }
  return { name: combinedName, department: "" };
};

// ------------------- QCM Telegram Notification Helper -------------------
// This helper sends a Telegram notification for QCM actions.
// Parameters:
//   documentId: the document identifier,
//   actionType: "Accept", "Pass", or "Fail",
//   item: the QCM request item (should have sn_number and description),
//   username: the user who clicked,
//   remark: optional remark (for Pass/Fail)
const sendTelegramNotificationForQCM = async (documentId, actionType, item, username, remark = "") => {
  const header = "เอกสารมีการเปลี่ยนสถานะแล้ว";
  let statusMessage = "";
  if (actionType === "Accept") {
    statusMessage = "เอกสารอยู่ที่ QCM แล้ว 🏢";
  } else if (actionType === "Pass") {
    statusMessage = "สินค้าผ่านแล้ว 👍";
  } else if (actionType === "Fail") {
    statusMessage = "สินค้าไม่ผ่าน 👎";
  }

  // Include timestamp for Pass/Fail actions
  const timestampText = (actionType === "Pass" || actionType === "Fail")
    ? `<b>Time:</b> ${new Date().toLocaleString("en-GB")}\n`
    : "";

  const telegramMessage =
    `<b>${header}</b>\n` +
    `<b>🗎 Document ID:</b> ${documentId}\n` +
    `<b>📖 Status:</b> ${statusMessage}\n` +
    `<b>🏴 Serial:</b> ${item.sn_number}\n` +
    `<b>🗒️ Description:</b> ${item.description}\n` +
    `<b>👤 User:</b> ${username}\n` +
    (remark ? `<b>📓 Remark:</b> ${remark}\n` : "") +
    timestampText;

  // Determine chat IDs based on actionType:
  let chatIds = [];
  if (actionType === "Accept") {
    chatIds = ["-4614144690", "-4631636900", "-4761676700"];
  } else {
    chatIds = ["-4614144690", "-4631636900"];
  }

  try {
    await Promise.all(
      chatIds.map((chatId) =>
        fetch("https://api.telegram.org/bot7646625188:AAGS-NqBl3rUU9AlC9a01wzlbaqs6spBf7M/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramMessage,
            parse_mode: "HTML",
          }),
        })
      )
    );
    console.log("QCM Telegram notification sent successfully to chats:", chatIds.join(", "));
  } catch (error) {
    console.error("Error sending QCM Telegram notification:", error);
  }
};

const QcmRequests = () => {
  // Data states
  const [inventoryRequests, setInventoryRequests] = useState([]);
  const [qcmRequests, setQcmRequests] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  // UI states
  const [expandedCards, setExpandedCards] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userName, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  // Sidebar active section state
  const [activeSection, setActiveSection] = useState("inventory");
  // Pagination states for each section
  const [inventoryPage, setInventoryPage] = useState(1);
  const [qcmPage, setQcmPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 5;
  // Search term states for each section
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");
  const [qcmSearchTerm, setQcmSearchTerm] = useState("");
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  // State for input validation & clipboard copy in QCM section
  const [validatedInputs, setValidatedInputs] = useState({});

  // ------------------- State for Viewing Images -------------------
  const [showViewImageModal, setShowViewImageModal] = useState(false);
  const [viewImageSrc, setViewImageSrc] = useState(null);

  const openViewImageModal = (src) => {
    setViewImageSrc(src);
    setShowViewImageModal(true);
  };

  const closeViewImageModal = () => {
    setShowViewImageModal(false);
    setViewImageSrc(null);
  };

  // ------------------- Data Fetching -------------------
  const fetchUserDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/sid";
      return;
    }
    
    try {
      const response = await fetch("https://saleco.ruu-d.com/user-details", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/sid";
        return;
      }
      
      if (!response.ok) throw new Error("Failed to fetch user details");
      
      const data = await response.json();
      setUserName(data.fullName);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setErrorMessage(error.message);
    }
  };
  

  const fetchInventoryRequests = async () => {
    try {
      const response = await fetch("https://saleco.ruu-d.com/inventory-out-requests");
      if (!response.ok) throw new Error("Failed to fetch inventory requests");
      const data = await response.json();
      setInventoryRequests(data);
    } catch (error) {
      console.error("Error fetching inventory requests:", error);
    }
  };

  const fetchQcmRequests = async () => {
    try {
      const response = await fetch("https://saleco.ruu-d.com/qcm-requests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch QCM requests");
      const data = await response.json();
      setQcmRequests(data);
    } catch (error) {
      console.error("Error fetching QCM requests:", error);
    }
  };

  const fetchHistoryRequests = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch("https://saleco.ruu-d.com/qcm-history-requests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch history requests");
      const data = await response.json();
      setTransactionHistory(data);
    } catch (error) {
      console.error("Error fetching history requests:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // ------------------- QCM Status Update Functions -------------------
  // This function updates the status for a given serial number
  const handleUpdateStatus = async (serialNumber, status, remark) => {
    try {
      const qcmName = localStorage.getItem("userName") || "Unknown User";
      const encodedSerialNumber = encodeURIComponent(serialNumber);
      const response = await fetch(
        `https://saleco.ruu-d.com/qcm-requests/${encodedSerialNumber}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, remark, qcmName, userName }),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update status: ${errorText}`);
      }
      const data = await response.json();
      alert(data.message);
      // Refresh QCM and Inventory requests after status update
      fetchQcmRequests();
      fetchInventoryRequests();
    } catch (error) {
      console.error("Error updating status:", error.message);
      alert(`Error updating status: ${error.message}`);
    }
  };

  // For Accept at QCM: update status and send notification to all three chats.
  const handleAcceptQCM = async (item) => {
    await handleUpdateStatus(item.sn_number, "At QCM", "");
    const docId = item.document_id || "Unknown";
    await sendTelegramNotificationForQCM(docId, "Accept", item, userName);
  };

  // For Pass QC: update status and send notification to first two chats.
  const handlePassQC = async (serialNumber, remark) => {
    await handleUpdateStatus(serialNumber, "Pass QC", remark);
    const matchingItem = qcmRequests.find((item) => item.sn_number === serialNumber);
    const docId = matchingItem ? matchingItem.document_id : "Unknown";
    if (matchingItem) {
      await sendTelegramNotificationForQCM(docId, "Pass", matchingItem, userName, remark);
    }
  };

  // For Fail QC: update status and send notification to first two chats.
  const handleFailQC = async (serialNumber, remark) => {
    await handleUpdateStatus(serialNumber, "Fail QC", remark);
    const matchingItem = qcmRequests.find((item) => item.sn_number === serialNumber);
    const docId = matchingItem ? matchingItem.document_id : "Unknown";
    if (matchingItem) {
      await sendTelegramNotificationForQCM(docId, "Fail", matchingItem, userName, remark);
    }
  };

  // ------------------- Pagination Helpers -------------------
  const paginateKeys = (keys, pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    return keys.slice(startIndex, startIndex + itemsPerPage);
  };

  const renderPagination = (keys, pageNumber, setPage) => {
    const totalPages = Math.ceil(keys.length / itemsPerPage);
    
    if (totalPages <= 1) return null;
    
    // Function to render page button
    const renderPageButton = (pageNum) => (
      <Button
        key={pageNum}
        variant={pageNum === pageNumber ? "primary" : "outline-primary"}
        onClick={() => setPage(pageNum)}
        className="mx-1"
        style={{ minWidth: "40px" }}
      >
        {pageNum}
      </Button>
    );
    
    // Determine which page numbers to show
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate range to show around current page
    const delta = 1; // Number of pages to show before and after current page
    const left = Math.max(2, pageNumber - delta);
    const right = Math.min(totalPages - 1, pageNumber + delta);
    
    // Add ellipsis after first page if needed
    if (left > 2) {
      pageNumbers.push('ellipsis1');
    }
    
    // Add pages around current page
    for (let i = left; i <= right; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (right < totalPages - 1) {
      pageNumbers.push('ellipsis2');
    }
    
    // Always show last page if not already included
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return (
      <div style={styles.paginationContainer}>
        <Button 
          variant="outline-primary" 
          onClick={() => setPage(1)} 
          disabled={pageNumber === 1}
          style={styles.paginationButton}
        >
          First
        </Button>
        
        <Button 
          variant="outline-primary" 
          onClick={() => setPage(Math.max(1, pageNumber - 1))} 
          disabled={pageNumber === 1}
          style={styles.paginationButton}
        >
          <FaArrowLeft className="me-1" /> Previous
        </Button>
        
        <div className="d-flex">
          {pageNumbers.map((page, idx) => {
            if (page === 'ellipsis1' || page === 'ellipsis2') {
              return <div key={page} className="mx-2 align-self-center">...</div>;
            }
            return renderPageButton(page);
          })}
        </div>
        
        <Button 
          variant="outline-primary" 
          onClick={() => setPage(Math.min(totalPages, pageNumber + 1))} 
          disabled={pageNumber === totalPages}
          style={styles.paginationButton}
        >
          Next <FaArrowRight className="ms-1" />
        </Button>
        
        <Button 
          variant="outline-primary" 
          onClick={() => setPage(totalPages)} 
          disabled={pageNumber === totalPages}
          style={styles.paginationButton}
        >
          Last
        </Button>
      </div>
    );
  };

  // ------------------- Search Filtering -------------------
  const filteredInventoryRequests = useMemo(() => inventoryRequests.filter((req) =>
    inventorySearchTerm === "" ||
    req.document_id.toString().toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
    (req.customer_name && req.customer_name.toLowerCase().includes(inventorySearchTerm.toLowerCase())) ||
    (req.name && req.name.toLowerCase().includes(inventorySearchTerm.toLowerCase())) ||
    (req.sn_number && req.sn_number.toLowerCase().includes(inventorySearchTerm.toLowerCase()))
  ), [inventoryRequests, inventorySearchTerm]);
  
  const filteredQcmRequests = useMemo(() => qcmRequests.filter((req) =>
    qcmSearchTerm === "" ||
    req.document_id.toString().toLowerCase().includes(qcmSearchTerm.toLowerCase()) ||
    (req.customer_name && req.customer_name.toLowerCase().includes(qcmSearchTerm.toLowerCase())) ||
    (req.name && req.name.toLowerCase().includes(qcmSearchTerm.toLowerCase())) ||
    (req.sn_number && req.sn_number.toLowerCase().includes(qcmSearchTerm.toLowerCase()))
  ), [qcmRequests, qcmSearchTerm]);
  
  const filteredTransactionHistory = useMemo(() => transactionHistory.filter((req) =>
    historySearchTerm === "" ||
    req.document_id.toString().toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    (req.customer_name && req.customer_name.toLowerCase().includes(historySearchTerm.toLowerCase())) ||
    (req.name && req.name.toLowerCase().includes(historySearchTerm.toLowerCase())) ||
    (req.sn_number && req.sn_number.toLowerCase().includes(historySearchTerm.toLowerCase()))
  ), [transactionHistory, historySearchTerm]);
  

  const groupedInventory = groupByDocumentId(filteredInventoryRequests);
  const groupedQcm = groupByDocumentId(filteredQcmRequests);
  const groupedHistory = groupByDocumentId(filteredTransactionHistory);

  const inventoryKeys = Object.keys(groupedInventory);
  const qcmKeys = Object.keys(groupedQcm);
  const historyKeys = Object.keys(groupedHistory);

  // ------------------- Initial Data Fetching -------------------
  useEffect(() => {
    fetchUserDetails();
    if (activeSection === "inventory") fetchInventoryRequests();
    if (activeSection === "qcm") fetchQcmRequests();
    if (activeSection === "history") fetchHistoryRequests();
    setLoading(false);
  }, [activeSection]);

  return (
    <div style={styles.pageContainer}>
      <Container>
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={styles.headerTitle}>Quality Control Management</h2>
        </div>
        
        {errorMessage && (
          <Alert 
            variant="danger" 
            onClose={() => setErrorMessage("")} 
            dismissible
            style={{ borderRadius: "0.5rem", marginBottom: "1.5rem" }}
          >
            <div className="d-flex align-items-center">
              <FaInfoCircle className="me-2" />
              {errorMessage}
            </div>
          </Alert>
        )}
        
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
            <LoadingSpinner size="80px" />
          </div>
        ) : (
          <Row>
            {/* Sidebar Navigation */}
            <Col md={3}>
              <div style={styles.sidebar}>
                <div className="d-flex align-items-center mb-3">
                  <div className="d-flex justify-content-center align-items-center bg-primary rounded-circle p-2 me-2" style={{ width: 40, height: 40 }}>
                    <FaUser color="white" size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#2c3e50" }}>{userName || "User"}</div>
                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>QCM Staff</div>
                  </div>
                </div>
                
                <div style={styles.infoBox} className="mb-4">
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Navigation</div>
                  <div style={{ fontSize: '0.85rem' }}>
                    Use the menu below to navigate between different sections of the quality control management system.
                  </div>
                </div>
                
                <ListGroup>
                  <ListGroup.Item 
                    action 
                    active={activeSection === "inventory"} 
                    onClick={() => setActiveSection("inventory")}
                    style={{ 
                      ...styles.navItem,
                      ...(activeSection === "inventory" ? styles.navItemActive : {})
                    }}
                  >
                    <FaWarehouse className="me-2" /> เอกสารจากคลัง
                  </ListGroup.Item>
                  
                  <ListGroup.Item 
                    action 
                    active={activeSection === "qcm"} 
                    onClick={() => setActiveSection("qcm")}
                    style={{ 
                      ...styles.navItem,
                      ...(activeSection === "qcm" ? styles.navItemActive : {})
                    }}
                  >
                    <FaClipboardCheck className="me-2" /> QCM
                  </ListGroup.Item>
                  
                  <ListGroup.Item 
                    action 
                    active={activeSection === "history"} 
                    onClick={() => setActiveSection("history")}
                    style={{ 
                      ...styles.navItem,
                      ...(activeSection === "history" ? styles.navItemActive : {})
                    }}
                  >
                    <FaHistory className="me-2" /> ประวัติของเอกสาร
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Col>

            {/* Main Content */}
            <Col md={9}>
              {/* Inventory Requests Section */}
              {activeSection === "inventory" && (
                <>
                  <div className="d-flex align-items-center mb-4">
                    <FaWarehouse className="me-2" style={{ color: "#3498db" }} />
                    <h3 className="m-0">Requests from Inventory</h3>
                  </div>
                  
                  <SearchInput
                    placeholder="Search by Document ID, ชื่อลูกค้า, or ชื่อประสานงานขาย..."
                    value={inventorySearchTerm}
                    onChange={(e) => {
                      setInventorySearchTerm(e.target.value);
                      setInventoryPage(1);
                    }}
                  />
                  
                  {inventoryKeys.length === 0 ? (
                    <Alert variant="info" style={{ borderRadius: "0.5rem" }}>
                      <div className="d-flex align-items-center">
                        <FaInfoCircle className="me-2" />
                        No requests from inventory.
                      </div>
                    </Alert>
                  ) : (
                    <>
                      {paginateKeys(inventoryKeys, inventoryPage).map((documentId) => {
                        const items = groupedInventory[documentId];
                        const { name: displayName, department: displayDepartment } = splitNameAndDept(items[0]?.name);
                        const isHovered = hoveredCard === documentId;
                        
                        return (
                          <Card 
                            key={documentId} 
                            className="mb-4" 
                            style={{ 
                              ...styles.card,
                              ...(isHovered ? styles.cardHover : {}),
                              borderLeft: "4px solid #3498db" 
                            }}
                            onMouseEnter={() => setHoveredCard(documentId)}
                            onMouseLeave={() => setHoveredCard(null)}
                          >
                            <Card.Header style={styles.cardHeader}>
                              <span style={{ display: "flex", alignItems: "center" }}>
                                <FaFileAlt style={{ marginRight: "0.5rem", color: "#3498db" }} />
                                Document ID: {documentId}
                              </span>
                              <Badge bg="warning" style={styles.badge}>
                                Pending QCM
                              </Badge>
                            </Card.Header>
                            <Card.Body style={{ padding: "1.25rem" }}>
                              <Row>
                                <Col md={6}>
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaUser style={styles.dataIcon} /> ชื่อลูกค้า
                                    </div>
                                    <div style={styles.dataValue}>{items[0]?.customer_name || "N/A"}</div>
                                  </div>
                                  
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaMapMarkerAlt style={styles.dataIcon} /> ที่อยู่ลูกค้า
                                    </div>
                                    <div style={styles.dataValue}>{items[0]?.customer_address || "N/A"}</div>
                                  </div>
                                  
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaUser style={styles.dataIcon} /> ชื่อประสานงานขาย
                                    </div>
                                    <div style={styles.dataValue}>{displayName}</div>
                                  </div>
                                  
                                  {displayDepartment && (
                                    <div style={styles.dataRow}>
                                      <div style={styles.dataLabel}>
                                        <FaBuilding style={styles.dataIcon} /> แผนกผู้แจ้ง
                                      </div>
                                      <div style={styles.dataValue}>{displayDepartment}</div>
                                    </div>
                                  )}
                                </Col>
                                
                                <Col md={6}>
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaCalendarAlt style={styles.dataIcon} /> จำนวน
                                    </div>
                                    <div style={styles.dataValue}>
                                      {items.reduce((total, item) => total + (item.quantity || 0), 0)}
                                    </div>
                                  </div>
                                  
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaCalendarAlt style={styles.dataIcon} /> วันที่สร้างเอกสาร
                                    </div>
                                    <div style={styles.dataValue}>
                                      {new Date(items[0].timestamp).toLocaleDateString("en-GB")}
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                              
                              <div className="d-flex gap-3 mt-4">
                                <Button 
                                  variant="success" 
                                  onClick={() => handleAcceptQCM(items[0])}
                                  style={styles.successButton}
                                >
                                  <FaCheck className="me-1" /> Accept for QCM
                                </Button>
                              </div>
                              
                              <div className="d-flex justify-content-between mt-3">
                                <Button 
                                  variant="link" 
                                  className="p-0" 
                                  onClick={() => setExpandedCards((prev) => ({ ...prev, [documentId]: !prev[documentId] }))}
                                  style={{ color: "#3498db", textDecoration: "none" }}
                                >
                                  {expandedCards[documentId] ? "See Less" : "See More"}
                                </Button>
                              </div>
                              
                              <Collapse in={expandedCards[documentId]}>
                                <div id={`collapse-${documentId}`} className="mt-3">
                                  <Card style={{ ...styles.card, marginBottom: 0 }}>
                                    <Card.Header style={{ ...styles.cardHeader, backgroundColor: "#f8f9fa" }}>
                                      <span style={{ fontWeight: "600" }}>Product Details</span>
                                    </Card.Header>
                                    <Card.Body style={{ padding: 0 }}>
                                      <Table striped bordered hover size="sm" className="mb-0" style={styles.table}>
                                        <thead style={styles.tableHeader}>
                                          <tr>
                                            <th>Product ID</th>
                                            <th>Serial Number</th>
                                            <th>Description</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {items.map((item) => (
                                            <tr key={item.sn_number}>
                                              <td>{item.product_id || "N/A"}</td>
                                              <td>{item.sn_number || "N/A"}</td>
                                              <td>{item.description}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </Table>
                                    </Card.Body>
                                  </Card>
                                </div>
                              </Collapse>
                            </Card.Body>
                          </Card>
                        );
                      })}
                      {renderPagination(inventoryKeys, inventoryPage, setInventoryPage)}
                    </>
                  )}
                </>
              )}

              {/* QCM Requests Section */}
              {activeSection === "qcm" && (
                <>
                  <div className="d-flex align-items-center mb-4">
                    <FaClipboardCheck className="me-2" style={{ color: "#3498db" }} />
                    <h3 className="m-0">Requests at QCM</h3>
                  </div>
                  
                  <SearchInput
                    placeholder="Search by Document ID, ชื่อลูกค้า, or ชื่อประสานงานขาย..."
                    value={qcmSearchTerm}
                    onChange={(e) => {
                      setQcmSearchTerm(e.target.value);
                      setQcmPage(1);
                    }}
                  />
                  
                  {qcmKeys.length === 0 ? (
                    <Alert variant="info" style={{ borderRadius: "0.5rem" }}>
                      <div className="d-flex align-items-center">
                        <FaInfoCircle className="me-2" />
                        No requests at QCM.
                      </div>
                    </Alert>
                  ) : (
                    <>
                      {paginateKeys(qcmKeys, qcmPage).map((documentId) => {
                        const items = groupedQcm[documentId];
                        const { name: displayName, department: displayDepartment } = splitNameAndDept(items[0]?.name);
                        const isHovered = hoveredCard === documentId;
                        
                        return (
                          <Card 
                            key={documentId} 
                            className="mb-4" 
                            style={{ 
                              ...styles.card,
                              ...(isHovered ? styles.cardHover : {}),
                              borderLeft: "4px solid #2ecc71" 
                            }}
                            onMouseEnter={() => setHoveredCard(documentId)}
                            onMouseLeave={() => setHoveredCard(null)}
                          >
                            <Card.Header style={styles.cardHeader}>
                              <span style={{ display: "flex", alignItems: "center" }}>
                                <FaFileAlt style={{ marginRight: "0.5rem", color: "#3498db" }} />
                                Document ID: {documentId}
                              </span>
                              <Badge bg="info" style={styles.badge}>
                                In QCM
                              </Badge>
                            </Card.Header>
                            <Card.Body style={{ padding: "1.25rem" }}>
                              <Row className="mb-4">
                                <Col md={6}>
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaUser style={styles.dataIcon} /> ชื่อลูกค้า
                                    </div>
                                    <div style={styles.dataValue}>{items[0]?.customer_name || "N/A"}</div>
                                  </div>
                                  
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaMapMarkerAlt style={styles.dataIcon} /> ที่อยู่ลูกค้า
                                    </div>
                                    <div style={styles.dataValue}>{items[0]?.customer_address || "N/A"}</div>
                                  </div>
                                  
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaCalendarAlt style={styles.dataIcon} /> วันที่ต้องการสินค้า
                                    </div>
                                    <div style={styles.dataValue}>
                                      {items[0].wantDate ? new Date(items[0].wantDate).toLocaleDateString("en-GB") : "N/A"}
                                    </div>
                                  </div>
                                  
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaBuilding style={styles.dataIcon} /> เก็บค่าใช้จ่ายแผนก
                                    </div>
                                    <div style={styles.dataValue}>{items[0]?.departmentExpense || "N/A"}</div>
                                  </div>
                                </Col>
                                
                                <Col md={6}>
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaFileAlt style={styles.dataIcon} /> รหัสสินค้า
                                    </div>
                                    <div style={styles.dataValue}>{items[0]?.product_id || "N/A"}</div>
                                  </div>
                                  
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaInfoCircle style={styles.dataIcon} /> รายละเอียดการแจ้งงาน
                                    </div>
                                    <div style={styles.dataValue}>{items[0]?.รายละเอียดการแจ้งงาน || "N/A"}</div>
                                  </div>
                                  
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaInfoCircle style={styles.dataIcon} /> Remark
                                    </div>
                                    <div style={styles.dataValue}>{items[0]?.remark || "N/A"}</div>
                                  </div>
                                  
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaUser style={styles.dataIcon} /> ชื่อประสานงานขาย
                                    </div>
                                    <div style={styles.dataValue}>{displayName}</div>
                                    {displayDepartment && (
                                      <div style={{ fontSize: "0.85rem", color: "#7f8c8d" }}>
                                        แผนก {displayDepartment}
                                      </div>
                                    )}
                                  </div>
                                </Col>
                              </Row>
                              
                              <h6 className="mb-3">Serial Numbers</h6>
                              {items.map((item) => (
                                <div key={item.sn_number} style={styles.serialItem}>
                                  <Row className="align-items-center mb-3">
                                    <Col xs={12} md={4}>
                                      <div style={{ fontWeight: "600", color: "#3498db" }}>
                                        Serial Number: {item.sn_number}
                                      </div>
                                      <div style={{ color: "#7f8c8d", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                                        {item.description}
                                      </div>
                                    </Col>
                                    
                                    <Col xs={12} md={3} className="mt-3 mt-md-0">
                                      <Form.Control
                                        type="text"
                                        placeholder="Enter serial number"
                                        value={validatedInputs[item.sn_number]?.copiedSerial || ""}
                                        onChange={(e) =>
                                          setValidatedInputs((prev) => ({
                                            ...prev,
                                            [item.sn_number]: {
                                              ...(prev[item.sn_number] || {}),
                                              copiedSerial: e.target.value,
                                            },
                                          }))
                                        }
                                        style={styles.formControl}
                                      />
                                    </Col>
                                    
                                    <Col xs={12} md={3} className="mt-3 mt-md-0">
                                      <Form.Control
                                        type="text"
                                        placeholder="Enter remark"
                                        value={validatedInputs[item.sn_number]?.remark || ""}
                                        onChange={(e) =>
                                          setValidatedInputs((prev) => ({
                                            ...prev,
                                            [item.sn_number]: {
                                              ...(prev[item.sn_number] || {}),
                                              remark: e.target.value,
                                            },
                                          }))
                                        }
                                        style={styles.formControl}
                                      />
                                    </Col>
                                    
                                    <Col xs={12} md={2} className="mt-3 mt-md-0 text-md-center">
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Copy to input</Tooltip>}
                                      >
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          style={styles.outlineButton}
                                          onClick={() => {
                                            navigator.clipboard.writeText(item.sn_number);
                                            setValidatedInputs((prev) => ({
                                              ...prev,
                                              [item.sn_number]: {
                                                ...(prev[item.sn_number] || {}),
                                                copiedSerial: item.sn_number,
                                                isValid: true,
                                              },
                                            }));
                                          }}
                                        >
                                          <FaClipboard />
                                        </Button>
                                      </OverlayTrigger>
                                    </Col>
                                  </Row>
                                  
                                  <div className="d-flex justify-content-end gap-2 mt-2">
                                    <Button
                                      variant="success"
                                      disabled={
                                        !validatedInputs[item.sn_number]?.isValid ||
                                        validatedInputs[item.sn_number]?.copiedSerial !== item.sn_number ||
                                        !validatedInputs[item.sn_number]?.remark
                                      }
                                      onClick={() =>
                                        handlePassQC(item.sn_number, validatedInputs[item.sn_number]?.remark || "")
                                      }
                                      style={
                                        validatedInputs[item.sn_number]?.isValid &&
                                        validatedInputs[item.sn_number]?.copiedSerial === item.sn_number &&
                                        validatedInputs[item.sn_number]?.remark
                                          ? styles.successButton
                                          : undefined
                                      }
                                    >
                                      <FaCheckCircle className="me-1" /> Pass
                                    </Button>
                                    <Button
                                      variant="danger"
                                      disabled={
                                        !validatedInputs[item.sn_number]?.isValid ||
                                        validatedInputs[item.sn_number]?.copiedSerial !== item.sn_number ||
                                        !validatedInputs[item.sn_number]?.remark
                                      }
                                      onClick={() =>
                                        handleFailQC(item.sn_number, validatedInputs[item.sn_number]?.remark || "")
                                      }
                                      style={
                                        validatedInputs[item.sn_number]?.isValid &&
                                        validatedInputs[item.sn_number]?.copiedSerial === item.sn_number &&
                                        validatedInputs[item.sn_number]?.remark
                                          ? styles.dangerButton
                                          : undefined
                                      }
                                    >
                                      <FaTimesCircle className="me-1" /> Fail
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </Card.Body>
                          </Card>
                        );
                      })}
                      {renderPagination(qcmKeys, qcmPage, setQcmPage)}
                    </>
                  )}
                </>
              )}

              {/* Transaction History Section */}
              {activeSection === "history" && (
                <>
                  <div className="d-flex align-items-center mb-4">
                    <FaHistory className="me-2" style={{ color: "#3498db" }} />
                    <h3 className="m-0">Transaction History</h3>
                  </div>
                  
                  <SearchInput
                    placeholder="Search by Document ID, ชื่อลูกค้า, or ชื่อประสานงานขาย..."
                    value={historySearchTerm}
                    onChange={(e) => {
                      setHistorySearchTerm(e.target.value);
                      setHistoryPage(1);
                    }}
                  />
                  
                  {loadingHistory ? (
                    <div className="text-center my-5">
                      <LoadingSpinner />
                    </div>
                  ) : historyKeys.length === 0 ? (
                    <Alert variant="info" style={{ borderRadius: "0.5rem" }}>
                      <div className="d-flex align-items-center">
                        <FaInfoCircle className="me-2" />
                        No transaction history found.
                      </div>
                    </Alert>
                  ) : (
                    <>
                      {paginateKeys(historyKeys, historyPage).map((documentId) => {
                        const transactions = groupedHistory[documentId];
                        const { name: displayName, department: displayDepartment } = splitNameAndDept(
                          transactions[0]?.name
                        );
                        const isHovered = hoveredCard === documentId;
                        
                        return (
                          <Card 
                            key={documentId} 
                            className="mb-4" 
                            style={{ 
                              ...styles.card,
                              ...(isHovered ? styles.cardHover : {}),
                              borderLeft: "4px solid #9b59b6" 
                            }}
                            onMouseEnter={() => setHoveredCard(documentId)}
                            onMouseLeave={() => setHoveredCard(null)}
                          >
                            <Card.Header style={styles.cardHeader}>
                              <span style={{ display: "flex", alignItems: "center" }}>
                                <FaFileAlt style={{ marginRight: "0.5rem", color: "#3498db" }} />
                                Document ID: {documentId}
                              </span>
                              <Badge bg="secondary" style={styles.badge}>
                                History
                              </Badge>
                            </Card.Header>
                            <Card.Body style={{ padding: "1.25rem" }}>
                              <Row>
                                <Col md={6}>
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaUser style={styles.dataIcon} /> ชื่อลูกค้า
                                    </div>
                                    <div style={styles.dataValue}>{transactions[0]?.customer_name || "N/A"}</div>
                                  </div>
                                  
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaUser style={styles.dataIcon} /> ชื่อประสานงานขาย
                                    </div>
                                    <div style={styles.dataValue}>{displayName}</div>
                                  </div>
                                  
                                  {displayDepartment && (
                                    <div style={styles.dataRow}>
                                      <div style={styles.dataLabel}>
                                        <FaBuilding style={styles.dataIcon} /> แผนกผู้แจ้ง
                                      </div>
                                      <div style={styles.dataValue}>{displayDepartment}</div>
                                    </div>
                                  )}
                                </Col>
                                
                                <Col md={6}>
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaFileAlt style={styles.dataIcon} /> รหัสสินค้า
                                    </div>
                                    <div style={styles.dataValue}>{transactions[0]?.product_id || "N/A"}</div>
                                  </div>
                                  
                                  <div style={styles.dataRow}>
                                    <div style={styles.dataLabel}>
                                      <FaMapMarkerAlt style={styles.dataIcon} /> ที่อยู่ลูกค้า
                                    </div>
                                    <div style={styles.dataValue}>{transactions[0]?.customer_address || "N/A"}</div>
                                  </div>
                                </Col>
                              </Row>
                              
                              <div className="mt-4">
                                <h6 className="mb-3">Serial Details</h6>
                                <Card style={{ ...styles.card, marginBottom: 0 }}>
                                  <Card.Header style={{ ...styles.cardHeader, backgroundColor: "#f8f9fa" }}>
                                    <span style={{ fontWeight: "600" }}>Transaction Records</span>
                                  </Card.Header>
                                  <Card.Body style={{ padding: 0 }}>
                                    <Table striped bordered hover size="sm" className="mb-0" style={styles.table}>
                                      <thead style={styles.tableHeader}>
                                        <tr>
                                          <th>Serial Number</th>
                                          <th>Description</th>
                                          <th>Status</th>
                                          <th>QCM Remarks</th>
                                          <th>Image</th>
                                          <th>Timestamp</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {transactions.map((transaction) => {
                                          const imgSrc =
                                            transaction.image && transaction.image.startsWith("http")
                                              ? transaction.image
                                              : transaction.image
                                              ? "data:image/jpeg;base64," + transaction.image
                                              : null;
                                          return (
                                            <tr key={transaction.sn_number}>
                                              <td>{transaction.sn_number}</td>
                                              <td>{transaction.description}</td>
                                              <td>
                                                <Badge 
                                                  bg={
                                                    transaction.status === "Pass QC" ? "success" :
                                                    transaction.status === "Fail QC" ? "danger" :
                                                    transaction.status === "At QCM" ? "info" : "secondary"
                                                  }
                                                  style={styles.badge}
                                                >
                                                  {transaction.status || "N/A"}
                                                </Badge>
                                              </td>
                                              <td>{transaction.QcmRemark || "N/A"}</td>
                                              <td className="text-center">
                                                {imgSrc ? (
                                                  <div 
                                                    style={{ 
                                                      cursor: "pointer",
                                                      display: "inline-block"
                                                    }}
                                                    onClick={() => openViewImageModal(imgSrc)}
                                                  >
                                                    <img
                                                      src={imgSrc}
                                                      alt="Serial"
                                                      style={{ 
                                                        height: "40px", 
                                                        borderRadius: "4px",
                                                        transition: "transform 0.2s"
                                                      }}
                                                      className="img-thumbnail"
                                                    />
                                                  </div>
                                                ) : (
                                                  <span className="text-muted">No Image</span>
                                                )}
                                              </td>
                                              <td>
                                                {new Date(transaction.timestamp).toLocaleDateString("en-GB", {
                                                  day: "2-digit",
                                                  month: "2-digit",
                                                  year: "numeric",
                                                })}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </Table>
                                  </Card.Body>
                                </Card>
                              </div>
                            </Card.Body>
                          </Card>
                        );
                      })}
                      {renderPagination(historyKeys, historyPage, setHistoryPage)}
                    </>
                  )}
                </>
              )}
            </Col>
          </Row>
        )}
        
        {/* -------------------- View Image Modal -------------------- */}
        <Modal 
          show={showViewImageModal} 
          onHide={closeViewImageModal} 
          centered
          size="lg"
        >
          <Modal.Header closeButton style={styles.modalHeader}>
            <Modal.Title style={{ color: "#2c3e50", fontWeight: "600" }}>
              <FaImage className="me-2" style={{ color: "#3498db" }} />
              View Image
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center" style={styles.modalBody}>
            {viewImageSrc && (
              <img 
                src={viewImageSrc} 
                alt="Full view" 
                style={{ 
                  maxWidth: "100%", 
                  maxHeight: "70vh",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                }} 
              />
            )}
          </Modal.Body>
          <Modal.Footer style={styles.modalFooter}>
            <Button 
              variant="secondary" 
              onClick={closeViewImageModal}
              style={styles.secondaryButton}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default QcmRequests;