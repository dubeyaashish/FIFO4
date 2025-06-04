import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import {
  Container,
  Form,
  Button,
  Table,
  Row,
  Col,
  Pagination,
  Card,
} from "react-bootstrap";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import * as XLSX from "xlsx";
import "./Document.css";

// Options for รายละเอียดการแจ้งงาน (job/request details)
const requestDetailsOptions = [
  { value: "ทดสอบเครื่องล้างภาชนะใหม่", label: "ทดสอบเครื่องล้างภาชนะใหม่" },
  { value: "ทดสอบเครื่องล้างภาชนะเก่า", label: "ทดสอบเครื่องล้างภาชนะเก่า" },
  {
    value: "ปรับปรุงเครื่องล้างภาชนะเก่า Repair & Modify",
    label: "ปรับปรุงเครื่องล้างภาชนะเก่า Repair & Modify",
  },
  {
    value: "ตรวจสอบอุปกรณ์แถมภายในเครื่อง",
    label: "ตรวจสอบอุปกรณ์แถมภายในเครื่อง",
  },
  {
    value: "ทดสอบเครื่องทำความสะอาดด้านพื้น",
    label: "ทดสอบเครื่องทำความสะอาดด้านพื้น",
  },
  { value: "ทดลองใช้งานโมบาย", label: "ทดลองใช้งานโมบาย" },
  { value: "ทดสอบเครื่องจักรอุปกรณ์", label: "ทดสอบเครื่องจักรอุปกรณ์" },
];

// Helper function to group documents by document_id.
const groupByDocumentId = (data) => {
  return data.reduce((groups, item) => {
    const { document_id } = item;
    if (!groups[document_id]) {
      groups[document_id] = [];
    }
    groups[document_id].push(item);
    return groups;
  }, {});
};

// Returns the first non-empty value (ignoring empty strings) – used for fields like dates.
const getFirstNonEmptyValue = (fieldName, group) => {
  for (const item of group) {
    if (item[fieldName] && item[fieldName].toString().trim() !== "") {
      return item[fieldName];
    }
  }
  return "N/A";
};

// Returns the first value even if it is an empty string – use for fields like รายละเอียดการแจ้งงาน and remark.
const getFirstValue = (fieldName, group) => {
  for (const item of group) {
    if (item.hasOwnProperty(fieldName)) {
      return item[fieldName];
    }
  }
  return "";
};

