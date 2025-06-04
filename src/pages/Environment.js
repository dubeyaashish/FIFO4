// Environment.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  InputGroup,
  Form,
  Alert,
  ListGroup,
  Badge,
  Modal
} from "react-bootstrap";
import {
  FaSearch,
  FaFileAlt,
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUser,
  FaInfoCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./midnight.css";
import loadingSvg from "./Loading.svg";

// -----------------------
// Styles (reuse your existing styles and add new ones)
// -----------------------
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
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    border: "none",
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    marginBottom: "1.5rem"
  },
  cardHover: {
    transform: "translateY(-3px)",
    boxShadow: "0 6px 12px rgba(0,0,0,0.15)"
  },
  cardHeader: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    padding: "1rem 1.25rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardHeaderIcon: { marginRight: "0.5rem", color: "#3498db" },
  primaryButton: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
    boxShadow: "0 2px 4px rgba(52,152,219,0.3)",
    transition: "all 0.2s"
  },
  // New action button style for Resolve
  resolveButton: {
    backgroundColor: "#007bff", // blue – adjust as needed
    borderColor: "#007bff",
    boxShadow: "0 2px 4px rgba(0,123,255,0.3)",
    transition: "all 0.2s"
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
    boxShadow: "0 2px 5px rgba(52,152,219,0.5)"
  },
  sidebar: {
    backgroundColor: "#ffffff",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.08)",
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
    backgroundColor: "rgba(52,152,219,0.1)",
    padding: "1rem",
    borderRadius: "0 0.5rem 0.5rem 0",
    marginBottom: "1rem"
  },
  paginationContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "1.5rem"
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
  }
};

const pageSize = 25;

// -----------------------
// Helper Components & Hooks
// -----------------------
const LoadingSpinner = React.memo(({ size = "60px" }) => (
  <div className="text-center my-4 d-flex justify-content-center align-items-center" style={{ height: size }}>
    <img src={loadingSvg} alt="Loading..." style={{ height: size, width: size }} />
  </div>
));

