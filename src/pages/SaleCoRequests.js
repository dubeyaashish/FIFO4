import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Alert,
  ListGroup,
  Badge,
} from "react-bootstrap";
import {
  FaSearch,
  FaEdit,
  FaShoppingBasket,
  FaHistory,
  FaTimesCircle,
  FaPlus,
  FaFileAlt,
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUser,
  FaBuilding,
  FaInfoCircle,
  FaTrashAlt,
} from "react-icons/fa";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import "./midnight.css";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import loadingSvg from "./Loading.svg";

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
    overflow: "hidden",
  },
  headerTitle: {
    color: "#2c3e50",
    fontWeight: "bold",
    borderBottom: "2px solid #3498db",
    paddingBottom: "0.75rem",
    marginBottom: "0.5rem",
    fontSize: "2rem",
  },
  card: {
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "none",
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    marginBottom: "1.5rem",
  },
  cardHover: {
    transform: "translateY(-3px)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
  },
  cardHeader: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
    padding: "1rem 1.25rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderIcon: {
    marginRight: "0.5rem",
    color: "#3498db",
  },
  primaryButton: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
    boxShadow: "0 2px 4px rgba(52, 152, 219, 0.3)",
    transition: "all 0.2s",
  },
  secondaryButton: {
    backgroundColor: "#95a5a6",
    borderColor: "#95a5a6",
    boxShadow: "0 2px 4px rgba(149, 165, 166, 0.3)",
    transition: "all 0.2s",
  },
  dangerButton: {
    backgroundColor: "#e74c3c",
    borderColor: "#e74c3c",
    boxShadow: "0 2px 4px rgba(231, 76, 60, 0.3)",
    transition: "all 0.2s",
  },
  successButton: {
    backgroundColor: "#2ecc71",
    borderColor: "#2ecc71",
    boxShadow: "0 2px 4px rgba(46, 204, 113, 0.3)",
    transition: "all 0.2s",
  },
  buttonHover: {
    transform: "translateY(-1px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
  },
  table: {
    boxShadow: "0 2px 3px rgba(0, 0, 0, 0.05)",
    borderRadius: "0.5rem",
    overflow: "hidden",
  },
  navItem: {
    margin: "0.25rem 0",
    borderRadius: "0.5rem",
    fontWeight: "500",
    transition: "all 0.3s",
  },
  navItemActive: {
    backgroundColor: "#3498db !important",
    color: "white !important",
    boxShadow: "0 2px 5px rgba(52, 152, 219, 0.5)",
  },
  sidebar: {
    backgroundColor: "#ffffff",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)",
    position: "sticky",
    top: "1rem",
  },
  badge: {
    padding: "0.5em 0.75em",
    borderRadius: "30px",
    fontWeight: "normal",
    fontSize: "0.75rem",
  },
  infoBox: {
    borderLeft: "4px solid #3498db",
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    padding: "1rem",
    borderRadius: "0 0.5rem 0.5rem 0",
    marginBottom: "1rem",
  },
  paginationContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "1.5rem",
  },
  paginationButton: {
    display: "flex",
    alignItems: "center",
    padding: "0.4rem 0.8rem",
  },
  tableHeader: {
    backgroundColor: "#f8f9fa",
    color: "#2c3e50",
    fontWeight: "600",
  },
  searchContainer: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)",
    marginBottom: "1rem",
  },
  dataRow: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  dataLabel: {
    fontWeight: "600",
    color: "#7f8c8d",
    fontSize: "0.875rem",
    marginBottom: "0.25rem",
    display: "flex",
    alignItems: "center",
  },
  dataIcon: {
    marginRight: "0.5rem",
    color: "#3498db",
  },
  dataValue: {
    color: "#2c3e50",
    fontSize: "1rem",
  },
};

const pageSize = 25;