// Robust cleaning function that removes all whitespace and any quotes,
// then trims the result and converts it to lowercase.
const cleanString = (str) => {
  if (!str) return "";
  return str.replace(/["']/g, "").replace(/\s/g, "").trim().toLowerCase();
};

// Format a Date object to ISO format (yyyy-mm-dd) for backend queries.
const formatDateToYYYYMMDD = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Format any date value to "dd/mm/yyyy".
const formatDateField = (value) => {
  if (!value || value === "N/A") return "N/A";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
};

const Document = () => {
  // Existing states for date filtering
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  // Status filter state
  const [selectedStatuses, setSelectedStatuses] = useState([{ value: "ALL", label: "ALL" }]);
  // New filter states
  const [selectedCustomers, setSelectedCustomers] = useState([{ value: "ALL", label: "ALL" }]);
  const [productIdInput, setProductIdInput] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [serialNumberInput, setSerialNumberInput] = useState("");
  const [selectedSerialNumber, setSelectedSerialNumber] = useState(null);
  const [customerOptions, setCustomerOptions] = useState([{ value: "ALL", label: "ALL" }]);
  const [productIdOptions, setProductIdOptions] = useState([]);
  const [serialNumberOptions, setSerialNumberOptions] = useState([]);
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tickSymbol = "X"; // Change this to "✓" if desired and supported by the font

  // Handle change for status multi-select
  const handleStatusChange = (selectedOptions) => {
    if (selectedOptions.some(option => option.value === "ALL")) {
      setSelectedStatuses([{ value: "ALL", label: "ALL" }]);
    } else {
      setSelectedStatuses(selectedOptions);
    }
  };

  // Handle change for customer multi-select
  const handleCustomerChange = (selectedOptions) => {
    if (selectedOptions.some(option => option.value === "ALL")) {
      setSelectedCustomers([{ value: "ALL", label: "ALL" }]);
    } else {
      setSelectedCustomers(selectedOptions);
    }
  };

  // Extract filter options from the documents array once it's loaded
  useEffect(() => {
    if (documents.length > 0) {
      // Extract unique customer names from the loaded documents
      const uniqueCustomers = Array.from(
        new Set(documents.map(item => item.customer_name))
      )
        .filter(name => name && name.trim() !== "")
        .map(name => ({ value: name, label: name }));
      
      setCustomerOptions([{ value: "ALL", label: "ALL" }, ...uniqueCustomers]);
      
      // Extract unique product IDs for default options
      const uniqueProductIds = Array.from(
        new Set(documents.map(item => item.product_id))
      )
        .filter(id => id && id.trim() !== "")
        .map(id => ({ value: id, label: id }));
      
      setProductIdOptions(uniqueProductIds);
      
      // Extract unique serial numbers for default options
      const uniqueSerialNumbers = Array.from(
        new Set(documents.map(item => item.sn_number))
      )
        .filter(sn => sn && sn.trim() !== "")
        .map(sn => ({ value: sn, label: sn }));
      
      setSerialNumberOptions(uniqueSerialNumbers);
    }
  }, [documents]);

  // Filter product IDs based on input from local data
  const loadProductIds = (inputValue) => {
    return new Promise((resolve) => {
      if (!inputValue || inputValue.length < 2) {
        resolve([]);
        return;
      }
      
      // Filter product IDs from the documents that match the input
      const matchingProductIds = Array.from(
        new Set(
          documents
            .filter(item => 
              item.product_id && 
              item.product_id.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map(item => item.product_id)
        )
      ).map(id => ({ value: id, label: id }));
      
      resolve(matchingProductIds);
    });
  };

  // Filter serial numbers based on input from local data
  const loadSerialNumbers = (inputValue) => {
    return new Promise((resolve) => {
      if (!inputValue || inputValue.length < 2) {
        resolve([]);
        return;
      }
      
      // Filter serial numbers from the documents that match the input
      const matchingSerialNumbers = Array.from(
        new Set(
          documents
            .filter(item => 
              item.sn_number && 
              item.sn_number.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map(item => item.sn_number)
        )
      ).map(sn => ({ value: sn, label: sn }));
      
      resolve(matchingSerialNumbers);
    });
  };

  // Handle product ID input change
  const handleProductIdInputChange = (inputValue) => {
    setProductIdInput(inputValue);
  };

  // Handle serial number input change
  const handleSerialNumberInputChange = (inputValue) => {
    setSerialNumberInput(inputValue);
  };

  // Handle product ID selection
  const handleProductIdChange = (selectedOption) => {
    setSelectedProductId(selectedOption);
  };

  // Handle serial number selection
  const handleSerialNumberChange = (selectedOption) => {
    setSelectedSerialNumber(selectedOption);
  };

  // Fetch documents from backend with all filters
  const handleFilter = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
  
      // Date filter using created_at column
      if (startDate) {
        const formattedStart = formatDateToYYYYMMDD(startDate);
        queryParams.append("start", formattedStart);
      }
      if (endDate) {
        const formattedEnd = formatDateToYYYYMMDD(endDate);
        queryParams.append("end", formattedEnd);
      }
  
      // Product filter using product_id column
      if (selectedProductId && selectedProductId.value) {
        queryParams.append("product_id", selectedProductId.value);
      }
  
      // Serial number filter using sn_number column
      if (selectedSerialNumber && selectedSerialNumber.value) {
        queryParams.append("sn_number", selectedSerialNumber.value);
      }
  
      // Customer filter using customer_name column
      if (selectedCustomers && selectedCustomers.length > 0 && !selectedCustomers.some(customer => customer.value === "ALL")) {
        const customerValues = selectedCustomers.map(customer => customer.value);
        queryParams.append("customer_name", customerValues.join(","));
      }
  
      // Status filter
      if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.some(status => status.value === "ALL")) {
        const statusValues = selectedStatuses.map(status => status.value);
        queryParams.append("status", statusValues.join(","));
      }
  
      // Log the query string for debugging purposes
      console.log("Query Params: ", queryParams.toString());
  
      const response = await fetch(
        `https://saleco.ruu-d.com/documents?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      setDocuments(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters when any filter changes
  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, selectedStatuses, selectedCustomers, selectedProductId, selectedSerialNumber]);

  // Export Excel functionality.
  const handleExportExcel = () => {
    // Filter documents based on all selected filters
    let filteredDocs = documents;
    
    if (filteredDocs.length === 0) {
      alert("No documents found for the selected filters.");
      return;
    }
  
    const formattedDocs = filteredDocs.map((doc) => ({
      ...doc,
      created_at: formatDateField(doc.created_at),
      wantDate: formatDateField(doc.wantDate),
      timestamp: formatDateField(doc.timestamp),
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(formattedDocs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Documents");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "documents.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Function to open PDF URL
  const handleOpenPdf = (url) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  // Function to handle view PDF (either using pdf_url or generating dynamically)
  const handleViewPdf = async (docId) => {
    const groupedDocuments = groupByDocumentId(documents);
    const items = groupedDocuments[docId];
    if (!items || items.length === 0) return;
  
    // First check if there's a PDF URL available
    const pdfUrl = getFirstNonEmptyValue("pdf_url", items);
    if (pdfUrl && pdfUrl !== "N/A") {
      handleOpenPdf(pdfUrl);
      return;
    }
  
    // If no PDF URL, generate one dynamically
    try {
      const templateUrl = "/sid/template.pdf?nocache=" + Date.now();
      const templateBytes = await fetch(templateUrl).then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(templateBytes);
      pdfDoc.registerFontkit(fontkit);
  
      const fontUrl = "/sid/NotoSansThai-Regular.ttf?nocache=" + Date.now();
      const fontBytes = await fetch(fontUrl).then((res) =>
        res.arrayBuffer()
      );
      const thaiFont = await pdfDoc.embedFont(fontBytes, { subset: true });
  
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      console.log("All PDF Field Names:", fields.map((f) => f.getName()));
  
      // Field mapping for text fields.
      const fieldMapping = {
        want_date: "wantdate",
        customer_name: "customername",
        name: "saleco",
        timestamp: "created_at",
        serial1: "serialnumber1",
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
  
      // Extract department name from saleco field and remove it from the name.
      const salecoName = getFirstNonEmptyValue("name", items);
      const { nameWithoutDepartment, departmentName } = extractDepartment(salecoName);
      console.log("Extracted Department:", departmentName);
      console.log("Cleaned Name:", nameWithoutDepartment);
  
      // Log all values that are about to be set in the form.
      const documentData = {
        created_at: formatDateField(getFirstNonEmptyValue("created_at", items)),
        want_date: formatDateField(getFirstNonEmptyValue("wantDate", items)),
        customer_name: getFirstNonEmptyValue("customer_name", items),
        address: getFirstNonEmptyValue("customer_address", items),
        name: nameWithoutDepartment,  // Cleaned name without department
        department: departmentName, // Department extracted from saleco
        departmentexpense: getFirstNonEmptyValue("departmentExpense", items),
        qcmname: getFirstNonEmptyValue("QcmName", items),
        timestamp: formatDateField(getFirstNonEmptyValue("timestamp", items)),
        requestDetails: getFirstValue("รายละเอียดการแจ้งงาน", items),
        remark: getFirstValue("remark", items),
      };
  
      console.log("Document Data: ", documentData);
  
      // Fill document-level text fields.
      safeSetText("created_at", documentData.created_at);
      safeSetText("want_date", documentData.want_date);
      safeSetText("customer_name", documentData.customer_name);
      safeSetText("address", documentData.address);
      safeSetText("name", documentData.name);
      safeSetText("department", documentData.department);  // Setting the department field
      safeSetText("departmentexpense", documentData.departmentexpense);
      safeSetText("qcmname", documentData.qcmname);
      safeSetText("timestamp", documentData.timestamp);
  
      // ----- Mapping Request Details Text Fields -----
      const rawRequestDetailsValue = documentData.requestDetails;
      const requestDetailsValue = cleanString(rawRequestDetailsValue);
      console.log("Request Details Value (cleaned):", requestDetailsValue);
      requestDetailsOptions.forEach((option, index) => {
        const optionValue = cleanString(option.value);
        if (requestDetailsValue === optionValue) {
          const fieldName = `box${index + 1}`;
          try {
            const textField = form.getTextField(fieldName);
            textField.setText(tickSymbol);
            textField.updateAppearances(thaiFont);
            console.log(`Set tick symbol in text field ${fieldName}`);
          } catch (error) {
            console.error(`Error processing ${fieldName}:`, error);
          }
        }
      });
      // ----- End Mapping Request Details -----
  
      // ----- Mapping Remark Text Field and Description Fields -----
      const rawRemarkValue = documentData.remark;
      const remarkValue = cleanString(rawRemarkValue);
      console.log("Remark Value (cleaned):", remarkValue);
      if (remarkValue !== "") {
        try {
          const fieldName = "box8";
          const textField = form.getTextField(fieldName);
          textField.setText(tickSymbol);
          textField.updateAppearances(thaiFont);
          console.log(`Set tick symbol in text field ${fieldName}`);
        } catch (error) {
          console.error("Error processing remark text field:", error);
        }
        const chunkSize = 50;
        const chunks = [];
        for (let i = 0; i < rawRemarkValue.length; i += chunkSize) {
          chunks.push(rawRemarkValue.substring(i, i + chunkSize));
        }
        if (chunks[0]) safeSetText("desc1", chunks[0]);
        if (chunks[1]) safeSetText("desc2", chunks[1]);
        if (chunks[2]) safeSetText("desc3", chunks[2]);
      }
      // ----- End Mapping Remark -----
  
      // Fill product-level fields (for up to 5 products).
      items.slice(0, 5).forEach((item, index) => {
        safeSetText(`productid${index + 1}`, item.product_id || "");
        safeSetText(`serialnumber${index + 1}`, item.sn_number || "");
        safeSetText(`remark${index + 1}`, item.remark || "");
        safeSetText(`qcmremark${index + 1}`, item.QcmRemark || "");
      });
  
      form.flatten();
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };
  
  // Helper function to extract department name from saleco and clean the name
  const extractDepartment = (salecoName) => {
    if (!salecoName) return { nameWithoutDepartment: "N/A", departmentName: "N/A" };
  
    const departmentKeyword = "แผนก";
    const departmentIndex = salecoName.indexOf(departmentKeyword);
  
    if (departmentIndex !== -1) {
      const departmentName = salecoName.substring(departmentIndex + departmentKeyword.length).trim();
      const nameWithoutDepartment = salecoName.substring(0, departmentIndex).trim();
      
      // Clean the department name to ensure no unexpected characters
      const cleanDepartmentName = departmentName.replace(/[^a-zA-Z0-9ก-๙\s]/g, "").trim(); // Allow only Thai and alphanumeric characters
  
      return { nameWithoutDepartment, departmentName: cleanDepartmentName || "N/A" };
    }
  
    return { nameWithoutDepartment: salecoName, departmentName: "N/A" };
  };
  
  // Function to handle reset of all filters
  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedStatuses([{ value: "ALL", label: "ALL" }]);
    setSelectedCustomers([{ value: "ALL", label: "ALL" }]);
    setSelectedProductId(null);
    setSelectedSerialNumber(null);
    setProductIdInput("");
    setSerialNumberInput("");
  };
  
  // Group documents for display and pagination.
  const groupedDocuments = groupByDocumentId(documents);
  const groupedKeys = Object.keys(groupedDocuments);
  const totalPages = Math.ceil(groupedKeys.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentKeys = groupedKeys.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <Container className="py-5">
      <div className="navigation-gap"></div>
      
      <h1 className="mb-4">Documents</h1>
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Filters</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6} lg={3}>
                <Form.Group controlId="startDate" className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select Start Date"
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={3}>
                <Form.Group controlId="endDate" className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select End Date"
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={3}>
                <Form.Group controlId="statusFilter" className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Select
                    isMulti
                    options={[
                      { value: "ALL", label: "ALL" },
                      { value: "Pass QC", label: "Pass QC" },
                      { value: "Fail QC", label: "Fail QC" },
                      // Add more options if needed
                    ]}
                    value={selectedStatuses}
                    onChange={handleStatusChange}
                    getOptionLabel={(e) => e.label}
                    getOptionValue={(e) => e.value}
                    placeholder="Select status"
                    className="basic-multi-select"
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={3}>
                <Form.Group controlId="customerFilter" className="mb-3">
                  <Form.Label>Customer Name</Form.Label>
                  <Select
                    isMulti
                    options={customerOptions}
                    value={selectedCustomers}
                    onChange={handleCustomerChange}
                    getOptionLabel={(e) => e.label}
                    getOptionValue={(e) => e.value}
                    placeholder="Select customers"
                    className="basic-multi-select"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6} lg={4}>
                <Form.Group controlId="productIdFilter" className="mb-3">
                  <Form.Label>Product ID</Form.Label>
                  <AsyncSelect
                    cacheOptions
                    loadOptions={loadProductIds}
                    defaultOptions={productIdOptions}
                    onInputChange={handleProductIdInputChange}
                    onChange={handleProductIdChange}
                    value={selectedProductId}
                    placeholder="Type at least 2 characters to search..."
                    isClearable
                    noOptionsMessage={() => 
                      productIdInput.length < 2 
                        ? "Type at least 2 characters to search" 
                        : "No matching products found"
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4}>
                <Form.Group controlId="serialNumberFilter" className="mb-3">
                  <Form.Label>Serial Number</Form.Label>
                  <AsyncSelect
                    cacheOptions
                    loadOptions={loadSerialNumbers}
                    defaultOptions={serialNumberOptions}
                    onInputChange={handleSerialNumberInputChange}
                    onChange={handleSerialNumberChange}
                    value={selectedSerialNumber}
                    placeholder="Type at least 2 characters to search..."
                    isClearable
                    noOptionsMessage={() => 
                      serialNumberInput.length < 2 
                        ? "Type at least 2 characters to search" 
                        : "No matching serial numbers found"
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={12} lg={4} className="d-flex align-items-end justify-content-end">
                <Button variant="secondary" onClick={handleResetFilters} className="me-2">
                  Reset Filters
                </Button>
                <Button variant="primary" onClick={handleFilter} className="me-2">
                  Apply Filters
                </Button>
                <Button variant="success" onClick={handleExportExcel}>
                  Export Excel
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading documents...</p>
        </div>
      ) : groupedKeys.length === 0 ? (
        <div className="text-center py-4">
          <p className="mb-0">No documents found matching the selected filters.</p>
        </div>
      ) : (
        <>
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr className="bg-light">
                    <th>Document ID</th>
                    <th>Customer Name</th>
                    <th>Name</th>
                    <th>Date</th>
                    <th style={{ width: "50px" }}>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {currentKeys.map((docId) => {
                    const items = groupedDocuments[docId];
                    const item = items[0];
                    const documentDate = item.timestamp
                      ? new Date(item.timestamp).toLocaleDateString("en-GB")
                      : "N/A";
                    
                    // Check if any item in the group has a PDF URL
                    const hasPdfUrl = items.some(item => item.pdf_url && item.pdf_url.trim() !== "");
                    const pdfUrl = hasPdfUrl ? 
                      getFirstNonEmptyValue("pdf_url", items) : null;
                    
                    return (
                      <tr key={docId}>
                        <td>{docId}</td>
                        <td>{item.customer_name || "N/A"}</td>
                        <td>{item.name || "N/A"}</td>
                        <td>{documentDate}</td>
                        <td className="text-center">
                          {hasPdfUrl ? (
                            <button
                              onClick={() => handleOpenPdf(pdfUrl)}
                              className="pdf-button"
                              title="Open PDF"
                            >
                              <i className="pdf-icon">➡️</i>
                            </button>
                          ) : (
                            <span className="no-pdf">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-4">
              <Pagination.First
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() =>
                  setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
                }
                disabled={currentPage === 1}
              />
              {Array.from({ length: totalPages }, (_, idx) => {
                const page = idx + 1;
                return (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Pagination.Item>
                );
              })}
              <Pagination.Next
                onClick={() =>
                  setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
                }
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          )}
        </>
      )}
      
      <style jsx>{`
        .navigation-gap {
          height: 70px; /* Adjust based on your navigation bar height */
        }
        
        .pdf-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          transition: transform 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .pdf-button:hover {
          transform: scale(1.2);
        }
        
        .pdf-icon {
          font-size: 1.25rem;
        }
        
        .no-pdf {
          color: #ccc;
          font-weight: bold;
        }
        
        /* Improve the look of the date pickers */
        .react-datepicker-wrapper {
          width: 100%;
        }
        
        /* Improve Select styling */
        .basic-multi-select {
          width: 100%;
        }
        
        /* Table styling improvements */
        thead th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        
        tbody tr:hover {
          background-color: #f1f8e9 !important;
        }
      `}</style>
    </Container>
  );
};

export default Document;