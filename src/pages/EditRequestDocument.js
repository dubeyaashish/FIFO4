import React, { useState, useEffect } from 'react';
import { generatePdf } from './pdfGenerator';

const EditRequestDocument = () => {
  // State variables
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedData, setSelectedData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [selectedSerial, setSelectedSerial] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bannersPerPage = 5;

  // Helper functions
  const normalizedName = (name) => {
    if (!name) return '';
    return name.includes("แผนก") ? name.split("แผนก")[0].trim() : name.trim();
  };

  const parseNameAndDepartment = (fullName) => {
    let requesterName = fullName;
    let department = '';
    if (fullName && fullName.includes("แผนก")) {
      const parts = fullName.split("แผนก");
      requesterName = parts[0].trim();
      department = parts[1].trim();
    }
    return { requesterName, department };
  };

  // API calls
  const fetchUserDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Redirecting to login...");
      window.location.href = "/login";
      return;
    }
    try {
      const response = await fetch("https://saleco.ruu-d.com/user-details", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user details");
      const data = await response.json();
      setUserName(data.fullName);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Failed to fetch user details. Please try again.");
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userName) {
      console.error("Token or user name missing. Redirecting to login...");
      window.location.href = "/login";
      return;
    }
    const apiUrl = 'https://saleco.ruu-d.com/sale-co/history';
    try {
      console.log(`Fetching data for user: ${userName}`);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (Array.isArray(result)) {
        const userSpecificData = result.filter(item => 
          normalizedName(item.name) === normalizedName(userName) &&
          item.status &&
          (item.status.toLowerCase().includes("fail qc") || item.status.toLowerCase().includes("declined")) &&
          item.note !== "Re-requested"
        );
        setData(userSpecificData);
      } else {
        throw new Error('API response is not an array.');
      }
    } catch (err) {
      console.error('Error during fetch:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSerialNumbers = async (productId) => {
    try {
      const response = await fetch(`https://saleco.ruu-d.com/products?search_item_code=${productId}`);
      if (!response.ok) throw new Error("Failed to fetch serial numbers.");
      const data = await response.json();
      const availableSerials = data.remainingSerialsDetails.filter(
        serial => serial.status === "Available"
      );
      setSerialNumbers(availableSerials);
    } catch (error) {
      console.error("Error fetching serial numbers:", error.message);
    }
  };

  // Event handlers
  const toggleExpand = (documentId) => {
    setExpanded((prevState) => ({
      ...prevState,
      [documentId]: !prevState[documentId],
    }));
  };

  const handleNext = () => {
    if (currentPage < Math.ceil(groupedDataArray.length / bannersPerPage) - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleReRequest = (rowData) => {
    setSelectedData(rowData);
    fetchSerialNumbers(rowData.product_id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedData(null);
    setSelectedSerial("");
    setSerialNumbers([]);
  };

  // Updated handleSubmit that captures the PDF URL and includes it in the Telegram message.
  const handleSubmit = async () => {
    if (!selectedData || !selectedSerial) {
      alert("Please select a serial number.");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
  
      // Prepare new request data with the new serial.
      const newRequestData = {
        ...selectedData,
        sn_number: selectedSerial,
        note: "",
      };
  
      // Prepare updateData with the old serial details.
      const updateData = {
        document_id: selectedData.document_id,
        sn_number: selectedData.sn_number,
      };
  
      // Call the re-request endpoint with both insertData and updateData.
      const newResponse = await fetch(`https://saleco.ruu-d.com/sale-co/re-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ insertData: newRequestData, updateData }),
      });
      if (!newResponse.ok) {
        throw new Error("Failed to submit the re-request with new serial.");
      }
      // We don't get documentId in the response, so use the existing document_id.
      const documentId = selectedData.document_id;
  
      // Prepare formData for PDF generation based on selectedData fields.
      const formData = {
        wantDate: selectedData.wantDate,
        customerName: selectedData.customer_name,
        customerAddress: selectedData.customer_address,
        requestDetails: selectedData.รายละเอียดการแจ้งงาน,
        remark: selectedData.remark,
        departmentExpense: selectedData.departmentExpense || "",
      };
  
      // Generate the updated PDF and capture its URL using your pdfGenerator.js.
      const pdfUrl = await generatePdf(
        documentId,
        formData,
        userName,
        parseNameAndDepartment(selectedData.name).department
      );
  
      // Build a Telegram message including the PDF URL.
      const timestamp = new Date().toLocaleString();
      const pdfMessage = pdfUrl
        ? `<b>📥 PDF เอกสาร:</b> ${pdfUrl}`
        : `<b>📄 Document ID:</b> ${documentId} (PDF will be available soon)`;
      const telegramMessage = `<b>🔥 Document Updated!</b>
  <b>📄 Document ID:</b> ${documentId}
  <b>🔢 New Serial:</b> ${selectedSerial}
  <b>🕒 Updated at:</b> ${timestamp}
  ${pdfMessage}`;
  
      // Send Telegram notifications to both chats.
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
  
      alert("Re-request submitted successfully with updated serial.");
      closeModal();
      fetchData();
    } catch (error) {
      console.error("Error submitting re-request:", error.message);
      alert("Failed to submit the re-request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Group data by document_id for pagination
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.document_id]) {
      acc[item.document_id] = [];
    }
    acc[item.document_id].push(item);
    return acc;
  }, {});

  const groupedDataArray = Object.entries(groupedData);
  const startIndex = currentPage * bannersPerPage;
  const endIndex = startIndex + bannersPerPage;
  const paginatedData = groupedDataArray.slice(startIndex, endIndex);
  const totalPages = Math.ceil(groupedDataArray.length / bannersPerPage);

  // Side effects
  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (userName) {
      fetchData();
    }
  }, [userName]);

  // UI Components
  const LoadingState = () => (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading document data...</p>
    </div>
  );

  const ErrorState = ({ message }) => (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3>Error Loading Data</h3>
      <p>{message}</p>
      <button onClick={fetchData} className="retry-button">Retry</button>
    </div>
  );

  const EmptyState = () => (
    <div className="empty-container">
      <div className="empty-icon">📄</div>
      <h3>No Failed Documents Found</h3>
      <p>There are no failed QC or declined documents that require your attention.</p>
    </div>
  );

  const DocumentCard = ({ documentId, items }) => {
    const basicData = items[0];
    const { requesterName, department } = parseNameAndDepartment(basicData.name);
    const isExpanded = expanded[documentId] || false;
    
    return (
      <div className={`document-card ${isExpanded ? 'expanded' : ''}`}>
        <div className="document-header">
          <div className="document-info">
            <h4 className="document-title">Document ID: {documentId}</h4>
            <div className="document-meta">
              <div className="meta-item">
                <span className="meta-label">Requester:</span>
                <span className="meta-value">{requesterName}</span>
              </div>
              {department && (
                <div className="meta-item">
                  <span className="meta-label">Department:</span>
                  <span className="meta-value">{department}</span>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-label">Product ID:</span>
                <span className="meta-value">{basicData.product_id}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Date:</span>
                <span className="meta-value">
                  {new Date(basicData.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
          <button 
            className={`toggle-button ${isExpanded ? 'active' : ''}`}
            onClick={() => toggleExpand(documentId)}
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        {isExpanded && (
          <div className="document-details">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Serial Number</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.sn_number}>
                      <td>{item.sn_number}</td>
                      <td>
                        <span className={`status-badge ${
                          item.status.toLowerCase().includes("fail") 
                            ? "status-failed" 
                            : "status-declined"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {new Date(item.timestamp).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <button
                          className="action-button"
                          onClick={() => handleReRequest(item)}
                        >
                          Re-Request
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ModalComponent = () => {
    if (!showModal || !selectedData) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Submit Re-Request</h3>
            <button className="close-button" onClick={closeModal}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Customer Name</label>
              <input type="text" value={selectedData.customer_name || ''} disabled />
            </div>
            <div className="form-group">
              <label>Customer Address</label>
              <input type="text" value={selectedData.customer_address || ''} disabled />
            </div>
            <div className="form-group">
                <label>Department Expense</label>
                <input type="text" value={selectedData.departmentExpense} disabled />
            </div>
            <div className="form-group">
              <label>Want Date</label>
              <input
                type="text"
                value={selectedData.wantDate ? new Date(selectedData.wantDate).toLocaleDateString('en-GB') : ''}
                disabled
              />
            </div>
            <div className="form-group">
              <label>รายละเอียดการแจ้งงาน</label>
              <input
                type="text"
                value={(Array.isArray(selectedData.รายละเอียดการแจ้งงาน)
                  ? selectedData.รายละเอียดการแจ้งงาน.join(', ')
                  : selectedData.รายละเอียดการแจ้งงาน) || ''}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Product ID</label>
              <input type="text" value={selectedData.product_id || ''} disabled />
            </div>
            <div className="form-group">
              <label>Serial Number <span className="required">*</span></label>
              <select
                value={selectedSerial}
                onChange={(e) => setSelectedSerial(e.target.value)}
                className={!selectedSerial ? 'highlight' : ''}
              >
                <option value="">Select Serial Number</option>
                {serialNumbers.map((serial, idx) => (
                  <option key={idx} value={serial.serial}>
                    {serial.serial}
                  </option>
                ))}
              </select>
              {!selectedSerial && <span className="error-text">Please select a serial number</span>}
            </div>
          </div>
          <div className="modal-footer">
            <button className="cancel-button" onClick={closeModal}>Cancel</button>
            <button
              className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedSerial}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  <span>Submitting...</span>
                </>
              ) : "Submit Request"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PaginationComponent = () => (
    <div className="pagination">
      <button
        className={`pagination-button ${currentPage === 0 ? 'disabled' : ''}`}
        onClick={handlePrevious}
        disabled={currentPage === 0}
      >
        <span className="pagination-arrow">←</span> Previous
      </button>
      <div className="pagination-info">
        Page {currentPage + 1} of {totalPages || 1}
      </div>
      <button
        className={`pagination-button ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}
        onClick={handleNext}
        disabled={currentPage >= totalPages - 1}
      >
        Next <span className="pagination-arrow">→</span>
      </button>
    </div>
  );

  return (
    <div className="edit-request-container">
      <div className="navigation-gap"></div>
      <div className="page-header">
        <h2>Failed QC / Declined Documents</h2>
        <p className="subtitle">Review and resubmit documents that require your attention</p>
      </div>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : paginatedData.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="documents-list">
            {paginatedData.map(([documentId, items]) => (
              <DocumentCard key={documentId} documentId={documentId} items={items} />
            ))}
          </div>
          {totalPages > 1 && <PaginationComponent />}
        </>
      )}
      <ModalComponent />
      <style jsx>{`
        /* Global Styles */
        .edit-request-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          color: #333;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        .navigation-gap {
          height: 70px;
        }
        .page-header {
          margin-bottom: 2rem;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 1rem;
        }
        .page-header h2 {
          margin: 0 0 0.5rem 0;
          color: #2e7d32;
          font-size: 1.75rem;
          font-weight: 600;
        }
        .subtitle {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }
        .document-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 1.5rem;
          overflow: hidden;
          border: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }
        .document-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }
        .document-card.expanded {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }
        .document-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.25rem;
          background-color: #f8f9fa;
          border-bottom: 1px solid #eaeaea;
        }
        .document-info {
          flex: 1;
        }
        .document-title {
          margin: 0 0 1rem 0;
          color: #2e7d32;
          font-size: 1.25rem;
          font-weight: 600;
        }
        .document-meta {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem 2rem;
        }
        .meta-item {
          display: flex;
          flex-direction: column;
          margin-bottom: 0.25rem;
        }
        .meta-label {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 0.25rem;
        }
        .meta-value {
          font-weight: 500;
          color: #333;
        }
        .toggle-button {
          background-color: #2e7d32;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.6rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .toggle-button:hover {
          background-color: #1b5e20;
        }
        .toggle-button.active {
          background-color: #546e7a;
        }
        .toggle-button.active:hover {
          background-color: #455a64;
        }
        .document-details {
          padding: 1.5rem;
        }
        .table-container {
          margin-bottom: 1.5rem;
          overflow-x: auto;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }
        .data-table th {
          text-align: left;
          padding: 0.8rem 1rem;
          background-color: #f5f5f5;
          border-bottom: 2px solid #e0e0e0;
          color: #555;
          font-weight: 600;
        }
        .data-table td {
          padding: 0.8rem 1rem;
          border-bottom: 1px solid #eaeaea;
          vertical-align: middle;
        }
        .data-table tr:hover {
          background-color: #f9f9f9;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.35rem 0.7rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-failed {
          background-color: #ffebee;
          color: #d32f2f;
        }
        .status-declined {
          background-color: #fff8e1;
          color: #f57c00;
        }
        .action-button {
          background-color: #2e7d32;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 0.8rem;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-button:hover {
          background-color: #1b5e20;
        }
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #eaeaea;
        }
        .pagination-button {
          background-color: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 0.7rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .pagination-button:hover:not(.disabled) {
          background-color: #e0e0e0;
        }
        .pagination-button.disabled {
          color: #aaa;
          background-color: #f9f9f9;
          cursor: not-allowed;
        }
        .pagination-arrow {
          font-size: 1.1rem;
          line-height: 1;
        }
        .pagination-info {
          font-size: 0.9rem;
          color: #666;
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #2e7d32;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1.5rem;
        }
        .spinner-small {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 2px solid #fff;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .error-container {
          text-align: center;
          padding: 3rem 2rem;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #d32f2f;
        }
        .error-container h3 {
          margin: 0 0 1rem 0;
          color: #d32f2f;
        }
        .error-container p {
          margin: 0 0 1.5rem 0;
          color: #666;
        }
        .retry-button {
          background-color: #2e7d32;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.7rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .retry-button:hover {
          background-color: #1b5e20;
        }
        .empty-container {
          text-align: center;
          padding: 4rem 2rem;
          background-color: #f9f9f9;
          border-radius: 8px;
          border: 1px dashed #ddd;
        }
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #9e9e9e;
        }
        .empty-container h3 {
          margin: 0 0 0.5rem 0;
          color: #616161;
        }
        .empty-container p {
          margin: 0;
          color: #757575;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          width: 500px;
          max-width: 90%;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          animation: modalFadeIn 0.3s ease;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          background-color: #f8f9fa;
          border-bottom: 1px solid #eaeaea;
        }
        .modal-header h3 {
          margin: 0;
          color: #2e7d32;
          font-size: 1.25rem;
          font-weight: 600;
        }
        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #666;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }
        .close-button:hover {
          color: #333;
        }
        .modal-body {
          padding: 1.5rem;
          max-height: 70vh;
          overflow-y: auto;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: block;
          font-size: 0.9rem;
          color: #555;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.95rem;
          color: #333;
          background-color: #f9f9f9;
          transition: all 0.2s;
        }
        .form-group input:disabled {
          background-color: #f5f5f5;
          color: #666;
          cursor: not-allowed;
        }
        .form-group select:hover:not(:disabled) {
          border-color: #aaa;
        }
        .form-group select:focus:not(:disabled) {
          border-color: #2e7d32;
          outline: none;
          box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.2);
        }
        .form-group select.highlight {
          border-color: #f44336;
        }
        .required {
          color: #d32f2f;
          margin-left: 2px;
        }
        .error-text {
          color: #d32f2f;
          font-size: 0.8rem;
          margin-top: 0.5rem;
          display: block;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          background-color: #f8f9fa;
          border-top: 1px solid #eaeaea;
        }
        .cancel-button {
          background-color: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cancel-button:hover {
          background-color: #e0e0e0;
        }
        .submit-button {
          background-color: #2e7d32;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .submit-button:hover:not(:disabled) {
          background-color: #1b5e20;
        }
        .submit-button:disabled {
          background-color: #a5d6a7;
          cursor: not-allowed;
        }
        .submit-button.submitting {
          background-color: #a5d6a7;
        }
      `}</style>
    </div>
  );
};

export default EditRequestDocument;
