import React, { useState, useEffect } from 'react';

const ExternalServiceForm = () => {
  // Form state for location/company information
  const [locationData, setLocationData] = useState({
    siteName: '',
    address: '',
    postalCode: '',
    district: '',
    subDistrict: '',
    province: '',
    billingAddress: '',
  });

  // Form state for contact information
  const [contactData, setContactData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    productCode: '',
    quantity: '',
    warrantyStartDate: '',
    warrantyPeriod: '',
    warrantyParts: '',
    serviceFrequency: '',
    propertyAddress: '',
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [documentId, setDocumentId] = useState('');

  // Validation state
  const [errors, setErrors] = useState({});

  // State for insurance type data and suggestions
  const [insuranceData, setInsuranceData] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState({
    productCode: [],
    warrantyPeriod: [],
    serviceFrequency: [],
    warrantyParts: [],
  });
  const [showSuggestions, setShowSuggestions] = useState({
    productCode: false,
    warrantyPeriod: false,
    serviceFrequency: false,
    warrantyParts: false,
  });

  // Fetch insurance type data
  useEffect(() => {
    const fetchInsuranceData = async () => {
      try {
        const response = await fetch('https://saleco.ruu-d.com/sale-co/insurance-types');
        if (!response.ok) {
          throw new Error(`Failed to fetch insurance data: ${response.status}`);
        }
        const data = await response.json();
        setInsuranceData(data);
      } catch (error) {
        console.error('Error fetching insurance data:', error);
        setErrorMessage('Could not load insurance data. You can still submit the form manually.');
        setShowErrorMessage(true);
      }
    };
    fetchInsuranceData();
  }, []);

  // Initialize jquery.Thailand.js for address fields
  useEffect(() => {
    if (window.jQuery && window.jQuery.Thailand) {
      window.jQuery.Thailand({
        $district: window.jQuery('#subDistrict'),
        $amphoe: window.jQuery('#district'),
        $province: window.jQuery('#province'),
        $zipcode: window.jQuery('#postalCode'),
      });

      const fields = [
        { id: 'subDistrict', stateKey: 'subDistrict' },
        { id: 'district', stateKey: 'district' },
        { id: 'province', stateKey: 'province' },
        { id: 'postalCode', stateKey: 'postalCode' },
      ];

      fields.forEach(({ id, stateKey }) => {
        window.jQuery(`#${id}`).on('change', (e) => {
          setLocationData((prev) => ({
            ...prev,
            [stateKey]: e.target.value,
          }));
          if (errors[stateKey]) {
            setErrors((prev) => ({ ...prev, [stateKey]: '' }));
          }
        });
      });
    }
  }, [errors]);

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Location validation
    if (!locationData.siteName.trim()) newErrors.siteName = 'Site name is required';
    if (!locationData.address.trim()) newErrors.address = 'Address is required';
    if (!locationData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!locationData.district.trim()) newErrors.district = 'District is required';
    if (!locationData.subDistrict.trim()) newErrors.subDistrict = 'Sub-district is required';
    if (!locationData.province.trim()) newErrors.province = 'Province is required';

    // Contact validation
    if (!contactData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!contactData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!contactData.email.trim()) newErrors.email = 'Email is required';
    if (!contactData.productCode.trim()) newErrors.productCode = 'Product code is required';
    if (!contactData.quantity.trim()) newErrors.quantity = 'Quantity is required';

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contactData.email && !emailRegex.test(contactData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone number validation
    const phoneRegex = /^[0-9-+\s()]+$/;
    if (contactData.phoneNumber && !phoneRegex.test(contactData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission with improved data mapping
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create payload that matches your backend's exact field names
      const payload = {
        // Customer information (matches your backend fields exactly)
        customerName: contactData.fullName,
        customerAddress: `${locationData.address}, ${locationData.subDistrict}, ${locationData.district}, ${locationData.province}, ${locationData.postalCode}`,
        phone_number: contactData.phoneNumber,  // Fixed: phone_number not phoneNumber
        email: contactData.email,
        
        // Location information
        siteName: locationData.siteName,
        billingAddress: locationData.billingAddress || locationData.address,
        property_address: contactData.propertyAddress || locationData.address,  // Fixed: property_address not propertyAddress
        
        // Product information
        product_id: contactData.productCode,  // Fixed: product_id not productCode
        quantity: parseInt(contactData.quantity) || 1,
        
        // Warranty information (correct field names)
        warrantyStartDate: contactData.warrantyStartDate || null,
        warrantyPeriod: contactData.warrantyPeriod || null,
        warrantyParts: contactData.warrantyParts || null,
        serviceFrequency: contactData.serviceFrequency || null,
        
        // Request metadata
        requestSource: 'external_form',
        requestType: 'customer_service',
        wantDate: new Date().toISOString().split('T')[0],
        
        // Request details as array (your backend expects this)
        requestDetails: [`Service request for ${contactData.productCode} (Qty: ${contactData.quantity}) at ${locationData.siteName}`],
        
        // Remark for additional notes
        remark: contactData.warrantyParts ? `Warranty parts: ${contactData.warrantyParts}` : 'External customer service request',
      };

      console.log('Sending payload:', payload); // Debug log

      const response = await fetch('https://saleco.ruu-d.com/external/service-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Get response text first to see what the server is returning
      const responseText = await response.text();
      console.log('Server response status:', response.status); // Debug log
      console.log('Server response:', responseText); // Debug log

      if (!response.ok) {
        // Try to parse error details
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = `Server error: ${response.status} - ${responseText}`;
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        result = { message: 'Request submitted successfully', success: true };
      }

      setDocumentId(result.documentId || result.document_id || result.id || `EXT-${Date.now()}`);
      setShowSuccessMessage(true);

      // Reset form
      setLocationData({
        siteName: '',
        address: '',
        postalCode: '',
        district: '',
        subDistrict: '',
        province: '',
        billingAddress: '',
      });
      setContactData({
        fullName: '',
        phoneNumber: '',
        email: '',
        productCode: '',
        quantity: '',
        warrantyStartDate: '',
        warrantyPeriod: '',
        warrantyParts: '',
        serviceFrequency: '',
        propertyAddress: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage(error.message || 'An error occurred while submitting your request. Please try again.');
      setShowErrorMessage(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle location input changes
  const handleLocationChange = (field, value) => {
    setLocationData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Handle contact input changes
  const handleContactChange = (field, value) => {
    setContactData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Improved suggestion handling
  const getSuggestions = (value, field) => {
    const inputValue = value.trim().toLowerCase();
    if (inputValue.length === 0) return [];

    const fieldMap = {
      productCode: 'product_code',
      warrantyPeriod: 'warranty_period',
      serviceFrequency: 'service_period',
      warrantyParts: 'insured_part',
    };

    const uniqueValues = [...new Set(insuranceData.map((item) => item[fieldMap[field]]).filter(Boolean))];
    return uniqueValues.filter((val) =>
      val.toLowerCase().includes(inputValue)
    ).slice(0, 10);
  };

  const handleInputFocus = (field) => {
    const suggestions = getSuggestions(contactData[field], field);
    setFilteredSuggestions(prev => ({ ...prev, [field]: suggestions }));
    setShowSuggestions(prev => ({ ...prev, [field]: true }));
  };

  const handleInputChange = (field, value) => {
    handleContactChange(field, value);
    const suggestions = getSuggestions(value, field);
    setFilteredSuggestions(prev => ({ ...prev, [field]: suggestions }));
    setShowSuggestions(prev => ({ ...prev, [field]: suggestions.length > 0 }));
  };

  const handleSuggestionClick = (field, suggestion) => {
    if (field === 'productCode') {
      const selectedRecord = insuranceData.find(item => item.product_code === suggestion);
      if (selectedRecord) {
        setContactData(prev => ({
          ...prev,
          productCode: suggestion,
          warrantyPeriod: selectedRecord.warranty_period || '',
          serviceFrequency: selectedRecord.service_period || '',
          warrantyParts: selectedRecord.insured_part || '',
        }));
      } else {
        handleContactChange('productCode', suggestion);
      }
    } else {
      handleContactChange(field, suggestion);
    }
    setShowSuggestions(prev => ({ ...prev, [field]: false }));
  };

  const hideSuggestions = (field) => {
    setTimeout(() => {
      setShowSuggestions(prev => ({ ...prev, [field]: false }));
    }, 200);
  };

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '2rem 1rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    maxWidth: {
      maxWidth: '1000px',
      margin: '0 auto',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #e9ecef',
      marginBottom: '1.5rem',
    },
    header: {
      textAlign: 'center',
      padding: '2rem',
      borderBottom: '1px solid #e9ecef',
    },
    headerIcon: {
      fontSize: '2rem',
      marginBottom: '1rem',
      display: 'block',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '0.5rem',
      margin: 0,
    },
    subtitle: {
      color: '#666',
      fontSize: '1rem',
      margin: 0,
    },
    sectionHeader: {
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #e9ecef',
      display: 'flex',
      alignItems: 'center',
    },
    sectionIcon: {
      fontSize: '1.2rem',
      marginRight: '0.5rem',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#333',
      margin: 0,
    },
    sectionContent: {
      padding: '1.5rem',
    },
    formGroup: {
      marginBottom: '1rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: '#333',
      fontSize: '0.9rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '1rem',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
    },
    inputFocus: {
      outline: 'none',
      borderColor: '#007bff',
      boxShadow: '0 0 0 2px rgba(0,123,255,0.25)',
    },
    inputError: {
      borderColor: '#dc3545',
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '1rem',
      resize: 'vertical',
      minHeight: '80px',
      boxSizing: 'border-box',
    },
    row: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem',
    },
    errorText: {
      color: '#dc3545',
      fontSize: '0.8rem',
      marginTop: '0.25rem',
    },
    submitContainer: {
      textAlign: 'center',
      padding: '1.5rem',
    },
    submitButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '0.75rem 2rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      transition: 'background-color 0.2s',
    },
    submitButtonHover: {
      backgroundColor: '#0056b3',
    },
    submitButtonDisabled: {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '2rem',
      maxWidth: '500px',
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    modalIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
      display: 'block',
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#333',
      marginBottom: '0.5rem',
    },
    modalText: {
      color: '#666',
      marginBottom: '1rem',
      fontSize: '0.9rem',
    },
    referenceBox: {
      backgroundColor: '#d4edda',
      border: '1px solid #c3e6cb',
      color: '#155724',
      padding: '0.75rem',
      borderRadius: '6px',
      margin: '1rem 0',
      fontSize: '0.9rem',
    },
    closeButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '0.5rem 1.5rem',
      cursor: 'pointer',
      fontSize: '0.9rem',
      width: '100%',
    },
    closeButtonError: {
      backgroundColor: '#dc3545',
    },
    suggestionContainer: {
      position: 'relative',
    },
    suggestionList: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '6px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      zIndex: 1000,
      maxHeight: '200px',
      overflowY: 'auto',
      marginTop: '2px',
    },
    suggestionItem: {
      padding: '0.75rem',
      cursor: 'pointer',
      borderBottom: '1px solid #f8f9fa',
    },
    suggestionItemHover: {
      backgroundColor: '#f8f9fa',
    },
    spinner: {
      animation: 'spin 1s linear infinite',
      display: 'inline-block',
      marginRight: '0.5rem',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.card}>
          <div style={styles.header}>
            <span style={styles.headerIcon}>📦</span>
            <h1 style={styles.title}>Customer Service Request</h1>
            <p style={styles.subtitle}>Submit your service request and our team will process it promptly</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Location Information Section */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>📍</span>
              <h2 style={styles.sectionTitle}>Location Information</h2>
            </div>
            <div style={styles.sectionContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Site/Location Name *</label>
                <input
                  type="text"
                  placeholder="Enter site/location name"
                  value={locationData.siteName}
                  onChange={(e) => handleLocationChange('siteName', e.target.value)}
                  style={{
                    ...styles.input,
                    ...(errors.siteName ? styles.inputError : {}),
                  }}
                />
                {errors.siteName && (
                  <div style={styles.errorText}>{errors.siteName}</div>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Detailed Address *</label>
                <textarea
                  placeholder="Enter detailed address"
                  value={locationData.address}
                  onChange={(e) => handleLocationChange('address', e.target.value)}
                  style={{
                    ...styles.textarea,
                    ...(errors.address ? styles.inputError : {}),
                  }}
                />
                {errors.address && (
                  <div style={styles.errorText}>{errors.address}</div>
                )}
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Postal Code *</label>
                  <input
                    id="postalCode"
                    type="text"
                    placeholder="Postal code"
                    value={locationData.postalCode}
                    onChange={(e) => handleLocationChange('postalCode', e.target.value)}
                    style={{
                      ...styles.input,
                      ...(errors.postalCode ? styles.inputError : {}),
                    }}
                  />
                  {errors.postalCode && (
                    <div style={styles.errorText}>{errors.postalCode}</div>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Sub-district *</label>
                  <input
                    id="subDistrict"
                    type="text"
                    placeholder="Sub-district"
                    value={locationData.subDistrict}
                    onChange={(e) => handleLocationChange('subDistrict', e.target.value)}
                    style={{
                      ...styles.input,
                      ...(errors.subDistrict ? styles.inputError : {}),
                    }}
                  />
                  {errors.subDistrict && (
                    <div style={styles.errorText}>{errors.subDistrict}</div>
                  )}
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>District *</label>
                  <input
                    id="district"
                    type="text"
                    placeholder="District"
                    value={locationData.district}
                    onChange={(e) => handleLocationChange('district', e.target.value)}
                    style={{
                      ...styles.input,
                      ...(errors.district ? styles.inputError : {}),
                    }}
                  />
                  {errors.district && (
                    <div style={styles.errorText}>{errors.district}</div>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Province *</label>
                  <input
                    id="province"
                    type="text"
                    placeholder="Province"
                    value={locationData.province}
                    onChange={(e) => handleLocationChange('province', e.target.value)}
                    style={{
                      ...styles.input,
                      ...(errors.province ? styles.inputError : {}),
                    }}
                  />
                  {errors.province && (
                    <div style={styles.errorText}>{errors.province}</div>
                  )}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Billing Address (optional)</label>
                <input
                  type="text"
                  placeholder="Billing address (leave empty to use main address)"
                  value={locationData.billingAddress}
                  onChange={(e) => handleLocationChange('billingAddress', e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>👤</span>
              <h2 style={styles.sectionTitle}>Contact & Product Information</h2>
            </div>
            <div style={styles.sectionContent}>
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={contactData.fullName}
                    onChange={(e) => handleContactChange('fullName', e.target.value)}
                    style={{
                      ...styles.input,
                      ...(errors.fullName ? styles.inputError : {}),
                    }}
                  />
                  {errors.fullName && (
                    <div style={styles.errorText}>{errors.fullName}</div>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={contactData.phoneNumber}
                    onChange={(e) => handleContactChange('phoneNumber', e.target.value)}
                    style={{
                      ...styles.input,
                      ...(errors.phoneNumber ? styles.inputError : {}),
                    }}
                  />
                  {errors.phoneNumber && (
                    <div style={styles.errorText}>{errors.phoneNumber}</div>
                  )}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address *</label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={contactData.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  style={{
                    ...styles.input,
                    ...(errors.email ? styles.inputError : {}),
                  }}
                />
                {errors.email && (
                  <div style={styles.errorText}>{errors.email}</div>
                )}
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Code *</label>
                  <div style={styles.suggestionContainer}>
                    <input
                      type="text"
                      placeholder="Product code"
                      value={contactData.productCode}
                      onChange={(e) => handleInputChange('productCode', e.target.value)}
                      onFocus={() => handleInputFocus('productCode')}
                      onBlur={() => hideSuggestions('productCode')}
                      style={{
                        ...styles.input,
                        ...(errors.productCode ? styles.inputError : {}),
                      }}
                    />
                    {showSuggestions.productCode && filteredSuggestions.productCode.length > 0 && (
                      <div style={styles.suggestionList}>
                        {filteredSuggestions.productCode.map((suggestion, index) => (
                          <div
                            key={index}
                            style={styles.suggestionItem}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSuggestionClick('productCode', suggestion)}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = styles.suggestionItemHover.backgroundColor;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.productCode && (
                    <div style={styles.errorText}>{errors.productCode}</div>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    value={contactData.quantity}
                    onChange={(e) => handleContactChange('quantity', e.target.value)}
                    style={{
                      ...styles.input,
                      ...(errors.quantity ? styles.inputError : {}),
                    }}
                  />
                  {errors.quantity && (
                    <div style={styles.errorText}>{errors.quantity}</div>
                  )}
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Warranty Start Date</label>
                  <input
                    type="date"
                    value={contactData.warrantyStartDate}
                    onChange={(e) => handleContactChange('warrantyStartDate', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Warranty Period</label>
                  <div style={styles.suggestionContainer}>
                    <input
                      type="text"
                      placeholder="Warranty period"
                      value={contactData.warrantyPeriod}
                      onChange={(e) => handleInputChange('warrantyPeriod', e.target.value)}
                      onFocus={() => handleInputFocus('warrantyPeriod')}
                      onBlur={() => hideSuggestions('warrantyPeriod')}
                      style={styles.input}
                    />
                    {showSuggestions.warrantyPeriod && filteredSuggestions.warrantyPeriod.length > 0 && (
                      <div style={styles.suggestionList}>
                        {filteredSuggestions.warrantyPeriod.map((suggestion, index) => (
                          <div
                            key={index}
                            style={styles.suggestionItem}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSuggestionClick('warrantyPeriod', suggestion)}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = styles.suggestionItemHover.backgroundColor;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Service Frequency</label>
                  <div style={styles.suggestionContainer}>
                    <input
                      type="text"
                      placeholder="Service frequency"
                      value={contactData.serviceFrequency}
                      onChange={(e) => handleInputChange('serviceFrequency', e.target.value)}
                      onFocus={() => handleInputFocus('serviceFrequency')}
                      onBlur={() => hideSuggestions('serviceFrequency')}
                      style={styles.input}
                    />
                    {showSuggestions.serviceFrequency && filteredSuggestions.serviceFrequency.length > 0 && (
                      <div style={styles.suggestionList}>
                        {filteredSuggestions.serviceFrequency.map((suggestion, index) => (
                          <div
                            key={index}
                            style={styles.suggestionItem}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSuggestionClick('serviceFrequency', suggestion)}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = styles.suggestionItemHover.backgroundColor;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Warranty Parts</label>
                  <div style={styles.suggestionContainer}>
                    <input
                      type="text"
                      placeholder="Warranty parts"
                      value={contactData.warrantyParts}
                      onChange={(e) => handleInputChange('warrantyParts', e.target.value)}
                      onFocus={() => handleInputFocus('warrantyParts')}
                      onBlur={() => hideSuggestions('warrantyParts')}
                      style={styles.input}
                    />
                    {showSuggestions.warrantyParts && filteredSuggestions.warrantyParts.length > 0 && (
                      <div style={styles.suggestionList}>
                        {filteredSuggestions.warrantyParts.map((suggestion, index) => (
                          <div
                            key={index}
                            style={styles.suggestionItem}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSuggestionClick('warrantyParts', suggestion)}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = styles.suggestionItemHover.backgroundColor;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Property Address (optional)</label>
                <input
                  type="text"
                  placeholder="Property address (leave empty to use main address)"
                  value={contactData.propertyAddress}
                  onChange={(e) => handleContactChange('propertyAddress', e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={styles.card}>
            <div style={styles.submitContainer}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...styles.submitButton,
                  ...(isSubmitting ? styles.submitButtonDisabled : {}),
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = styles.submitButtonHover.backgroundColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = styles.submitButton.backgroundColor;
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <span style={styles.spinner}>⏳</span>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: '0.5rem' }}>📤</span>
                    Submit Service Request
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessMessage && (
        <div style={styles.modal} onClick={() => setShowSuccessMessage(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <span style={styles.modalIcon}>✅</span>
            <h3 style={styles.modalTitle}>Request Submitted Successfully!</h3>
            <p style={styles.modalText}>
              Thank you for your request. Your service request has been submitted and will be reviewed by our team.
            </p>
            {documentId && (
              <div style={styles.referenceBox}>
                <strong>Reference ID:</strong> {documentId}
              </div>
            )}
            <button
              style={styles.closeButton}
              onClick={() => setShowSuccessMessage(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorMessage && (
        <div style={styles.modal} onClick={() => setShowErrorMessage(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <span style={styles.modalIcon}>❌</span>
            <h3 style={styles.modalTitle}>Submission Error</h3>
            <p style={styles.modalText}>{errorMessage}</p>
            <button
              style={{
                ...styles.closeButton,
                ...styles.closeButtonError,
              }}
              onClick={() => setShowErrorMessage(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ExternalServiceForm;