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
  FaClipboard,
  FaCamera,
  FaUpload,
  FaListAlt,
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
  FaFileInvoice,
  FaTimesCircle
} from "react-icons/fa";
import "./midnight.css";
import loadingSvg from "./Loading.svg"; // Make sure this path is correct

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
const LoadingSpinner = React.memo(({ size = "60px" }) => (
  <div className="text-center my-4 d-flex justify-content-center align-items-center" style={{ height: size }}>
    <img src={loadingSvg} alt="Loading..." style={{ height: size, width: size }} />
  </div>
));

// Custom hook to debounce a value
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

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

// Helper function to group requests by document_id
const groupByDocumentId = (requestsArr) =>
  requestsArr.reduce((groups, request) => {
    const { document_id } = request;
    if (!groups[document_id]) groups[document_id] = [];
    groups[document_id].push(request);
    return groups;
  }, {});

// Helper function to split combined name into name and department
const splitNameAndDept = (combinedName) => {
  if (!combinedName) return { name: "N/A", department: "" };
  const regex = /(.*?)\s*แผนก\s*(.*)/;
  const match = combinedName.match(regex);
  if (match) {
    return { name: match[1].trim(), department: match[2].trim() };
  }
  return { name: combinedName, department: "" };
};

const InventoryPage = () => {
  // Data states
  const [requests, setRequests] = useState([]);
  const [inventoryRequests, setInventoryRequests] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [failedDocuments, setFailedDocuments] = useState([]);
  const [validatedInputs, setValidatedInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userName, setUserName] = useState("");
  const [department, setDepartment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  // Sidebar navigation state
  const [activeSection, setActiveSection] = useState("pending");

  // Pagination states
  const [pendingPage, setPendingPage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [failedPage, setFailedPage] = useState(1);
  const itemsPerPage = 5;

  // Search term states
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [failedSearchTerm, setFailedSearchTerm] = useState("");

  // Debounced search terms
  const debouncedPendingSearch = useDebounce(pendingSearchTerm, 300);
  const debouncedInventorySearch = useDebounce(inventorySearchTerm, 300);
  const debouncedHistorySearch = useDebounce(historySearchTerm, 300);
  const debouncedFailedSearch = useDebounce(failedSearchTerm, 300);

  // Expanded details state
  const [expandedCards, setExpandedCards] = useState({});

  // Image Upload & Preview States
  const [uploadedImages, setUploadedImages] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputCameraRef = useRef(null);
  const fileInputUploadRef = useRef(null);

  // For viewing images from history
  const [showViewImageModal, setShowViewImageModal] = useState(false);
  const [viewImageSrc, setViewImageSrc] = useState(null);

  const openImageModal = (sn_number) => {
    setSelectedSerial(sn_number);
    setShowImageModal(true);
    setSelectedFile(null);
    setImagePreview(null);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedSerial(null);
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleModalUpload = () => {
    if (selectedFile && selectedSerial) {
      setUploadedImages((prev) => ({
        ...prev,
        [selectedSerial]: { file: selectedFile, preview: imagePreview }
      }));
      closeImageModal();
    }
  };

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
    try {
      const response = await fetch("https://saleco.ruu-d.com/user-details", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!response.ok) throw new Error("Failed to fetch user details");
      const data = await response.json();
      setUserName(data.fullName);
      setDepartment(data.department || "N/A");
    } catch (error) {
      console.error("Error fetching user details:", error);
      setErrorMessage(error.message);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch("https://saleco.ruu-d.com/sale-co-requests");
      if (!response.ok) throw new Error("Failed to fetch requests");
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryRequests = async () => {
    try {
      const response = await fetch("https://saleco.ruu-d.com/inventory-status");
      if (!response.ok) throw new Error("Failed to fetch inventory requests");
      const data = await response.json();
      setInventoryRequests(data);
    } catch (error) {
      console.error("Error fetching inventory requests:", error);
      setErrorMessage(error.message);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch("https://saleco.ruu-d.com/inventory/history", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      setTransactionHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
      setErrorMessage(error.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchFailedDocuments = async () => {
    try {
      const response = await fetch("https://saleco.ruu-d.com/sale-co/failed-qc", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!response.ok) throw new Error("Failed to fetch failed QC documents");
      const data = await response.json();
      setFailedDocuments(data);
    } catch (error) {
      console.error("Error fetching failed QC documents:", error);
      setErrorMessage(error.message);
    }
  };

  // ------------------- Update Status Functions -------------------
  const updateStatus = async (id, status, isSerial = false) => {
    const endpoint = isSerial
      ? `https://saleco.ruu-d.com/sale-co-requests/${id}/serial-status`
      : `https://saleco.ruu-d.com/sale-co-requests/${id}/status`;
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, userName })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update status: ${errorText}`);
      }
      // Refresh data after update
      fetchRequests();
      fetchInventoryRequests();
    } catch (error) {
      console.error(`Error updating status to ${status}:`, error);
      setErrorMessage(error.message);
    }
  };

  const handleAccept = (documentId) => updateStatus(documentId, "At Inventory");
  const handleDecline = (documentId) => updateStatus(documentId, "Declined");

  // ------------------- Send Serial to QCM Function -------------------
  const handleSendSerialToQCM = async (serialNumber) => {
    try {
      if (uploadedImages[serialNumber]) {
        const formData = new FormData();
        formData.append("image", uploadedImages[serialNumber].file);
        formData.append("sn_number", serialNumber);
        const imageResponse = await fetch("https://saleco.ruu-d.com/upload-image", {
          method: "POST",
          body: formData
        });
        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          throw new Error(`Failed to upload image: ${errorText}`);
        }
        setUploadedImages((prev) => {
          const newState = { ...prev };
          delete newState[serialNumber];
          return newState;
        });
      }
      const encodedSerialNumber = encodeURIComponent(serialNumber);
      const response = await fetch(
        `https://saleco.ruu-d.com/qcm-in-requests/serial/${encodedSerialNumber}/accept`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName })
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send serial to QCM: ${errorText}`);
      }
      alert(`Serial number ${serialNumber} sent to QCM successfully!`);
      fetchInventoryRequests();
    } catch (error) {
      console.error("Error sending serial to QCM:", error.message);
      alert(`Error sending serial to QCM: ${error.message}`);
    }
  };

  // ------------------- Pagination Helpers -------------------
  const paginate = (items, pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const renderPagination = (items, pageNumber, setPage) => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
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
    pageNumbers.push(1);
    const delta = 1; // Number of pages to show before and after current page
    const left = Math.max(2, pageNumber - delta);
    const right = Math.min(totalPages - 1, pageNumber + delta);
    if (left > 2) {
      pageNumbers.push("ellipsis1");
    }
    for (let i = left; i <= right; i++) {
      pageNumbers.push(i);
    }
    if (right < totalPages - 1) {
      pageNumbers.push("ellipsis2");
    }
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
          {pageNumbers.map((page) => {
            if (page === "ellipsis1" || page === "ellipsis2") {
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
  const filteredPendingRequests = useMemo(
    () =>
      requests.filter(
        (req) =>
          debouncedPendingSearch === "" ||
          req.document_id.toString().toLowerCase().includes(debouncedPendingSearch.toLowerCase()) ||
          (req.customer_name && req.customer_name.toLowerCase().includes(debouncedPendingSearch.toLowerCase())) ||
          (req.name && req.name.toLowerCase().includes(debouncedPendingSearch.toLowerCase())) ||
          (req.sn_number && req.sn_number.toLowerCase().includes(debouncedPendingSearch.toLowerCase()))
      ),
    [requests, debouncedPendingSearch]
  );

  const filteredInventoryRequests = useMemo(
    () =>
      inventoryRequests.filter(
        (req) =>
          debouncedInventorySearch === "" ||
          req.document_id.toString().toLowerCase().includes(debouncedInventorySearch.toLowerCase()) ||
          (req.customer_name && req.customer_name.toLowerCase().includes(debouncedInventorySearch.toLowerCase())) ||
          (req.name && req.name.toLowerCase().includes(debouncedInventorySearch.toLowerCase())) ||
          (req.sn_number && req.sn_number.toLowerCase().includes(debouncedInventorySearch.toLowerCase()))
      ),
    [inventoryRequests, debouncedInventorySearch]
  );

  const filteredTransactionHistory = useMemo(
    () =>
      transactionHistory.filter(
        (req) =>
          debouncedHistorySearch === "" ||
          req.document_id.toString().toLowerCase().includes(debouncedHistorySearch.toLowerCase()) ||
          (req.customer_name && req.customer_name.toLowerCase().includes(debouncedHistorySearch.toLowerCase())) ||
          (req.name && req.name.toLowerCase().includes(debouncedHistorySearch.toLowerCase())) ||
          (req.sn_number && req.sn_number.toLowerCase().includes(debouncedHistorySearch.toLowerCase()))
      ),
    [transactionHistory, debouncedHistorySearch]
  );

  const filteredFailedDocuments = useMemo(
    () =>
      failedDocuments.filter(
        (doc) =>
          debouncedFailedSearch === "" ||
          doc.document_id.toString().toLowerCase().includes(debouncedFailedSearch.toLowerCase()) ||
          (doc.customer_name && doc.customer_name.toLowerCase().includes(debouncedFailedSearch.toLowerCase())) ||
          (doc.name && doc.name.toLowerCase().includes(debouncedFailedSearch.toLowerCase()))
      ),
    [failedDocuments, debouncedFailedSearch]
  );

  // ------------------- Initial Data Fetching -------------------
  useEffect(() => {
    fetchUserDetails();
    fetchRequests();
    fetchInventoryRequests();
  }, []);

  useEffect(() => {
    if (activeSection === "history") {
      fetchHistory();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "failed") {
      fetchFailedDocuments();
      setFailedPage(1);
    }
  }, [activeSection]);

  useEffect(() => setPendingPage(1), [debouncedPendingSearch]);
  useEffect(() => setInventoryPage(1), [debouncedInventorySearch]);
  useEffect(() => setHistoryPage(1), [debouncedHistorySearch]);
  useEffect(() => setFailedPage(1), [debouncedFailedSearch]);

  return (
    <div style={styles.pageContainer}>
      <Container>
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={styles.headerTitle}>Inventory Management</h2>
        </div>

        {errorMessage && (
          <Alert variant="danger" onClose={() => setErrorMessage("")} dismissible style={{ borderRadius: "0.5rem", marginBottom: "1.5rem" }}>
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
                    <div style={{ fontSize: "0.85rem", color: "#7f8c8d" }}>{department || "Department"}</div>
                  </div>
                </div>

                <div style={styles.infoBox} className="mb-4">
                  <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Navigation</div>
                  <div style={{ fontSize: "0.85rem" }}>
                    Use the menu below to navigate between different sections of the inventory management system.
                  </div>
                </div>

                <ListGroup>
                  <ListGroup.Item
                    action
                    active={activeSection === "pending"}
                    onClick={() => setActiveSection("pending")}
                    style={{
                      ...styles.navItem,
                      ...(activeSection === "pending" ? styles.navItemActive : {})
                    }}
                  >
                    <FaFileInvoice className="me-2" /> เอกสารจากผู้แจ้ง
                  </ListGroup.Item>

                  <ListGroup.Item
                    action
                    active={activeSection === "inventory"}
                    onClick={() => setActiveSection("inventory")}
                    style={{
                      ...styles.navItem,
                      ...(activeSection === "inventory" ? styles.navItemActive : {})
                    }}
                  >
                    <FaBoxOpen className="me-2" /> เอกสารที่คลัง
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

                  <ListGroup.Item
                    action
                    active={activeSection === "failed"}
                    onClick={() => setActiveSection("failed")}
                    style={{
                      ...styles.navItem,
                      ...(activeSection === "failed" ? styles.navItemActive : {})
                    }}
                  >
                    <FaTimesCircle className="me-2" /> Failed QC
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Col>

            {/* Main Content */}
            <Col md={9}>
              {/* Pending Requests Section */}
              {activeSection === "pending" && (
                <>
                  <div className="d-flex align-items-center mb-4">
                    <FaFileInvoice className="me-2" style={{ color: "#3498db" }} />
                    <h3 className="m-0">Pending Requests</h3>
                  </div>
                  <SearchInput
                    placeholder="Search by Document ID, ชื่อลูกค้า, or ชื่อประสานงานขาย..."
                    value={pendingSearchTerm}
                    onChange={(e) => setPendingSearchTerm(e.target.value)}
                  />
                  {Object.entries(groupByDocumentId(paginate(filteredPendingRequests, pendingPage))).length === 0 ? (
                    <Alert variant="info" style={{ borderRadius: "0.5rem" }}>
                      <div className="d-flex align-items-center">
                        <FaInfoCircle className="me-2" />
                        No pending requests at the moment.
                      </div>
                    </Alert>
                  ) : (
                    <>
                      {Object.entries(groupByDocumentId(paginate(filteredPendingRequests, pendingPage))).map(
                        ([documentId, items]) => {
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
                                  Pending
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
                                        <FaListAlt style={styles.dataIcon} /> จำนวน
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
                                  <Button variant="success" onClick={() => handleAccept(documentId)} style={styles.successButton}>
                                    <FaCheck className="me-1" /> Accept
                                  </Button>
                                  <Button variant="danger" onClick={() => handleDecline(documentId)} style={styles.dangerButton}>
                                    <FaTimes className="me-1" /> Decline
                                  </Button>
                                </div>
                                <div className="d-flex justify-content-between mt-3">
                                  <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() =>
                                      setExpandedCards((prev) => ({ ...prev, [documentId]: !prev[documentId] }))
                                    }
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
                        }
                      )}
                      {renderPagination(filteredPendingRequests, pendingPage, setPendingPage)}
                    </>
                  )}
                </>
              )}

              {/* At Inventory Section */}
              {activeSection === "inventory" && (
                <>
                  <div className="d-flex align-items-center mb-4">
                    <FaBoxOpen className="me-2" style={{ color: "#3498db" }} />
                    <h3 className="m-0">At Inventory</h3>
                  </div>
                  <SearchInput
                    placeholder="Search by Document ID, ชื่อลูกค้า, or ชื่อประสานงานขาย..."
                    value={inventorySearchTerm}
                    onChange={(e) => setInventorySearchTerm(e.target.value)}
                  />
                  {Object.entries(groupByDocumentId(paginate(filteredInventoryRequests, inventoryPage))).length === 0 ? (
                    <Alert variant="info" style={{ borderRadius: "0.5rem" }}>
                      <div className="d-flex align-items-center">
                        <FaInfoCircle className="me-2" />
                        No inventory requests at the moment.
                      </div>
                    </Alert>
                  ) : (
                    <>
                      {Object.entries(groupByDocumentId(paginate(filteredInventoryRequests, inventoryPage))).map(
                        ([documentId, items]) => {
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
                                <Badge bg="success" style={styles.badge}>
                                  In Inventory
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
                                      <div style={styles.dataValue}>{items[0]?.product_id || "N/A"}</div>
                                    </div>
                                    <div style={styles.dataRow}>
                                      <div style={styles.dataLabel}>
                                        <FaCalendarAlt style={styles.dataIcon} /> วันที่สร้างเอกสาร
                                      </div>
                                      <div style={styles.dataValue}>
                                        {new Date(items[0].timestamp).toLocaleDateString("en-GB")}
                                      </div>
                                    </div>
                                    <div style={styles.dataRow}>
                                      <div style={styles.dataLabel}>
                                        <FaMapMarkerAlt style={styles.dataIcon} /> ที่อยู่ลูกค้า
                                      </div>
                                      <div style={styles.dataValue}>{items[0]?.customer_address || "N/A"}</div>
                                    </div>
                                    <div style={styles.dataRow}>
                                      <div style={styles.dataLabel}>
                                        <FaListAlt style={styles.dataIcon} /> จำนวน
                                      </div>
                                      <div style={styles.dataValue}>
                                        {items.reduce((total, item) => total + (item.quantity || 0), 0)}
                                      </div>
                                    </div>
                                  </Col>
                                </Row>
                                <div className="mt-4">
                                  <h6 className="mb-3">Serial Numbers</h6>
                                  {items.map((item) => (
                                    <div key={item.sn_number} style={styles.serialItem}>
                                      <Row className="align-items-center">
                                        <Col xs={12} md={6}>
                                          <div style={{ fontWeight: "600", color: "#3498db" }}>
                                            Serial Number: {item.sn_number}
                                          </div>
                                          <div style={{ color: "#7f8c8d", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                                            {item.description}
                                          </div>
                                        </Col>
                                        <Col xs={12} md={6} className="mt-3 mt-md-0">
                                          <Row>
                                            <Col xs={8}>
                                              <Form.Control
                                                type="text"
                                                placeholder="Enter serial number"
                                                value={validatedInputs[item.sn_number] || ""}
                                                onChange={(e) =>
                                                  setValidatedInputs({ ...validatedInputs, [item.sn_number]: e.target.value })
                                                }
                                                style={styles.formControl}
                                              />
                                            </Col>
                                            <Col xs={4}>
                                              <OverlayTrigger placement="top" overlay={<Tooltip>Copy to input</Tooltip>}>
                                                <Button
                                                  variant="outline-primary"
                                                  size="sm"
                                                  style={styles.outlineButton}
                                                  onClick={() => {
                                                    navigator.clipboard.writeText(item.sn_number);
                                                    setValidatedInputs({ ...validatedInputs, [item.sn_number]: item.sn_number });
                                                  }}
                                                >
                                                  <FaClipboard />
                                                </Button>
                                              </OverlayTrigger>
                                            </Col>
                                          </Row>
                                        </Col>
                                      </Row>
                                      <div className="d-flex justify-content-between align-items-center mt-3">
                                        <Button
                                          variant="info"
                                          size="sm"
                                          onClick={() => openImageModal(item.sn_number)}
                                          style={styles.infoButton}
                                        >
                                          <FaCamera className="me-1" /> Add Picture
                                        </Button>
                                        <Button
                                          variant="primary"
                                          disabled={validatedInputs[item.sn_number] !== item.sn_number}
                                          onClick={() => handleSendSerialToQCM(item.sn_number)}
                                          style={validatedInputs[item.sn_number] === item.sn_number ? styles.primaryButton : undefined}
                                        >
                                          Send to QCM
                                        </Button>
                                      </div>
                                      {uploadedImages[item.sn_number] && (
                                        <div style={styles.imagePreviewContainer}>
                                          <img src={uploadedImages[item.sn_number].preview} alt="Uploaded" style={styles.imagePreview} />
                                          <span style={{ fontSize: "0.9rem" }}>Image Ready to Upload</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </Card.Body>
                            </Card>
                          );
                        }
                      )}
                      {renderPagination(filteredInventoryRequests, inventoryPage, setInventoryPage)}
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
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                  />
                  {loadingHistory ? (
                    <div className="text-center my-5">
                      <LoadingSpinner />
                    </div>
                  ) : filteredTransactionHistory.length === 0 ? (
                    <Alert variant="info" style={{ borderRadius: "0.5rem" }}>
                      <div className="d-flex align-items-center">
                        <FaInfoCircle className="me-2" />
                        No transaction history found.
                      </div>
                    </Alert>
                  ) : (
                    <>
                      {Object.entries(groupByDocumentId(paginate(filteredTransactionHistory, historyPage))).map(
                        ([documentId, transactions]) => {
                          const { name: displayName, department: displayDepartment } = splitNameAndDept(transactions[0]?.name);
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
                                        <FaMapMarkerAlt style={styles.dataIcon} /> ที่อยู่ลูกค้า
                                      </div>
                                      <div style={styles.dataValue}>{transactions[0]?.customer_address || "N/A"}</div>
                                    </div>
                                    <div style={styles.dataRow}>
                                      <div style={styles.dataLabel}>
                                        <FaFileAlt style={styles.dataIcon} /> รหัสสินค้า
                                      </div>
                                      <div style={styles.dataValue}>{transactions[0]?.product_id || "N/A"}</div>
                                    </div>
                                    <div style={styles.dataRow}>
                                      <div style={styles.dataLabel}>
                                        <FaListAlt style={styles.dataIcon} /> จำนวนสินค้า
                                      </div>
                                      <div style={styles.dataValue}>
                                        {transactions.reduce((total, item) => total + (item.quantity || 0), 0)}
                                      </div>
                                    </div>
                                  </Col>
                                </Row>
                                <div className="mt-4">
                                  <h6 className="mb-3">Serial Details</h6>
                                  <Card style={{ ...styles.card, marginBottom: 0 }}>
                                    <Card.Header style={{ ...styles.cardHeader, backgroundColor: "#f8f9fa" }}>
                                      <span style={{ fontWeight: "600" }}>Serial Number Records</span>
                                    </Card.Header>
                                    <Card.Body style={{ padding: 0 }}>
                                      <Table striped bordered hover size="sm" className="mb-0" style={styles.table}>
                                        <thead style={styles.tableHeader}>
                                          <tr>
                                            <th>Serial Number</th>
                                            <th>Description</th>
                                            <th>Status</th>
                                            <th>Image</th>
                                            <th>Timestamp</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {transactions.map((transaction) => {
                                            const imgSrc = transaction.image || null;
                                            return (
                                              <tr key={transaction.sn_number}>
                                                <td>{transaction.sn_number}</td>
                                                <td>{transaction.description}</td>
                                                <td>
                                                  <Badge
                                                    bg={
                                                      transaction.status === "Declined"
                                                        ? "danger"
                                                        : transaction.status === "At Inventory"
                                                        ? "success"
                                                        : "secondary"
                                                    }
                                                    style={styles.badge}
                                                  >
                                                    {transaction.status || "Pending"}
                                                  </Badge>
                                                </td>
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
                                                  {transaction.timestamp
                                                    ? new Date(transaction.timestamp).toLocaleString("en-GB")
                                                    : "N/A"}
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
                        }
                      )}
                      {renderPagination(filteredTransactionHistory, historyPage, setHistoryPage)}
                    </>
                  )}
                </>
              )}

              {/* Failed QC Section */}
              {activeSection === "failed" && (
                <>
                  <div className="d-flex align-items-center mb-4">
                    <FaTimesCircle className="me-2" style={{ color: "#e74c3c" }} />
                    <h3 className="m-0">Failed QC Documents</h3>
                  </div>
                  <SearchInput
                    placeholder="Search by Document ID, ชื่อลูกค้า, or ชื่อประสานงานขาย..."
                    value={failedSearchTerm}
                    onChange={(e) => setFailedSearchTerm(e.target.value)}
                  />
                  {Object.entries(groupByDocumentId(paginate(filteredFailedDocuments, failedPage))).length === 0 ? (
                    <Alert variant="info" style={{ borderRadius: "0.5rem" }}>
                      <div className="d-flex align-items-center">
                        <FaInfoCircle className="me-2" />
                        No failed QC documents found.
                      </div>
                    </Alert>
                  ) : (
                    <>
                      {Object.entries(groupByDocumentId(paginate(filteredFailedDocuments, failedPage))).map(
                        ([documentId, items]) => {
                          const { name: displayName, department: displayDepartment } = splitNameAndDept(items[0]?.name);
                          const isHovered = hoveredCard === documentId;
                          return (
                            <Card
                              key={documentId}
                              className="mb-4"
                              style={{
                                ...styles.card,
                                ...(isHovered ? styles.cardHover : {}),
                                borderLeft: "4px solid #e74c3c"
                              }}
                              onMouseEnter={() => setHoveredCard(documentId)}
                              onMouseLeave={() => setHoveredCard(null)}
                            >
                              <Card.Header style={styles.cardHeader}>
                                <span style={{ display: "flex", alignItems: "center" }}>
                                  <FaFileAlt style={{ marginRight: "0.5rem", color: "#e74c3c" }} />
                                  Document ID: {documentId}
                                </span>
                                <Badge bg="danger" style={styles.badge}>Failed QC</Badge>
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
                                        <FaCalendarAlt style={styles.dataIcon} /> วันที่สร้างเอกสาร
                                      </div>
                                      <div style={styles.dataValue}>{new Date(items[0].timestamp).toLocaleDateString("en-GB")}</div>
                                    </div>
                                  </Col>
                                </Row>
                                <div className="d-flex justify-content-between mt-3">
                                  <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => setExpandedCards((prev) => ({ ...prev, [documentId]: !prev[documentId] }))}
                                    style={{ color: "#e74c3c", textDecoration: "none" }}
                                  >
                                    {expandedCards[documentId] ? "See Less" : "See More"}
                                  </Button>
                                </div>
                                <Collapse in={expandedCards[documentId]}>
                                  <div id={`collapse-${documentId}`} className="mt-3">
                                    <Card style={{ ...styles.card, marginBottom: 0 }}>
                                      <Card.Header style={{ ...styles.cardHeader, backgroundColor: "#f8f9fa" }}>
                                        <span style={{ fontWeight: "600" }}>Document Details</span>
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
                        }
                      )}
                      {renderPagination(filteredFailedDocuments, failedPage, setFailedPage)}
                    </>
                  )}
                </>
              )}
            </Col>
          </Row>
        )}

        {/* -------------------- Image Upload Modal -------------------- */}
        <Modal show={showImageModal} onHide={closeImageModal} centered backdrop="static">
          <Modal.Header closeButton style={styles.modalHeader}>
            <Modal.Title style={{ color: "#2c3e50", fontWeight: "600" }}>
              <FaImage className="me-2" style={{ color: "#3498db" }} />
              Add Picture for Serial: {selectedSerial}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={styles.modalBody}>
            <div className="d-flex flex-column align-items-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={styles.modalImage} />
              ) : (
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "0.5rem",
                    padding: "2rem",
                    textAlign: "center",
                    width: "100%",
                    color: "#7f8c8d"
                  }}
                >
                  <FaImage size={48} style={{ color: "#cbd5e0", marginBottom: "1rem" }} />
                  <p className="mb-0">No image selected</p>
                </div>
              )}
              <div className="mt-4 d-flex gap-3">
                <Button variant="primary" onClick={() => fileInputCameraRef.current.click()} style={styles.primaryButton}>
                  <FaCamera className="me-2" /> Capture Image
                </Button>
                <Button variant="secondary" onClick={() => fileInputUploadRef.current.click()} style={styles.secondaryButton}>
                  <FaUpload className="me-2" /> Upload Image
                </Button>
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputCameraRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputUploadRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </Modal.Body>
          <Modal.Footer style={styles.modalFooter}>
            <Button variant="secondary" onClick={closeImageModal} style={styles.secondaryButton}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleModalUpload} disabled={!selectedFile} style={selectedFile ? styles.successButton : undefined}>
              {uploadLoading ? <LoadingSpinner size="24px" /> : "Upload"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* -------------------- View Image Modal (History) -------------------- */}
        <Modal show={showViewImageModal} onHide={closeViewImageModal} centered size="lg">
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
            <Button variant="secondary" onClick={closeViewImageModal} style={styles.secondaryButton}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default InventoryPage;