const LoadingSpinner = React.memo(({ size = "60px" }) => (
  <div
    className="text-center my-4 d-flex justify-content-center align-items-center"
    style={{ height: size }}
  >
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
        fontSize: "0.95rem",
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

const groupByDocumentId = (documents) =>
  documents.reduce((groups, item) => {
    if (!groups[item.document_id]) {
      groups[item.document_id] = [];
    }
    groups[item.document_id].push(item);
    return groups;
  }, {});

const getFirstNonEmptyValue = (field, items) => {
  for (let item of items) {
    if (item[field] && item[field].toString().trim() !== "") {
      return item[field].toString().trim();
    }
  }
  return "";
};

const getFirstValue = (field, items) =>
  items[0] && items[0][field] ? items[0][field].toString().trim() : "";

const formatDateField = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB");
};

const cleanString = (str) => (str ? str.toString().trim() : "");

const extractDepartment = (salecoName) => {
  if (!salecoName) return { nameWithoutDepartment: "N/A", departmentName: "N/A" };
  const keyword = "แผนก";
  const idx = salecoName.indexOf(keyword);
  if (idx !== -1) {
    const departmentName = salecoName.substring(idx + keyword.length).trim();
    const nameWithoutDepartment = salecoName.substring(0, idx).trim();
    const cleanDept = departmentName.replace(/[^a-zA-Z0-9ก-๙\s]/g, "").trim();
    return { nameWithoutDepartment, departmentName: cleanDept || "N/A" };
  }
  return { nameWithoutDepartment: salecoName, departmentName: "N/A" };
};

const SaleCoRequests = () => {
  const navigate = useNavigate();

  // Basic States
  const [searchParams, setSearchParams] = useState({ itemCode: "", serial: "" });
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [userName, setUserName] = useState("");
  const [department, setDepartment] = useState("");
  const [basket, setBasket] = useState([]);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeSection, setActiveSection] = useState("requests");
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [failedDocuments, setFailedDocuments] = useState([]);
  const [failedPage, setFailedPage] = useState(1);
  // New states for external requests
  const [externalRequests, setExternalRequests] = useState([]);
  const [loadingExternalRequests, setLoadingExternalRequests] = useState(false);
  const [selectedExternalRequest, setSelectedExternalRequest] = useState(null);
  const [externalSearchTerm, setExternalSearchTerm] = useState("");
  const [externalPage, setExternalPage] = useState(1);
  // Store NC modal states
  const [storeNCModalVisible, setStoreNCModalVisible] = useState(false);
  const [selectedStoreNCData, setSelectedStoreNCData] = useState(null);
  const [ncFormData, setNcFormData] = useState({
    productType: "",
    lotNo: "",
    packSize: "",
    foundIssue: "",
    defectReporter: "",
    inventorySource: "",
    issueDetails: "",
    preventiveActions: "",
    ncImage1: null,
    ncImage2: null,
  });
  // Form Data State
  const [formData, setFormData] = useState({
    customerName: "",
    customerAddress: "",
    remark: "",
    wantDate: "",
    requestDetails: [],
    departmentExpense: "",
  });
  // Department options state
  const [departmentOptions, setDepartmentOptions] = useState([]);

  // Custom Select Styles
  const selectStyles = {
    control: (base) => ({
      ...base,
      border: "1px solid #e9ecef",
      boxShadow: "none",
      "&:hover": { border: "1px solid #ced4da" },
      borderRadius: "0.375rem",
      padding: "0.1rem",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3498db"
        : state.isFocused
        ? "rgba(52, 152, 219, 0.1)"
        : null,
      "&:active": { backgroundColor: "rgba(52, 152, 219, 0.2)" },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "rgba(52, 152, 219, 0.1)",
      borderRadius: "4px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#2c3e50",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#7f8c8d",
      "&:hover": { backgroundColor: "rgba(231, 76, 60, 0.2)", color: "#e74c3c" },
    }),
  };

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://saleco.ruu-d.com/departments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch departments");
        const data = await response.json();
        const options = data.map((dept) => ({ value: dept, label: dept }));
        setDepartmentOptions(options);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  // Debounced search terms
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [cancelledSearchTerm, setCancelledSearchTerm] = useState("");
  const [failedSearchTerm, setFailedSearchTerm] = useState("");
  const debouncedHistorySearch = useDebounce(historySearchTerm, 300);
  const debouncedCancelledSearch = useDebounce(cancelledSearchTerm, 300);
  const debouncedFailedSearch = useDebounce(failedSearchTerm, 300);
  const debouncedExternalSearch = useDebounce(externalSearchTerm, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedHistorySearch, debouncedCancelledSearch]);

  // Fetch external requests
  const fetchExternalRequests = useCallback(async () => {
    try {
      setLoadingExternalRequests(true);
      const token = localStorage.getItem("token");
      const response = await fetch("https://saleco.ruu-d.com/sale-co/external-requests", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch external requests: ${response.status} - ${errorText}`);
      }
      const rawData = await response.json();
      const data = Array.isArray(rawData) ? rawData : rawData.data || [];
      const normalizedData = data.map((req) => ({
        documentId: req.document_id || req.documentId || req.id,
        customerName: req.customer_name || req.customerName,
        customerAddress: req.customer_address || req.customerAddress,
        createdAt: req.created_at || req.createdAt,
        wantDate: req.want_date || req.wantDate,
        remark: req.remark || "",
        requestDetails: req.request_details || req.requestDetails || "",
        status: req.status,
        productCode: req.product_id || req.productCode, // ADD THIS
        quantity: req.quantity, // ADD THIS
      }));
      setExternalRequests(normalizedData);
    } catch (error) {
      console.error("Fetch error:", error);
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        alert("CORS error: The server may be blocking the request. Check server CORS configuration or console for details.");
      } else {
        alert(`Failed to fetch external requests: ${error.message}`);
      }
    } finally {
      setLoadingExternalRequests(false);
    }
  }, []);

  const fetchProductsForExternalRequest = useCallback(
  async (productCode, currentPage = 1) => {
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.append("search_item_code", productCode);
      // Add serial search if user entered one
      if (searchParams.serial.trim()) {
        params.append("search_serial", searchParams.serial.trim());
      }
      const url = `https://saleco.ruu-d.com/products?${params}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      const allProducts = data.remainingSerialsDetails || [];
      // Filter only available products for external requests
      const availableProducts = allProducts.filter(product => product.status === "Available");
      setProducts(availableProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize));
      setTotalItems(availableProducts.length);
      setPage(currentPage);
    } catch (error) {
      console.error("Error fetching products for external request:", error);
      alert("Failed to fetch products. Please try again.");
    } finally {
      setLoadingProducts(false);
    }
  },
  [searchParams.serial]
);

  // Fetch user details
  const fetchUserDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://saleco.ruu-d.com/user-details", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user details");
      const data = await response.json();
      setUserName(data.fullName);
      setDepartment(data.department);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(
    async (currentPage = 1) => {
      try {
        setLoadingProducts(true);
        const token = localStorage.getItem("token");
        const params = new URLSearchParams();
        if (searchParams.itemCode.trim()) {
          params.append("search_item_code", searchParams.itemCode.trim());
        }
        if (searchParams.serial.trim()) {
          params.append("search_serial", searchParams.serial.trim());
        }
        const url = `https://saleco.ruu-d.com/products${params.toString() ? `?${params}` : ""}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        const allProducts = data.remainingSerialsDetails || [];
        setProducts(allProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize));
        setTotalItems(allProducts.length);
        setPage(currentPage);
      } catch (error) {
        console.error("Error fetching products:", error);
        alert("Failed to fetch products. Please try again.");
      } finally {
        setLoadingProducts(false);
      }
    },
    [searchParams]
  );

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem("token");
      const response = await fetch("https://saleco.ruu-d.com/sale-co/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch transaction history");
      const data = await response.json();
      setTransactionHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
      alert("Failed to fetch transaction history.");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Fetch failed documents
  const fetchFailedDocuments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://saleco.ruu-d.com/sale-co/failed-qc", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch failed QC documents");
      const data = await response.json();
      setFailedDocuments(data);
    } catch (error) {
      console.error("Error fetching failed QC documents:", error);
    }
  }, []);

  const handleAddToBasket = useCallback(() => {
    if (!selectedProduct || !selectedProduct.transactions?.[0]) {
      alert("Invalid product data. Cannot add to basket.");
      return;
    }
    const quantity = parseInt(document.getElementById("product-quantity").value, 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please select a valid quantity.");
      return;
    }
    const existingItem = basket.find((item) => item.serial === selectedProduct.serial);
    if (existingItem) {
      existingItem.quantity += quantity;
      setBasket([...basket]);
    } else {
      const description = selectedProduct.transactions[0]["ชื่อสินค้า"] || "No Description";
      setBasket([...basket, { ...selectedProduct, quantity, description }]);
    }
    setSelectedProduct(null);
    setShowQuantityModal(false);
  }, [basket, selectedProduct]);

  const handleRemoveFromBasket = useCallback(
    (serial) => setBasket(basket.filter((item) => item.serial !== serial)),
    [basket]
  );

const handleSearch = useCallback(() => {
  if (selectedExternalRequest && selectedExternalRequest.productCode) {
    // For external requests, search within the specific product code
    fetchProductsForExternalRequest(selectedExternalRequest.productCode, 1);
  } else {
    // For regular requests, use normal search
    fetchProducts(1);
  }
}, [fetchProducts, fetchProductsForExternalRequest, selectedExternalRequest]);

const handleReset = useCallback(() => {
  if (selectedExternalRequest && selectedExternalRequest.productCode) {
    // For external requests, reset but keep the product code filter
    setSearchParams({ itemCode: selectedExternalRequest.productCode, serial: "" });
    fetchProductsForExternalRequest(selectedExternalRequest.productCode, 1);
  } else {
    // For regular requests, reset completely
    setSearchParams({ itemCode: "", serial: "" });
    fetchProducts(1);
  }
}, [fetchProducts, fetchProductsForExternalRequest, selectedExternalRequest]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= Math.ceil(totalItems / pageSize)) {
        fetchProducts(newPage);
      }
    },
    [totalItems, fetchProducts]
  );

  const handleCancelDocument = useCallback(
    async (documentId) => {
      if (window.confirm("Are you sure you want to cancel this document?")) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`https://saleco.ruu-d.com/sale-co-requests/${documentId}/recall`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "Available", note: "Cancelled" }),
          });
          if (!response.ok) throw new Error("Failed to cancel the document");
          alert("Document cancelled successfully.");
          fetchHistory();
        } catch (error) {
          console.error("Error cancelling document:", error);
          alert("Failed to cancel document. Please try again.");
        }
      }
    },
    [fetchHistory]
  );

  const handleOpenStoreNCModal = useCallback((serialData) => {
    setSelectedStoreNCData(serialData);
    setNcFormData({
      productType: "",
      lotNo: "",
      packSize: "",
      foundIssue: "",
      defectReporter: "",
      inventorySource: "",
      issueDetails: "",
      preventiveActions: "",
      ncImage1: null,
      ncImage2: null,
    });
    setStoreNCModalVisible(true);
  }, []);

  const handleStoreNCSubmit = useCallback(async () => {
    if (!selectedStoreNCData) return;
    const sn_number = selectedStoreNCData.sn_number;

    try {
      const token = localStorage.getItem("token");
      const payload = {
        sn_number,
        userName,
        productType: ncFormData.productType,
        lotNo: ncFormData.lotNo,
        packSize: ncFormData.packSize,
        foundIssue: ncFormData.foundIssue,
        defectReporter: ncFormData.defectReporter,
        inventorySource: ncFormData.inventorySource,
        issueDetails: ncFormData.issueDetails,
        preventiveActions: ncFormData.preventiveActions,
        ncImage1: "",
        ncImage2: "",
      };

      const storeNCResponse = await fetch("https://saleco.ruu-d.com/sale-co/store-nc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const storeNCData = await storeNCResponse.json();

      if (!storeNCResponse.ok) {
        alert("Failed to create NC record: " + storeNCData.error);
        return;
      }

      const newDocumentId = storeNCData.newDocumentId;

      let ncImage1Url = "";
      let ncImage2Url = "";

      if (ncFormData.ncImage1) {
        const formDataImg1 = new FormData();
        formDataImg1.append("image", ncFormData.ncImage1);
        formDataImg1.append("sn_number", sn_number);
        formDataImg1.append("type", "nc1");

        const uploadRes1 = await fetch("https://saleco.ruu-d.com/upload-image", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataImg1,
        });
        const uploadData1 = await uploadRes1.json();
        if (uploadRes1.ok) {
          ncImage1Url = uploadData1.imageUrl || "";
        }
      }

      if (ncFormData.ncImage2) {
        const formDataImg2 = new FormData();
        formDataImg2.append("image", ncFormData.ncImage2);
        formDataImg2.append("sn_number", sn_number);
        formDataImg2.append("type", "nc2");

        const uploadRes2 = await fetch("https://saleco.ruu-d.com/upload-image", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataImg2,
        });
        const uploadData2 = await uploadRes2.json();
        if (uploadRes2.ok) {
          ncImage2Url = uploadData2.imageUrl || "";
        }
      }

      const statusResponse = await fetch("https://saleco.ruu-d.com/sale-co/store-nc/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sn_number, status: "At Store NC" }),
      });
      const statusData = await statusResponse.json();
      if (!statusResponse.ok) {
        alert("Failed to update NC status: " + statusData.error);
        return;
      }

      alert("Records successfully copied into NC table.\nNew Document ID: " + newDocumentId);
      setStoreNCModalVisible(false);
      setSelectedStoreNCData(null);
    } catch (err) {
      console.error("Error in handleStoreNCSubmit:", err);
      alert("Error submitting NC request.");
    }
  }, [ncFormData, selectedStoreNCData, userName]);

  // Options for request details
  const requestDetailsOptions = [
    { value: "ทดสอบเครื่องล้างภาชนะใหม่", label: "ทดสอบเครื่องล้างภาชนะใหม่" },
    { value: "ทดสอบเครื่องล้างภาชนะเก่า", label: "ทดสอบเครื่องล้างภาชนะเก่า" },
    {
      value: "ปรับปรุงเครื่องล้างภาชนะเก่า Repair & Modify",
      label: "ปรับปรุงเครื่องล้างภาชนะเก่า Repair & Modify",
    },
    { value: "ตรวจสอบอุปกรณ์แถมภายในเครื่อง", label: "ตรวจสอบอุปกรณ์แถมภายในเครื่อง" },
    { value: "ทดสอบเครื่องทำความสะอาดด้านพื้น", label: "ทดสอบเครื่องทำความสะอาดด้านพื้น" },
    { value: "ทดลองใช้งานโมบาย", label: "ทดลองใช้งานโมบาย" },
    { value: "ทดสอบเครื่องจักรอุปกรณ์", label: "ทดสอบเครื่องจักรอุปกรณ์" },
  ];

  // PDF Generation Logic
  const generatePdf = useCallback(async (documentId) => {
    try {
      if (!documentId) {
        console.error("No documentId provided!");
        return "";
      }
      const token = localStorage.getItem("token");
      const allocatedResponse = await fetch(`https://saleco.ruu-d.com/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!allocatedResponse.ok)
        throw new Error(`Failed to fetch allocated items. Status: ${allocatedResponse.status}`);
      const allocatedItems = await allocatedResponse.json();

      const templateUrl = `/sid/template.pdf?nocache=${Date.now()}`;
      const templateBytes = await fetch(templateUrl).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(templateBytes);
      pdfDoc.registerFontkit(fontkit);

      const fontUrl = `/sid/NotoSansThai-Regular.ttf?nocache=${Date.now()}`;
      const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
      const thaiFont = await pdfDoc.embedFont(fontBytes, { subset: true });

      const form = pdfDoc.getForm();

      const fieldMapping = {
        want_date: "wantdate",
        customer_name: "customername",
        name: "saleco",
        timestamp: "created_at",
      };
      const DEFAULT_FONT_SIZE = 10;
      const safeSetText = (fieldName, value, fontSize = DEFAULT_FONT_SIZE) => {
        if (fieldName === "address") {
          const maxLen = 30;
          let part1 = value;
          let part2 = "";
          if (value.length > maxLen) {
            let idx = value.lastIndexOf(" ", maxLen);
            if (idx === -1) idx = maxLen;
            part1 = value.substring(0, idx);
            part2 = value.substring(idx).trim();
          }
          try {
            const addressField1 = form.getTextField("address1");
            addressField1.setFontSize(fontSize);
            addressField1.setText(part1 || "N/A");
            addressField1.updateAppearances(thaiFont);
          } catch (error) {
            console.error("Error setting field address1:", error);
          }
          try {
            const addressField2 = form.getTextField("address2");
            addressField2.setFontSize(fontSize);
            addressField2.setText(part2 || "N/A");
            addressField2.updateAppearances(thaiFont);
          } catch (error) {
            console.error("Error setting field address2:", error);
          }
          return;
        }
        const pdfFieldName = fieldMapping[fieldName] || fieldName;
        try {
          const field = form.getTextField(pdfFieldName);
          field.setFontSize(fontSize);
          field.setText(value || "N/A");
          field.updateAppearances(thaiFont);
        } catch (error) {
          console.error(`Error setting field ${pdfFieldName}:`, error);
        }
      };

      safeSetText("created_at", new Date().toLocaleDateString("en-GB"));
      safeSetText("want_date", formData.wantDate ? new Date(formData.wantDate).toLocaleDateString("en-GB") : "N/A");
      safeSetText("customer_name", formData.customerName || "N/A");
      safeSetText("address", formData.customerAddress || "N/A");
      safeSetText("name", userName || "N/A");
      safeSetText("department", department || "N/A");
      safeSetText("departmentexpense", formData.departmentExpense || "-");
      safeSetText("timestamp", new Date().toLocaleDateString("en-GB"));

      const requestDetails = formData.requestDetails || [];
      if (requestDetails.includes("ทดสอบเครื่องล้างภาชนะใหม่")) safeSetText("box1", "X");
      if (requestDetails.includes("ทดสอบเครื่องล้างภาชนะเก่า")) safeSetText("box2", "X");
      if (requestDetails.includes("ปรับปรุงเครื่องล้างภาชนะเก่า Repair & Modify")) safeSetText("box3", "X");
      if (requestDetails.includes("ตรวจสอบอุปกรณ์แถมภายในเครื่อง")) safeSetText("box4", "X");
      if (requestDetails.includes("ทดสอบเครื่องทำความสะอาดด้านพื้น")) safeSetText("box5", "X");
      if (requestDetails.includes("ทดลองใช้งานโมบาย")) safeSetText("box6", "X");
      if (requestDetails.includes("ทดสอบเครื่องจักรอุปกรณ์")) safeSetText("box7", "X");
      if (formData.remark) {
        safeSetText("box8", "X");
        safeSetText("desc1", formData.remark.slice(0, 50) || "");
        if (formData.remark.length > 50) {
          safeSetText("desc2", formData.remark.slice(50, 100) || "");
        }
      }

      const setMultilineTextAcrobat = (fieldName, value, fontSize = DEFAULT_FONT_SIZE) => {
        const pdfFieldName = fieldMapping[fieldName] || fieldName;
        try {
          const field = form.getTextField(pdfFieldName);
          field.setFontSize(fontSize);
          field.enableRichFormatting();
          field.setMultiline(true);
          field.setText(value || "N/A");
          field.updateAppearances(thaiFont);
        } catch (error) {
          console.error(`Error setting multiline field ${pdfFieldName}:`, error);
          try {
            const field = form.getTextField(pdfFieldName);
            field.setFontSize(fontSize);
            field.setText(value || "N/A");
            field.updateAppearances(thaiFont);
          } catch (fallbackError) {
            console.error(`Fallback error for field ${pdfFieldName}:`, fallbackError);
          }
        }
      };

      const calculateFontSize = (text) => {
        const length = text.length;
        if (length > 60) return 5;
        if (length > 50) return 6;
        if (length > 40) return 7;
        if (length > 25) return 7;
        return 8;
      };

      allocatedItems.slice(0, 5).forEach((item, index) => {
        try {
          const itemNumberField = `fill_${25 + index * 4}`;
          const field = form.getTextField(itemNumberField);
          field.setFontSize(DEFAULT_FONT_SIZE);
          field.setText(`${index + 1}`);
          field.updateAppearances(thaiFont);
        } catch (error) {
          console.error(`Error setting field fill_${25 + index * 4}:`, error);
        }
        try {
          const productId = item.product_id || "";
          const description = item.description || item.product_description || "";
          let combinedText = "";
          if (productId && description) {
            if (description.length > 15 || (productId.length + description.length) > 25) {
              combinedText = `${productId}\u2029${description}`;
            } else {
              combinedText = `${productId} - ${description}`;
            }
          } else {
            combinedText = productId;
          }
          const fontSize = calculateFontSize(combinedText);
          setMultilineTextAcrobat(`productid${index + 1}`, combinedText, fontSize);
        } catch (error) {
          console.error(`Error processing product info for item ${index + 1}:`, error);
          safeSetText(`productid${index + 1}`, item.product_id || "", 7);
        }
        safeSetText(`serialnumber${index + 1}`, item.sn_number || "");
        safeSetText(`remark${index + 1}`, item.remark || "");
        safeSetText(`qcmremark${index + 1}`, item.QcmRemark || "-");
      });

      form.flatten();
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");

      const filename = `${documentId}.pdf`;
      const uploadData = new FormData();
      uploadData.append("pdf", blob, filename);
      uploadData.append("documentId", documentId);
      const uploadResponse = await fetch("https://saleco.ruu-d.com/upload-pdf", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });
      if (!uploadResponse.ok) throw new Error("Failed to upload PDF");
      const result = await uploadResponse.json();
      return result.pdfUrl;
    } catch (error) {
      console.error("Error generating PDF:", error);
      return "";
    }
  }, [formData, userName, department]);

const handleRequestSubmission = useCallback(
  async (isExternal = false) => {
    // Validation
    if (!isExternal && !formData.customerName) {
      alert("Please enter customer name!");
      return;
    }
    if (basket.length === 0) {
      alert("Your basket is empty!");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      let payload;
      let url;
      let method;

      if (isExternal && selectedExternalRequest) {
        // External request - UPDATE existing records with selected serial numbers
        payload = {
          selectedSerials: basket.map((item) => ({
            productId: item.transactions[0]["รหัสสินค้า"],
            serialNumber: item.serial,
            quantity: item.quantity,
          })),
          userName: `${userName} แผนก ${department}`,
        };
        // Keep your existing endpoint
        url = `https://saleco.ruu-d.com/sale-co/external-request/${selectedExternalRequest.documentId}/add-products`;
        method = "PUT";
      } else {
        // Regular internal request - unchanged
        payload = {
          customerName: formData.customerName,
          customerAddress: formData.customerAddress,
          wantDate: formData.wantDate || new Date().toISOString().split("T")[0],
          requestDetails: formData.requestDetails.join(", "),
          remark: formData.remark,
          departmentExpense: formData.departmentExpense,
          userName: `${userName} แผนก ${department}`,
          items: basket.map((item) => ({
            productId: item.transactions[0]["รหัสสินค้า"],
            serialNumber: item.serial,
            quantity: item.quantity,
            description: item.description,
          })),
        };
        url = "https://saleco.ruu-d.com/sale-co/request";
        method = "POST";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const documentId = isExternal ? selectedExternalRequest.documentId : result.documentId;

      // Generate PDF (only for completed requests, not external updates)
      let pdfUrl = "";
      if (!isExternal) {
        pdfUrl = await generatePdf(documentId);
      }

      // Send Telegram notification
      const pdfMessage = pdfUrl
        ? `<b>📥 PDF เอกสาร:</b> ${pdfUrl}`
        : `<b>📄 หมายเลขเอกสาร:</b> ${documentId}`;

      const telegramMessage = `<b>🔥${isExternal ? "External Request - Serials Allocated" : "New Document Created"}!!</b>
<b>📄 หมายเลขเอกสาร:</b> ${documentId}
<b>🕒 วันที่และเวลาที่${isExternal ? "อัลโลเคท" : "สร้าง"}:</b> ${new Date().toLocaleString()}
<b>👤 ชื่อลูกค้า:</b> ${isExternal ? selectedExternalRequest?.customerName : formData.customerName}
<b>📅 วันที่ต้องการ:</b> ${formData.wantDate || new Date().toLocaleString("en-GB")}
<b>👥 ชื่อผู้แจ้งงาน:</b> ${payload.userName}
<b>💬 Remark:</b> ${formData.remark || selectedExternalRequest?.remark || ""}
<b>📦 ${isExternal ? "Allocated" : "Selected"} Items:</b>
${basket.map(item => `• ${item.transactions[0]["รหัสสินค้า"]} (SN: ${item.serial}) - Qty: ${item.quantity}`).join('\n')}
${!isExternal ? pdfMessage : ""}

${isExternal ? "<i>Status updated to 'Pending' - Following normal approval workflow</i>" : ""}`;

      await Promise.all([
        fetch("https://api.telegram.org/bot7646625188:AAGS-NqBl3rUU9AlC9a01wzlbaqs6spBf7M/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: "-4614144690",
            text: telegramMessage,
            parse_mode: "HTML",
          }),
        }),
        fetch("https://api.telegram.org/bot7646625188:AAGS-NqBl3rUU9AlC9a01wzlbaqs6spBf7M/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: "-4631636900",
            text: telegramMessage,
            parse_mode: "HTML",
          }),
        }),
      ]);

      setShowSuccessMessage(true);
      setBasket([]);

      // Reset form data
      setFormData({
        customerName: "",
        customerAddress: "",
        remark: "",
        wantDate: "",
        requestDetails: [],
        departmentExpense: "",
      });

      if (isExternal) {
        setSelectedExternalRequest(null);
        fetchExternalRequests();
      }

      setShowRequestModal(false);
      fetchProducts(1);
    } catch (error) {
      console.error("Error submitting request:", error);
      alert(`Error submitting request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  },
  [basket, formData, userName, department, selectedExternalRequest, generatePdf, fetchExternalRequests, fetchProducts]
);


const handleSelectExternalRequest = useCallback(
  (request) => {
    setSelectedExternalRequest(request);
    setBasket([]);
    const requestDetailsArray = request.requestDetails
      ? request.requestDetails.split(", ").filter((detail) => detail.trim() !== "")
      : [];
    setFormData({
      customerName: request.customerName || "",
      customerAddress: request.customerAddress || "",
      remark: request.remark || "",
      wantDate: request.wantDate || "",
      requestDetails: requestDetailsArray,
      departmentExpense: "",
    });
    
    // AUTO-FILTER products by the requested product code
    if (request.productCode) {
      setSearchParams({ 
        itemCode: request.productCode, 
        serial: "" 
      });
      // Fetch products with the product code filter
      fetchProductsForExternalRequest(request.productCode, 1);
    } else {
      // Fallback to regular fetch if no product code
      fetchProducts(1);
    }
  },
  [fetchProductsForExternalRequest, fetchProducts]
);

  // Memoized filtered data
  const filteredHistory = useMemo(
    () =>
      transactionHistory.filter(
        (t) =>
          t.note !== "Cancelled" &&
          (debouncedHistorySearch === "" ||
            t.document_id.toString().toLowerCase().includes(debouncedHistorySearch.toLowerCase()) ||
            (t.name && t.name.toLowerCase().includes(debouncedHistorySearch.toLowerCase())) ||
            (t.customer_name &&
              t.customer_name.toLowerCase().includes(debouncedHistorySearch.toLowerCase())) ||
            (t.sn_number && t.sn_number.toLowerCase().includes(debouncedHistorySearch.toLowerCase())))
      ),
    [transactionHistory, debouncedHistorySearch]
  );

  const filteredCancelled = useMemo(
    () =>
      transactionHistory.filter(
        (t) =>
          t.note === "Cancelled" &&
          (debouncedCancelledSearch === "" ||
            t.document_id.toString().toLowerCase().includes(debouncedCancelledSearch.toLowerCase()) ||
            (t.name && t.name.toLowerCase().includes(debouncedCancelledSearch.toLowerCase())) ||
            (t.customer_name &&
              t.customer_name.toLowerCase().includes(debouncedCancelledSearch.toLowerCase())) ||
            (t.sn_number &&
              t.sn_number.toLowerCase().includes(debouncedCancelledSearch.toLowerCase())))
      ),
    [transactionHistory, debouncedCancelledSearch]
  );

  const filteredFailedDocuments = useMemo(
    () =>
      failedDocuments.filter(
        (doc) =>
          debouncedFailedSearch === "" ||
          (doc.document_id &&
            doc.document_id.toLowerCase().includes(debouncedFailedSearch.toLowerCase())) ||
          (doc.customer_name &&
            doc.customer_name.toLowerCase().includes(debouncedFailedSearch.toLowerCase())) ||
          (doc.name && doc.name.toLowerCase().includes(debouncedFailedSearch.toLowerCase()))
      ),
    [failedDocuments, debouncedFailedSearch]
  );

  const filteredExternalRequests = useMemo(
    () =>
      externalRequests.filter(
        (req) =>
          debouncedExternalSearch === "" ||
          (req.documentId &&
            req.documentId.toLowerCase().includes(debouncedExternalSearch.toLowerCase())) ||
          (req.customerName &&
            req.customerName.toLowerCase().includes(debouncedExternalSearch.toLowerCase()))
      ),
    [externalRequests, debouncedExternalSearch]
  );

  // Memoized function to group and slice data for pagination
  const groupAndSlice = useCallback(
    (data) =>
      Object.entries(
        data
          .slice((page - 1) * pageSize, page * pageSize)
          .reduce((groups, { document_id, ...rest }) => {
            groups[document_id] = groups[document_id] || [];
            groups[document_id].push(rest);
            return groups;
          }, {})
      ),
    [page]
  );

  const groupAndSliceFailed = useCallback(
    (data, currentPage) =>
      Object.entries(
        data
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .reduce((groups, { document_id, ...rest }) => {
            groups[document_id] = groups[document_id] || [];
            groups[document_id].push(rest);
            return groups;
          }, {})
      ),
    []
  );

  // Initialize data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    if (!token || (tokenExpiry && new Date() > new Date(tokenExpiry))) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      localStorage.removeItem("tokenExpiry");
      window.location.href = "/";
    } else {
      fetchUserDetails();
      fetchProducts(1);
      fetchExternalRequests();
    }
  }, [fetchUserDetails, fetchProducts, fetchExternalRequests]);

  useEffect(() => {
    if (activeSection === "history" || activeSection === "canceled") fetchHistory();
  }, [activeSection, fetchHistory]);

  useEffect(() => {
    if (activeSection === "failed") {
      fetchFailedDocuments();
      setFailedPage(1);
    }
  }, [activeSection, fetchFailedDocuments]);

  // Sidebar Navigation
  const renderSidebar = () => (
    <Col md={3}>
      <div style={styles.sidebar}>
        <div className="d-flex align-items-center mb-3">
          <div
            className="d-flex justify-content-center align-items-center bg-primary rounded-circle p-2 me-2"
            style={{ width: 40, height: 40 }}
          >
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
            Use the menu below to navigate between different sections of the system.
          </div>
        </div>
        <ListGroup>
          <ListGroup.Item
            className="mb-2"
            style={{
              backgroundColor: "#007bff",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              borderRadius: "0.5rem",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={() => navigate("/edit-failed-qc")}
          >
            <FaEdit className="me-2" /> Edit Failed QC
          </ListGroup.Item>
          <ListGroup.Item
            action
            active={activeSection === "requests"}
            onClick={() => setActiveSection("requests")}
            style={{
              ...styles.navItem,
              ...(activeSection === "requests" ? styles.navItemActive : {}),
            }}
          >
            <FaShoppingBasket className="me-2" /> สร้างเอกสาร
          </ListGroup.Item>
          <ListGroup.Item
            action
            active={activeSection === "external"}
            onClick={() => setActiveSection("external")}
            style={{
              ...styles.navItem,
              ...(activeSection === "external" ? styles.navItemActive : {}),
            }}
          >
            <FaFileAlt className="me-2" /> External Requests
          </ListGroup.Item>
          <ListGroup.Item
            action
            active={activeSection === "history"}
            onClick={() => setActiveSection("history")}
            style={{
              ...styles.navItem,
              ...(activeSection === "history" ? styles.navItemActive : {}),
            }}
          >
            <FaHistory className="me-2" /> ประวัติเอกสาร
          </ListGroup.Item>
          <ListGroup.Item
            action
            active={activeSection === "canceled"}
            onClick={() => setActiveSection("canceled")}
            style={{
              ...styles.navItem,
              ...(activeSection === "canceled" ? styles.navItemActive : {}),
            }}
          >
            <FaTimesCircle className="me-2" /> เอกสารที่ยกเลิก
          </ListGroup.Item>
          <ListGroup.Item
            action
            active={activeSection === "failed"}
            onClick={() => setActiveSection("failed")}
            style={{
              ...styles.navItem,
              ...(activeSection === "failed" ? styles.navItemActive : {}),
            }}
          >
            <FaTimesCircle className="me-2" /> Failed QC
          </ListGroup.Item>
        </ListGroup>
      </div>
    </Col>
  );

  // External Requests Section
const renderExternalRequests = () => {
  const paginatedRequests = filteredExternalRequests.slice(
    (externalPage - 1) * pageSize,
    externalPage * pageSize
  );

  return (
    <Card style={{ ...styles.card, marginTop: "1.5rem" }}>
      <Card.Header style={styles.cardHeader}>
        <span style={{ display: "flex", alignItems: "center" }}>
          <FaFileAlt style={styles.cardHeaderIcon} />
          External Service Requests
        </span>
      </Card.Header>
      <Card.Body>
        <SearchInput
          placeholder="Search by Document ID or Customer Name"
          value={externalSearchTerm}
          onChange={(e) => setExternalSearchTerm(e.target.value)}
        />
        {loadingExternalRequests ? (
          <LoadingSpinner />
        ) : filteredExternalRequests.length === 0 ? (
          <Alert variant="info" style={{ borderRadius: "0.5rem" }}>
            <div className="d-flex align-items-center">
              <FaInfoCircle className="me-2" />
              No pending external service requests found.
            </div>
          </Alert>
        ) : (
          <>
            <Table striped bordered hover responsive>
              <thead style={styles.tableHeader}>
                <tr>
                  <th>Document ID</th>
                  <th>Customer Name</th>
                  <th>Product Code</th>
                  <th>Quantity</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request) => (
                  <tr key={request.documentId}>
                    <td>{request.documentId}</td>
                    <td>{request.customerName}</td>
                    <td>
                      <Badge bg="primary" style={styles.badge}>
                        {request.productCode || "N/A"}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg="success" style={styles.badge}>
                        {request.quantity || "N/A"}
                      </Badge>
                    </td>
                    <td>{formatDateField(request.createdAt)}</td>
                    <td>
                      <Badge
                        bg={request.status === "Pending External Review" ? "warning" : "secondary"}
                        style={styles.badge}
                      >
                        {request.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        style={styles.primaryButton}
                        onClick={() => handleSelectExternalRequest(request)}
                        disabled={request.status !== "Pending External Review"}
                      >
                        Add Products
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div style={styles.paginationContainer}>
              <Button
                variant="outline-primary"
                disabled={externalPage === 1}
                onClick={() => setExternalPage(externalPage - 1)}
                style={styles.paginationButton}
              >
                <FaArrowLeft className="me-1" /> Previous
              </Button>
              <span>
                Page {externalPage} of{" "}
                {Math.max(1, Math.ceil(filteredExternalRequests.length / pageSize))}
              </span>
              <Button
                variant="outline-primary"
                disabled={externalPage >= Math.ceil(filteredExternalRequests.length / pageSize)}
                onClick={() => setExternalPage(externalPage + 1)}
                style={styles.paginationButton}
              >
                Next <FaArrowRight className="ms-1" />
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

  // External Request Details
const renderExternalRequestDetails = () => (
  <>
    <Button
      variant="secondary"
      style={styles.secondaryButton}
      className="mb-4"
      onClick={() => setSelectedExternalRequest(null)}
    >
      <FaArrowLeft /> Back to External Requests
    </Button>
    <Card style={styles.card}>
      <Card.Header style={styles.cardHeader}>
        <span style={{ display: "flex", alignItems: "center" }}>
          <FaFileAlt style={styles.cardHeaderIcon} />
          External Request Details
        </span>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <div style={styles.dataRow}>
              <div style={styles.dataLabel}>
                <FaUser style={styles.dataIcon} /> Customer Name
              </div>
              <div style={styles.dataValue}>{selectedExternalRequest.customerName}</div>
            </div>
            <div style={styles.dataRow}>
              <div style={styles.dataLabel}>
                <FaMapMarkerAlt style={styles.dataIcon} /> Address
              </div>
              <div style={styles.dataValue}>{selectedExternalRequest.customerAddress}</div>
            </div>
            <div style={styles.dataRow}>
              <div style={styles.dataLabel}>
                <FaCalendarAlt style={styles.dataIcon} /> Request Date
              </div>
              <div style={styles.dataValue}>{formatDateField(selectedExternalRequest.createdAt)}</div>
            </div>
          </Col>
          <Col md={6}>
            <div style={styles.dataRow}>
              <div style={styles.dataLabel}>
                <FaInfoCircle style={styles.dataIcon} /> Requested Product Code
              </div>
              <div style={{...styles.dataValue, fontWeight: 'bold', color: '#2980b9'}}>
                {selectedExternalRequest.productCode || "N/A"}
              </div>
            </div>
            <div style={styles.dataRow}>
              <div style={styles.dataLabel}>
                <FaInfoCircle style={styles.dataIcon} /> Requested Quantity
              </div>
              <div style={{...styles.dataValue, fontWeight: 'bold', color: '#27ae60'}}>
                {selectedExternalRequest.quantity || "N/A"}
              </div>
            </div>
            <div style={styles.dataRow}>
              <div style={styles.dataLabel}>
                <FaInfoCircle style={styles.dataIcon} /> Remark
              </div>
              <div style={styles.dataValue}>{selectedExternalRequest.remark || "N/A"}</div>
            </div>
          </Col>
        </Row>
        <Alert variant="info" className="mt-3">
          <FaInfoCircle className="me-2" />
          <strong>Instructions:</strong> The system has automatically filtered products to show only 
          <strong> {selectedExternalRequest.productCode}</strong> items. Select 
          <strong> {selectedExternalRequest.quantity}</strong> unit(s) from the available inventory below. 
          Products will be allocated following FIFO (First In, First Out) principles.
        </Alert>
        {selectedExternalRequest.quantity && (
          <Alert variant="warning" className="mt-2">
            <strong>Required Quantity:</strong> Please select exactly {selectedExternalRequest.quantity} unit(s) 
            to fulfill this external request.
          </Alert>
        )}
      </Card.Body>
    </Card>
  </>
);
  // Product Search
const renderProductSearch = () => (
  <Card style={{ ...styles.card, marginTop: "1.5rem" }}>
    <Card.Header style={styles.cardHeader}>
      <span style={{ display: "flex", alignItems: "center" }}>
        <FaSearch style={styles.cardHeaderIcon} />
        {selectedExternalRequest ? "Products for External Request" : "Search Products"}
      </span>
      {selectedExternalRequest && (
        <Badge bg="info" style={styles.badge}>
          Filtered by: {selectedExternalRequest.productCode}
        </Badge>
      )}
    </Card.Header>
    <Card.Body>
      <Row>
        <Col md={8}>
          <div className="d-flex gap-2 mb-3">
            <Form.Control
              placeholder="Product Code"
              value={searchParams.itemCode}
              onChange={(e) => setSearchParams({ ...searchParams, itemCode: e.target.value })}
              style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem", flex: 1 }}
              disabled={!!selectedExternalRequest} // Disable when external request is selected
            />
            <Form.Control
              placeholder="Serial Number"
              value={searchParams.serial}
              onChange={(e) => setSearchParams({ ...searchParams, serial: e.target.value })}
              style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem", flex: 1 }}
              // Keep serial search enabled for external requests
            />
          </div>
        </Col>
        <Col md={4}>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={handleSearch}
              style={{ ...styles.primaryButton, flex: 1 }}
            >
              <FaSearch className="me-1" /> Search
            </Button>
            <Button
              variant="secondary"
              onClick={handleReset}
              style={{ ...styles.secondaryButton, flex: 1 }}
            >
              Reset
            </Button>
          </div>
        </Col>
      </Row>
      {selectedExternalRequest && (
        <Alert variant="info" style={{ borderRadius: "0.5rem", marginTop: "1rem" }}>
          <FaInfoCircle className="me-2" />
          Product search is filtered to show only <strong>{selectedExternalRequest.productCode}</strong> items. 
          You can still search by serial number to find specific units.
        </Alert>
      )}
    </Card.Body>
  </Card>
);

  // Products Table
  const renderProductsTable = () => (
    <Card style={{ ...styles.card, marginTop: "1.5rem" }}>
      <Card.Header style={styles.cardHeader}>
        <span style={{ display: "flex", alignItems: "center" }}>
          <FaFileAlt style={styles.cardHeaderIcon} />
          Products
        </span>
        <Badge bg="primary" style={styles.badge}>
          {totalItems} products found
        </Badge>
      </Card.Header>
      <Card.Body>
        {loadingProducts ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <Alert variant="warning" style={{ borderRadius: "0.5rem" }}>
            <div className="d-flex align-items-center">
              <FaInfoCircle className="me-2" />
              No products found.
            </div>
          </Alert>
        ) : (
          <>
            <div style={styles.table}>
              <Table striped bordered hover responsive>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th>รหัสสินค้า</th>
                    <th>Date</th>
                    <th>Serial No</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, idx) => {
                    const transaction = product.transactions?.[0] || {};
                    return (
                      <tr key={idx}>
                        <td>{transaction["รหัสสินค้า"] || product.itemCode || "Unknown"}</td>
                        <td>
                          {new Date(
                            transaction["วันที่"] || product.lastReceiptDate
                          ).toLocaleDateString("en-GB")}
                        </td>
                        <td>{product.serial || "N/A"}</td>
                        <td>{transaction["ชื่อสินค้า"] || "No Description"}</td>
                        <td>
                          <Badge
                            bg={product.status === "Available" ? "success" : "secondary"}
                            style={styles.badge}
                          >
                            {product.status || "Unknown"}
                          </Badge>
                        </td>
                        <td>1</td>
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowQuantityModal(true);
                            }}
                            disabled={product.status !== "Available"}
                            style={product.status === "Available" ? styles.successButton : undefined}
                          >
                            <FaPlus className="me-1" /> Select
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
            <div style={styles.paginationContainer}>
              <Button
                variant="outline-primary"
                disabled={page === 1 || loadingProducts}
                onClick={() => handlePageChange(page - 1)}
                style={styles.paginationButton}
              >
                <FaArrowLeft className="me-1" /> Previous
              </Button>
              <span>
                Page {page} of {Math.max(1, Math.ceil(totalItems / pageSize))}
              </span>
              <Button
                variant="outline-primary"
                disabled={page >= Math.ceil(totalItems / pageSize) || loadingProducts}
                onClick={() => handlePageChange(page + 1)}
                style={styles.paginationButton}
              >
                Next <FaArrowRight className="ms-1" />
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );

  // Basket
  const renderBasket = () => (
    <Card style={styles.card}>
      <Card.Header style={styles.cardHeader}>
        <span style={{ display: "flex", alignItems: "center" }}>
          <FaShoppingBasket style={styles.cardHeaderIcon} />
          Basket
        </span>
        <Badge bg="primary" style={styles.badge}>
          {basket.length} items
        </Badge>
      </Card.Header>
      <Card.Body>
        {basket.length === 0 ? (
          <Alert variant="info" style={{ borderRadius: "0.5rem" }}>
            <div className="d-flex align-items-center">
              <FaInfoCircle className="me-2" />
              Your basket is empty.
            </div>
          </Alert>
        ) : (
          <div style={styles.table}>
            <Table striped bordered hover responsive>
              <thead style={styles.tableHeader}>
                <tr>
                  <th>Product Code</th>
                  <th>Serial</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {basket.map((item, idx) => {
                  const transaction = item.transactions?.[0] || {};
                  return (
                    <tr key={idx}>
                      <td>{transaction["รหัสสินค้า"] || "Unknown"}</td>
                      <td>{item.serial || "N/A"}</td>
                      <td>{item.description || "No Description"}</td>
                      <td>{item.quantity || 1}</td>
                      <td>
                        <Button
                          variant="danger"
                          onClick={() => handleRemoveFromBasket(item.serial)}
                          size="sm"
                          style={styles.dangerButton}
                        >
                          <FaTrashAlt className="me-1" /> Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
        {basket.length > 0 && (
          <div className="mt-3">
            <Button
              variant="primary"
              onClick={() => setShowRequestModal(true)}
              style={styles.primaryButton}
            >
              <FaFileAlt className="me-2" /> {selectedExternalRequest ? "Submit External Request" : "Submit Request"}
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );

  // Quantity Modal
  const renderQuantityModal = () => (
    <Modal show={showQuantityModal} onHide={() => setShowQuantityModal(false)} centered>
      <Modal.Header closeButton style={{ backgroundColor: "#f8f9fa", border: "none" }}>
        <Modal.Title style={{ color: "#2c3e50", fontWeight: "600" }}>
          <FaPlus className="me-2" style={{ color: "#3498db" }} />
          Select Quantity
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: "1.5rem" }}>
        {selectedProduct && selectedProduct.transactions?.[0] ? (
          <>
            <div style={styles.summaryCard}>
              <div style={styles.dataRow}>
                <div style={styles.dataLabel}>
                  <FaFileAlt style={styles.dataIcon} /> Product Code
                </div>
                <div style={styles.dataValue}>{selectedProduct.transactions[0]["รหัสสินค้า"]}</div>
              </div>
            </div>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="product-quantity" style={{ fontWeight: "500" }}>
                <FaInfoCircle className="me-1" style={{ color: "#3498db" }} /> Quantity
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                defaultValue="1"
                id="product-quantity"
                style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
              />
            </Form.Group>
          </>
        ) : (
          <Alert variant="danger" style={{ borderRadius: "0.5rem" }}>
            <div className="d-flex align-items-center">
              <FaInfoCircle className="me-2" />
              Product data is invalid or missing.
            </div>
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer style={{ border: "none", padding: "0.75rem 1.5rem 1.5rem" }}>
        <Button variant="secondary" onClick={() => setShowQuantityModal(false)} style={styles.secondaryButton}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleAddToBasket} style={styles.primaryButton}>
          <FaShoppingBasket className="me-1" /> Add to Basket
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Request Modal
  const renderRequestModal = () => (
    <Modal
      show={showRequestModal}
      onHide={() => setShowRequestModal(false)}
      centered
      backdrop="static"
      size="lg"
    >
      <Modal.Header closeButton style={{ backgroundColor: "#f8f9fa", border: "none" }}>
        <Modal.Title style={{ color: "#2c3e50", fontWeight: "600" }}>
          <FaFileAlt className="me-2" style={{ color: "#3498db" }} />
          Submit Request
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: "1.5rem" }}>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="customerName" style={{ fontWeight: "500" }}>
                  <FaUser className="me-1" style={{ color: "#3498db" }} /> ชื่อลูกค้า
                </Form.Label>
                <Form.Control
                  id="customerName"
                  type="text"
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
                  disabled={!!selectedExternalRequest}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="wantDate" style={{ fontWeight: "500" }}>
                  <FaCalendarAlt className="me-1" style={{ color: "#3498db" }} /> วันที่ต้องการสินค้า
                </Form.Label>
                <Form.Control
                  id="wantDate"
                  type="date"
                  value={formData.wantDate}
                  onChange={(e) => setFormData({ ...formData, wantDate: e.target.value })}
                  style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
                  disabled={!!selectedExternalRequest}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="customerAddress" style={{ fontWeight: "500" }}>
              <FaMapMarkerAlt className="me-1" style={{ color: "#3498db" }} /> ที่อยู่ลูกค้า
            </Form.Label>
            <Form.Control
              id="customerAddress"
              type="text"
              placeholder="Enter customer address"
              value={formData.customerAddress}
              onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
              style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
              disabled={!!selectedExternalRequest}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: "500" }}>
              <FaInfoCircle className="me-1" style={{ color: "#3498db" }} /> รายละเอียดการแจ้งงาน
            </Form.Label>
            <Select
              isMulti
              options={requestDetailsOptions}
              styles={selectStyles}
              value={requestDetailsOptions.filter((opt) => formData.requestDetails.includes(opt.value))}
              onChange={(sel) =>
                setFormData({
                  ...formData,
                  requestDetails: sel ? sel.map((opt) => opt.value) : [],
                })
              }
              placeholder="เลือกรายละเอียด..."
              isDisabled={!!selectedExternalRequest}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="remarks" style={{ fontWeight: "500" }}>
              <FaInfoCircle className="me-1" style={{ color: "#3498db" }} /> Remarks
            </Form.Label>
            <Form.Control
              id="remarks"
              as="textarea"
              rows={3}
              placeholder="Enter remarks"
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
              disabled={!!selectedExternalRequest}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: "500" }}>
              <FaBuilding className="me-1" style={{ color: "#3498db" }} /> เก็บค่าใช้จ่ายแผนก
            </Form.Label>
            <Select
              options={departmentOptions}
              styles={selectStyles}
              placeholder="Select department expense"
              value={departmentOptions.find((opt) => opt.value === formData.departmentExpense) || null}
              onChange={(selectedOption) =>
                setFormData({
                  ...formData,
                  departmentExpense: selectedOption ? selectedOption.value : "",
                })
              }
              isClearable
              isSearchable
            />
          </Form.Group>
          {basket.length > 0 && (
            <div className="mt-4">
              <h5 style={{ color: "#2c3e50", fontWeight: "600", marginBottom: "1rem" }}>
                <FaShoppingBasket className="me-2" style={{ color: "#3498db" }} />
                Selected Products
              </h5>
              <div style={styles.table}>
                <Table striped bordered hover responsive>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th>Product Code</th>
                      <th>Serial</th>
                      <th>Description</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {basket.map((item, idx) => {
                      const transaction = item.transactions?.[0] || {};
                      return (
                        <tr key={idx}>
                          <td>{transaction["รหัสสินค้า"] || "Unknown"}</td>
                          <td>{item.serial || "N/A"}</td>
                          <td>{item.description || "No Description"}</td>
                          <td>{item.quantity || 1}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer style={{ border: "none", padding: "0.75rem 1.5rem 1.5rem" }}>
        <Button
          variant="secondary"
          onClick={() => setShowRequestModal(false)}
          style={styles.secondaryButton}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => handleRequestSubmission(!!selectedExternalRequest)}
          style={styles.primaryButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Submitting...
            </span>
          ) : (
            <span>
              <FaFileAlt className="me-1" /> Submit
            </span>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Store NC Modal
  const renderStoreNCModal = () => (
    <Modal
      show={storeNCModalVisible}
      onHide={() => setStoreNCModalVisible(false)}
      centered
      size="lg"
      backdrop="static"
    >
      <Modal.Header closeButton style={{ backgroundColor: "#f8f9fa", border: "none" }}>
        <Modal.Title style={{ color: "#2c3e50", fontWeight: "600" }}>
          <FaTimesCircle className="me-2" style={{ color: "#e74c3c" }} />
          Create Store NC Record
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: "1.5rem" }}>
        {selectedStoreNCData && (
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Serial Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedStoreNCData.sn_number || "N/A"}
                    disabled
                    style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Product Type</Form.Label>
                  <Form.Control
                    type="text"
                    value={ncFormData.productType}
                    onChange={(e) => setNcFormData({ ...ncFormData, productType: e.target.value })}
                    style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: "500" }}>Lot No</Form.Label>
                  <Form.Control
                    type="text"
                    value={ncFormData.lotNo}
                    onChange={(e) => setNcFormData({ ...ncFormData, lotNo: e.target.value })}
                    style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Pack Size</Form.Label>
                  <Form.Control
                    type="text"
                    value={ncFormData.packSize}
                    onChange={(e) => setNcFormData({ ...ncFormData, packSize: e.target.value })}
                    style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Found Issue</Form.Label>
                  <Form.Control
                    type="text"
                    value={ncFormData.foundIssue}
                    onChange={(e) => setNcFormData({ ...ncFormData, foundIssue: e.target.value })}
                    style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Defect Reporter</Form.Label>
                  <Form.Control
                    type="text"
                    value={ncFormData.defectReporter}
                    onChange={(e) => setNcFormData({ ...ncFormData, defectReporter: e.target.value })}
                    style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Inventory Source</Form.Label>
                  <Form.Control
                    type="text"
                    value={ncFormData.inventorySource}
                    onChange={(e) => setNcFormData({ ...ncFormData, inventorySource: e.target.value })}
                    style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Issue Details</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={ncFormData.issueDetails}
                    onChange={(e) => setNcFormData({ ...ncFormData, issueDetails: e.target.value })}
                    style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>Preventive Actions</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={ncFormData.preventiveActions}
                    onChange={(e) => setNcFormData({ ...ncFormData, preventiveActions: e.target.value })}
                    style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>NC Image 1</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNcFormData({ ...ncFormData, ncImage1: e.target.files[0] })}
                    style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "500" }}>NC Image 2</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNcFormData({ ...ncFormData, ncImage2: e.target.files[0] })}
                    style={{ borderRadius: "0.375rem", padding: "0.6rem 1rem" }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer style={{ border: "none", padding: "0.75rem 1.5rem 1.5rem" }}>
        <Button
          variant="secondary"
          onClick={() => setStoreNCModalVisible(false)}
          style={styles.secondaryButton}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleStoreNCSubmit}
          style={styles.primaryButton}
        >
          <FaFileAlt className="me-1" /> Submit NC
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // History Section
  const renderHistory = () => {
    const groupedHistory = groupAndSlice(filteredHistory);
    return (
      <Card style={{ ...styles.card, marginTop: "1.5rem" }}>
        <Card.Header style={styles.cardHeader}>
          <span style={{ display: "flex", alignItems: "center" }}>
            <FaHistory style={styles.cardHeaderIcon} />
            Transaction History
          </span>
        </Card.Header>
        <Card.Body>
          <SearchInput
            placeholder="Search by Document ID, Customer, or Serial"
            value={historySearchTerm}
            onChange={(e) => setHistorySearchTerm(e.target.value)}
          />
          {loadingHistory ? (
            <LoadingSpinner />
          ) : groupedHistory.length === 0 ? (
            <Alert variant="info" style={{ borderRadius: "0.5rem" }}>
              <div className="d-flex align-items-center">
                <FaInfoCircle className="me-2" />
                No transaction history found.
              </div>
            </Alert>
          ) : (
            <>
              {groupedHistory.map(([documentId, items]) => {
                const isExpanded = expandedCards[documentId];
                const { nameWithoutDepartment, departmentName } = extractDepartment(
                  getFirstNonEmptyValue("name", items)
                );
                return (
                  <Card
                    key={documentId}
                    style={{
                      ...styles.card,
                      marginBottom: "1rem",
                      ...(hoveredCard === documentId ? styles.cardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredCard(documentId)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <Card.Header
                      style={{
                        ...styles.cardHeader,
                        cursor: "pointer",
                        backgroundColor: hoveredCard === documentId ? "#f8f9fa" : "#ffffff",
                      }}
                      onClick={() =>
                        setExpandedCards({
                          ...expandedCards,
                          [documentId]: !isExpanded,
                        })
                      }
                    >
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <FaFileAlt style={styles.cardHeaderIcon} />
                        Document ID: {documentId}
                      </span>
                      <Badge bg="primary" style={styles.badge}>
                        {items.length} items
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={4}>
                          <div style={styles.dataRow}>
                            <div style={styles.dataLabel}>
                              <FaUser style={styles.dataIcon} /> Customer Name
                            </div>
                            <div style={styles.dataValue}>
                              {getFirstNonEmptyValue("customer_name", items) || "N/A"}
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div style={styles.dataRow}>
                            <div style={styles.dataLabel}>
                              <FaUser style={styles.dataIcon} /> SaleCo Name
                            </div>
                            <div style={styles.dataValue}>{nameWithoutDepartment || "N/A"}</div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div style={styles.dataRow}>
                            <div style={styles.dataLabel}>
                              <FaBuilding style={styles.dataIcon} /> Department
                            </div>
                            <div style={styles.dataValue}>{departmentName}</div>
                          </div>
                        </Col>
                      </Row>
                      {isExpanded && (
                        <div style={styles.table}>
                          <Table striped bordered hover responsive className="mt-3">
                            <thead style={styles.tableHeader}>
                              <tr>
                                <th>Serial Number</th>
                                <th>Product ID</th>
                                <th>Description</th>
                                <th>Remark</th>
                                <th>Status</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{cleanString(item.sn_number) || "N/A"}</td>
                                  <td>{cleanString(item.product_id) || "N/A"}</td>
                                  <td>{cleanString(item.description) || "N/A"}</td>
                                  <td>{cleanString(item.remark) || "N/A"}</td>
                                  <td>
                                    <Badge
                                      bg={
                                        item.status === "Available"
                                          ? "success"
                                          : item.status === "At Store NC"
                                          ? "warning"
                                          : "secondary"
                                      }
                                      style={styles.badge}
                                    >
                                      {item.status || "Unknown"}
                                    </Badge>
                                  </td>
                                  <td>
                                    {item.status !== "At Store NC" && (
                                      <Button
                                        variant="warning"
                                        size="sm"
                                        onClick={() => handleOpenStoreNCModal(item)}
                                        style={styles.primaryButton}
                                      >
                                        <FaTimesCircle className="me-1" /> Store NC
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                );
              })}
              <div style={styles.paginationContainer}>
                <Button
                  variant="outline-primary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  style={styles.paginationButton}
                >
                  <FaArrowLeft className="me-1" /> Previous
                </Button>
                <span>
                  Page {page} of {Math.max(1, Math.ceil(filteredHistory.length / pageSize))}
                </span>
                <Button
                  variant="outline-primary"
                  disabled={page >= Math.ceil(filteredHistory.length / pageSize)}
                  onClick={() => setPage(page + 1)}
                  style={styles.paginationButton}
                >
                  Next <FaArrowRight className="ms-1" />
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    );
  };

  // Cancelled Documents Section
  const renderCancelled = () => {
    const groupedCancelled = groupAndSlice(filteredCancelled);
    return (
      <Card style={{ ...styles.card, marginTop: "1.5rem" }}>
        <Card.Header style={styles.cardHeader}>
          <span style={{ display: "flex", alignItems: "center" }}>
            <FaTimesCircle style={styles.cardHeaderIcon} />
            Cancelled Documents
          </span>
        </Card.Header>
        <Card.Body>
          <SearchInput
            placeholder="Search by Document ID, Customer, or Serial"
            value={cancelledSearchTerm}
            onChange={(e) => setCancelledSearchTerm(e.target.value)}
          />
          {loadingHistory ? (
            <LoadingSpinner />
          ) : groupedCancelled.length === 0 ? (
            <Alert variant="info" style={{ borderRadius: "0.5rem" }}>
              <div className="d-flex align-items-center">
                <FaInfoCircle className="me-2" />
                No cancelled documents found.
              </div>
            </Alert>
          ) : (
            <>
              {groupedCancelled.map(([documentId, items]) => {
                const isExpanded = expandedCards[documentId];
                const { nameWithoutDepartment, departmentName } = extractDepartment(
                  getFirstNonEmptyValue("name", items)
                );
                return (
                  <Card
                    key={documentId}
                    style={{
                      ...styles.card,
                      marginBottom: "1rem",
                      ...(hoveredCard === documentId ? styles.cardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredCard(documentId)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <Card.Header
                      style={{
                        ...styles.cardHeader,
                        cursor: "pointer",
                        backgroundColor: hoveredCard === documentId ? "#f8f9fa" : "#ffffff",
                      }}
                      onClick={() =>
                        setExpandedCards({
                          ...expandedCards,
                          [documentId]: !isExpanded,
                        })
                      }
                    >
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <FaFileAlt style={styles.cardHeaderIcon} />
                        Document ID: {documentId}
                      </span>
                      <Badge bg="danger" style={styles.badge}>
                        Cancelled
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={4}>
                          <div style={styles.dataRow}>
                            <div style={styles.dataLabel}>
                              <FaUser style={styles.dataIcon} /> Customer Name
                            </div>
                            <div style={styles.dataValue}>
                              {getFirstNonEmptyValue("customer_name", items) || "N/A"}
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div style={styles.dataRow}>
                            <div style={styles.dataLabel}>
                              <FaUser style={styles.dataIcon} /> SaleCo Name
                            </div>
                            <div style={styles.dataValue}>{nameWithoutDepartment || "N/A"}</div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div style={styles.dataRow}>
                            <div style={styles.dataLabel}>
                              <FaBuilding style={styles.dataIcon} /> Department
                            </div>
                            <div style={styles.dataValue}>{departmentName}</div>
                          </div>
                        </Col>
                      </Row>
                      {isExpanded && (
                        <div style={styles.table}>
                          <Table striped bordered hover responsive className="mt-3">
                            <thead style={styles.tableHeader}>
                              <tr>
                                <th>Serial Number</th>
                                <th>Product ID</th>
                                <th>Description</th>
                                <th>Remark</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{cleanString(item.sn_number) || "N/A"}</td>
                                  <td>{cleanString(item.product_id) || "N/A"}</td>
                                  <td>{cleanString(item.description) || "N/A"}</td>
                                  <td>{cleanString(item.remark) || "N/A"}</td>
                                  <td>
                                    <Badge bg="danger" style={styles.badge}>
                                      Cancelled
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                );
              })}
              <div style={styles.paginationContainer}>
                <Button
                  variant="outline-primary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  style={styles.paginationButton}
                >
                  <FaArrowLeft className="me-1" /> Previous
                </Button>
                <span>
                  Page {page} of {Math.max(1, Math.ceil(filteredCancelled.length / pageSize))}
                </span>
                <Button
                  variant="outline-primary"
                  disabled={page >= Math.ceil(filteredCancelled.length / pageSize)}
                  onClick={() => setPage(page + 1)}
                  style={styles.paginationButton}
                >
                  Next <FaArrowRight className="ms-1" />
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    );
  };

  // Failed QC Documents Section
  const renderFailedDocuments = () => {
    const groupedFailed = groupAndSliceFailed(filteredFailedDocuments, failedPage);
    return (
      <Card style={{ ...styles.card, marginTop: "1.5rem" }}>
        <Card.Header style={styles.cardHeader}>
          <span style={{ display: "flex", alignItems: "center" }}>
            <FaTimesCircle style={styles.cardHeaderIcon} />
            Failed QC Documents
          </span>
        </Card.Header>
        <Card.Body>
          <SearchInput
            placeholder="Search by Document ID, Customer, or Name"
            value={failedSearchTerm}
            onChange={(e) => setFailedSearchTerm(e.target.value)}
          />
          {loadingHistory ? (
            <LoadingSpinner />
          ) : groupedFailed.length === 0 ? (
            <Alert variant="info" style={{ borderRadius: "0.5rem" }}>
              <div className="d-flex align-items-center">
                <FaInfoCircle className="me-2" />
                No failed QC documents found.
              </div>
            </Alert>
          ) : (
            <>
              {groupedFailed.map(([documentId, items]) => {
                const isExpanded = expandedCards[documentId];
                const { nameWithoutDepartment, departmentName } = extractDepartment(
                  getFirstNonEmptyValue("name", items)
                );
                return (
                  <Card
                    key={documentId}
                    style={{
                      ...styles.card,
                      marginBottom: "1rem",
                      ...(hoveredCard === documentId ? styles.cardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredCard(documentId)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <Card.Header
                      style={{
                        ...styles.cardHeader,
                        cursor: "pointer",
                        backgroundColor: hoveredCard === documentId ? "#f8f9fa" : "#ffffff",
                      }}
                      onClick={() =>
                        setExpandedCards({
                          ...expandedCards,
                          [documentId]: !isExpanded,
                        })
                      }
                    >
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <FaFileAlt style={styles.cardHeaderIcon} />
                        Document ID: {documentId}
                      </span>
                      <Badge bg="danger" style={styles.badge}>
                        Failed QC
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={4}>
                          <div style={styles.dataRow}>
                            <div style={styles.dataLabel}>
                              <FaUser style={styles.dataIcon} /> Customer Name
                            </div>
                            <div style={styles.dataValue}>
                              {getFirstNonEmptyValue("customer_name", items) || "N/A"}
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div style={styles.dataRow}>
                            <div style={styles.dataLabel}>
                              <FaUser style={styles.dataIcon} /> SaleCo Name
                            </div>
                            <div style={styles.dataValue}>{nameWithoutDepartment || "N/A"}</div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div style={styles.dataRow}>
                            <div style={styles.dataLabel}>
                              <FaBuilding style={styles.dataIcon} /> Department
                            </div>
                            <div style={styles.dataValue}>{departmentName}</div>
                          </div>
                        </Col>
                      </Row>
                      {isExpanded && (
                        <div style={styles.table}>
                          <Table striped bordered hover responsive className="mt-3">
                            <thead style={styles.tableHeader}>
                              <tr>
                                <th>Serial Number</th>
                                <th>Product ID</th>
                                <th>Description</th>
                                <th>Remark</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{cleanString(item.sn_number) || "N/A"}</td>
                                  <td>{cleanString(item.product_id) || "N/A"}</td>
                                  <td>{cleanString(item.description) || "N/A"}</td>
                                  <td>{cleanString(item.remark) || "N/A"}</td>
                                  <td>
                                    <Badge bg="danger" style={styles.badge}>
                                      Failed QC
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                );
              })}
              <div style={styles.paginationContainer}>
                <Button
                  variant="outline-primary"
                  disabled={failedPage === 1}
                  onClick={() => setFailedPage(failedPage - 1)}
                  style={styles.paginationButton}
                >
                  <FaArrowLeft className="me-1" /> Previous
                </Button>
                <span>
                  Page {failedPage} of {Math.max(1, Math.ceil(filteredFailedDocuments.length / pageSize))}
                </span>
                <Button
                  variant="outline-primary"
                  disabled={failedPage >= Math.ceil(filteredFailedDocuments.length / pageSize)}
                  onClick={() => setFailedPage(failedPage + 1)}
                  style={styles.paginationButton}
                >
                  Next <FaArrowRight className="ms-1" />
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    );
  };

  // Main Render
  return (
    <div style={styles.pageContainer}>
      <Container fluid>
        <Row>
          {renderSidebar()}
          <Col md={9}>
            {showSuccessMessage && (
              <Alert
                variant="success"
                onClose={() => setShowSuccessMessage(false)}
                dismissible
                style={{ borderRadius: "0.5rem", marginBottom: "1.5rem" }}
              >
                <div className="d-flex align-items-center">
                  <FaInfoCircle className="me-2" />
                  Request submitted successfully!
                </div>
              </Alert>
            )}
            <h1 style={styles.headerTitle}>SaleCo Requests</h1>
            {activeSection === "requests" && (
              <>
                {renderBasket()}
                {renderProductSearch()}
                {renderProductsTable()}
                
              </>
            )}
            {activeSection === "external" && !selectedExternalRequest && renderExternalRequests()}
            {activeSection === "external" && selectedExternalRequest && (
              <>
                {renderExternalRequestDetails()}
                {renderBasket()}
                {renderProductSearch()}
                {renderProductsTable()}
              </>
            )}
            {activeSection === "history" && renderHistory()}
            {activeSection === "canceled" && renderCancelled()}
            {activeSection === "failed" && renderFailedDocuments()}
          </Col>
        </Row>
        {renderQuantityModal()}
        {renderRequestModal()}
        {renderStoreNCModal()}
      </Container>
    </div>
  );
};

export default SaleCoRequests;