const SearchInput = React.memo(({ placeholder, value, onChange }) => (
  <InputGroup className="mb-3">
    <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}>
      <FaSearch style={{ color: "#3498db" }} />
    </InputGroup.Text>
    <Form.Control
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        border: "1px solid #e9ecef",
        boxShadow: "none",
        padding: "0.6rem 1rem",
        fontSize: "0.95rem"
      }}
    />
  </InputGroup>
));

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// -----------------------
// Environment Component
// -----------------------
const Environment = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [department, setDepartment] = useState("");
  const [envRecords, setEnvRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

  // For the Resolve action modal:
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionMemo, setActionMemo] = useState("");
  const [selectedSerial, setSelectedSerial] = useState("");

  // ---------- Fetch User Details ----------
  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await fetch("https://saleco.ruu-d.com/user-details", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!response.ok) throw new Error("Failed to fetch user details");
      const data = await response.json();
      setUserName(data.fullName);
      setDepartment(data.department);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, []);

  // ---------- Fetch Environment Records from the Environment Documents Endpoint ----------
  const fetchEnvRecords = useCallback(async (currentPage = 1) => {
    try {
      setLoadingRecords(true);
      const params = new URLSearchParams();
      if (debouncedSearchTerm.trim()) {
        params.append("search", debouncedSearchTerm.trim());
      }
      // The backend endpoint for environment documents
      const url = `https://saleco.ruu-d.com/environment/documents${params.toString() ? "?" + params.toString() : ""}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!response.ok) throw new Error("Failed to fetch Environment documents");
      const data = await response.json();
      setEnvRecords(data);
      setTotalItems(data.length);
      setPage(currentPage);
    } catch (error) {
      console.error("Error fetching Environment records:", error);
      alert("Failed to fetch Environment records.");
    } finally {
      setLoadingRecords(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchUserDetails();
    fetchEnvRecords(1);
  }, [fetchUserDetails, fetchEnvRecords]);

  // ---------- Group & Slice for Pagination ----------
  const groupAndSlice = useCallback((data) => {
    const sliced = data.slice((page - 1) * pageSize, page * pageSize);
    const groups = sliced.reduce((acc, item) => {
      const docId = item.document_id;
      if (!acc[docId]) acc[docId] = [];
      acc[docId].push(item);
      return acc;
    }, {});
    return Object.entries(groups);
  }, [page]);

  // ---------- Function to open the Action Modal for Resolve ----------
  const openActionModal = (records) => {
    setSelectedSerial(records[0].sn_number);
    setActionMemo(""); // Reset memo
    setActionModalVisible(true);
  };

  // ---------- Function to handle Action Modal submission (Resolve) ----------
  const handleActionSubmit = async () => {
    try {
      const response = await fetch("https://saleco.ruu-d.com/environment/status-with-memo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          sn_number: selectedSerial,
          status: "Resolved", // For environment records, we update the status to "Resolved"
          memo: actionMemo
        })
      });
      const data = await response.json();
      if (!response.ok) {
        alert("Update failed: " + data.error);
      } else {
        alert(`Serial ${selectedSerial} updated to Resolved`);
        setActionModalVisible(false);
        fetchEnvRecords(page);
      }
    } catch (error) {
      console.error("Error updating action:", error);
      alert("Error sending request.");
    }
  };

  // ---------- Render a Document Card for Environment Documents ----------
  const renderDocGroup = (documentId, records) => {
    const {
      name,
      product_id,
      timestamp,
      status,
      created_from,
      departmentExpense,
      "รายละเอียดการแจ้งงาน": requestDetails,
      QcmRemark,
      QcmName,
      product_type,
      lot_no,
      pack_size,
      found_issue,
      defect_reporter,
      inventory_source,
      issue_details,
      preventive_actions,
      image,
      action_memo
    } = records[0];

    const formattedDate = new Date(timestamp).toLocaleDateString("en-GB");
    const serialNumbers = records.map(record => record.sn_number).slice(0, 3).join(", ");
    const isExpanded = expandedCards[documentId];

    return (
      <Card
        key={documentId}
        className="mb-3"
        style={{
          ...styles.card,
          ...(hoveredCard === documentId ? styles.cardHover : {}),
          borderLeft: "4px solid #3498db"
        }}
        onMouseEnter={() => setHoveredCard(documentId)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <Card.Header style={styles.cardHeader}>
          <span style={{ display: "flex", alignItems: "center" }}>
            <FaFileAlt style={{ marginRight: "0.5rem" }} /> Document ID: {documentId}
          </span>
          <Badge bg={status === "At Store NC" ? "success" : "danger"} style={styles.badge}>
            {status}
          </Badge>
        </Card.Header>
        <Card.Body style={{ backgroundColor: "#fff", padding: "1.25rem" }}>
          <Row>
            <Col md={6}>
              <p><strong>Sale Coordinator:</strong> {name || "Unknown"}</p>
              <p><strong>Created From:</strong> {created_from || "N/A"}</p>
              <p><strong>Dept Expense:</strong> {departmentExpense || "N/A"}</p>
              <p><strong>Request Details:</strong> {requestDetails || "N/A"}</p>
              <p><strong>QCM Remark:</strong> {QcmRemark || "N/A"}</p>
              <p><strong>QCM Name:</strong> {QcmName || "N/A"}</p>
              <p><strong>Product Type:</strong> {product_type || "N/A"}</p>
              <p><strong>Lot No.:</strong> {lot_no || "N/A"}</p>
              <p><strong>Action Memo:</strong> {action_memo || "N/A"}</p>
            </Col>
            <Col md={6}>
              <p><strong>Product Code:</strong> {product_id || "N/A"}</p>
              <p><strong>Created Date:</strong> {formattedDate}</p>
              <p>
                <strong>Serial Numbers:</strong> {serialNumbers}{records.length > 3 && "…"}
              </p>
              <p><strong>Pack Size:</strong> {pack_size || "N/A"}</p>
              <p><strong>Found Issue:</strong> {found_issue || "N/A"}</p>
              <p><strong>Defect Reporter:</strong> {defect_reporter || "N/A"}</p>
              <p><strong>Inventory Source:</strong> {inventory_source || "N/A"}</p>
              <p><strong>Issue Details:</strong> {issue_details || "N/A"}</p>
              <p><strong>Preventive Actions:</strong> {preventive_actions || "N/A"}</p>
            </Col>
          </Row>

          {/* Action Button – Only one "Resolve" for Environment */}
          <Row className="mt-3">
            <Col>
              <Button variant="primary" style={styles.resolveButton} onClick={() => openActionModal(records)}>
                Resolve
              </Button>
            </Col>
          </Row>

          {/* Toggle for Pictures */}
          <div className="mt-3">
            <Button variant="link" onClick={() => setExpandedCards(prev => ({ ...prev, [documentId]: !prev[documentId] }))} style={{ color: "#3498db", textDecoration: "none" }}>
              {isExpanded ? "Hide Pictures" : "See Pictures"}
            </Button>
          </div>
          {isExpanded && (
            <Row className="mt-3">
              {image && (
                <Col md={4}>
                  <img src={image} alt="Default" style={{ width: "100%", maxHeight: "150px", objectFit: "contain" }} />
                </Col>
              )}
              {records[0].nc_image1 && (
                <Col md={4}>
                  <img src={records[0].nc_image1} alt="NC Image 1" style={{ width: "100%", maxHeight: "150px", objectFit: "contain" }} />
                </Col>
              )}
              {records[0].nc_image2 && (
                <Col md={4}>
                  <img src={records[0].nc_image2} alt="NC Image 2" style={{ width: "100%", maxHeight: "150px", objectFit: "contain" }} />
                </Col>
              )}
            </Row>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <div style={styles.pageContainer}>
      <Container className="py-4">
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={styles.headerTitle}>Environment</h2>
        </div>
        <Row>
          <Col md={3}>
            <div style={styles.sidebar}>
              <ListGroup>
                <ListGroup.Item action active style={styles.navItem}>
                  เอกสาร
                </ListGroup.Item>
              </ListGroup>
            </div>
          </Col>
          <Col md={9}>
            <Card style={styles.card}>
              <Card.Header style={styles.cardHeader}>
                <span style={{ display: "flex", alignItems: "center" }}>
                  <FaSearch style={styles.cardHeaderIcon} /> Search Documents
                </span>
              </Card.Header>
              <Card.Body>
                <SearchInput
                  placeholder="Search by Document ID, Coordinator, Serial..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                    fetchEnvRecords(1);
                  }}
                />
              </Card.Body>
            </Card>
            {loadingRecords ? (
              <LoadingSpinner />
            ) : envRecords.length === 0 ? (
              <Alert variant="info" style={{ borderRadius: "0.5rem" }}>
                <div className="d-flex align-items-center">
                  <FaInfoCircle className="me-2" /> No documents found.
                </div>
              </Alert>
            ) : (
              <>
                {groupAndSlice(envRecords).map(([documentId, records]) =>
                  renderDocGroup(documentId, records)
                )}
                <div style={styles.paginationContainer}>
                  <Button
                    variant="outline-primary"
                    disabled={page === 1}
                    onClick={() => {
                      const newPage = page - 1;
                      setPage(newPage);
                      fetchEnvRecords(newPage);
                    }}
                    style={styles.paginationButton}
                  >
                    <FaArrowLeft className="me-1" /> Previous
                  </Button>
                  <span>
                    Page {page} of {Math.max(1, Math.ceil(totalItems / pageSize))}
                  </span>
                  <Button
                    variant="outline-primary"
                    disabled={page >= Math.ceil(totalItems / pageSize)}
                    onClick={() => {
                      const newPage = page + 1;
                      setPage(newPage);
                      fetchEnvRecords(newPage);
                    }}
                    style={styles.paginationButton}
                  >
                    Next <FaArrowRight className="ms-1" />
                  </Button>
                </div>
              </>
            )}
          </Col>
        </Row>
      </Container>

      {/* Action Modal for Resolve */}
      <Modal show={actionModalVisible} onHide={() => setActionModalVisible(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#f8f9fa", border: "none" }}>
          <Modal.Title style={{ color: "#2c3e50", fontWeight: "600" }}>Resolve Record</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.5rem" }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Enter Memo</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Write your memo here..."
                value={actionMemo}
                onChange={e => setActionMemo(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ border: "none", padding: "0.75rem 1.5rem 1.5rem" }}>
          <Button variant="secondary" onClick={() => setActionModalVisible(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleActionSubmit}>
            Submit Resolve
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Environment;
