import React, { useState, useEffect } from 'react';
import Autosuggest from 'react-autosuggest';

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
  const [suggestions, setSuggestions] = useState({
    productCode: [],
    warrantyPeriod: [],
    serviceFrequency: [],
    warrantyParts: [],
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
        setErrorMessage('Could not load insurance data. Using manual input.');
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
    } else {
      console.error('jQuery or jquery.Thailand.js not loaded');
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: contactData.fullName,
        customerAddress: `${locationData.address}, ${locationData.subDistrict}, ${locationData.district}, ${locationData.province}, ${locationData.postalCode}`,
        phoneNumber: contactData.phoneNumber,
        email: contactData.email,
        siteName: locationData.siteName,
        billingAddress: locationData.billingAddress || locationData.address,
        productCode: contactData.productCode,
        quantity: parseInt(contactData.quantity),
        warrantyStartDate: contactData.warrantyStartDate,
        warrantyPeriod: contactData.warrantyPeriod,
        warrantyParts: contactData.warrantyParts,
        serviceFrequency: contactData.serviceFrequency,
        propertyAddress: contactData.propertyAddress || locationData.address,
        requestSource: 'external_form',
        requestType: 'customer_service',
        timestamp: new Date().toISOString(),
        requestDetails: ['Customer Service Request from External Form'],
        remark: `External customer service request. Product: ${contactData.productCode}, Quantity: ${contactData.quantity}`,
        wantDate: new Date().toISOString().split('T')[0],
        status: 'pending_saleco_review',
      };

      const response = await fetch('https://saleco.ruu-d.com/external/service-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      setDocumentId(result.documentId || result.requestId || 'Generated');
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

  // Autosuggest handlers
  const getSuggestions = (value, field) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    if (inputLength === 0) {
      return [];
    }

    const fieldMap = {
      productCode: 'product_code',
      warrantyPeriod: 'warranty_period',
      serviceFrequency: 'service_period',
      warrantyParts: 'insured_part',
    };

    const uniqueValues = [...new Set(insuranceData.map((item) => item[fieldMap[field]]).filter(Boolean))];
    return uniqueValues.filter((val) =>
      val.toLowerCase().includes(inputValue)
    );
  };

  const onSuggestionsFetchRequested = (field) => ({ value }) => {
    setSuggestions((prev) => ({
      ...prev,
      [field]: getSuggestions(value, field),
    }));
  };

  const onSuggestionsClearRequested = (field) => () => {
    setSuggestions((prev) => ({
      ...prev,
      [field]: [],
    }));
  };

  const getSuggestionValue = (suggestion) => suggestion;

  const renderSuggestion = (suggestion) => (
    <div style={{ padding: '10px', cursor: 'pointer' }}>
      {suggestion}
    </div>
  );

  // Handle productCode suggestion selection
  const onProductCodeSuggestionSelected = (event, { suggestion }) => {
    const selectedRecord = insuranceData.find(
      (item) => item.product_code === suggestion
    );
    if (selectedRecord) {
      setContactData((prev) => ({
        ...prev,
        productCode: suggestion,
        warrantyPeriod: selectedRecord.warranty_period || '',
        serviceFrequency: selectedRecord.service_period || '',
        warrantyParts: selectedRecord.insured_part || '',
      }));
      setErrors((prev) => ({
        ...prev,
        productCode: '',
        warrantyPeriod: '',
        serviceFrequency: '',
        warrantyParts: '',
      }));
    } else {
      handleContactChange('productCode', suggestion);
    }
  };

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    formContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '15px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    },
    header: {
      background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
      color: 'white',
      padding: '2rem',
      textAlign: 'center',
    },
    title: {
      fontSize: '2.5rem',
      marginBottom: '0.5rem',
      fontWeight: '300',
    },
    subtitle: {
      opacity: 0.9,
      fontSize: '1.1rem',
    },
    formBody: {
      padding: '2rem',
    },
    section: {
      marginBottom: '2rem',
      padding: '1.5rem',
      border: '2px solid #f8f9fa',
      borderRadius: '12px',
      backgroundColor: '#fafafa',
    },
    sectionTitle: {
      color: '#2c3e50',
      fontSize: '1.3rem',
      fontWeight: '600',
      marginBottom: '1.5rem',
      padding: '0.5rem 0',
      borderBottom: '2px solid #3498db',
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      marginRight: '0.5rem',
      color: '#3498db',
    },
    row: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem',
    },
    formGroup: {
      marginBottom: '1rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: '#555',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'border-color 0.3s, box-shadow 0.3s',
    },
    inputError: {
      borderColor: '#e74c3c',
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '1rem',
      resize: 'vertical',
      minHeight: '80px',
    },
    errorText: {
      color: '#e74c3c',
      fontSize: '0.8rem',
      marginTop: '0.25rem',
    },
    submitContainer: {
      textAlign: 'center',
      padding: '2rem',
    },
    submitButton: {
      background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '1rem 3rem',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(46, 204, 113, 0.3)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    submitButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(46, 204, 113, 0.4)',
    },
    submitButtonDisabled: {
      background: '#bdc3c7',
      cursor: 'not-allowed',
      transform: 'none',
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
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '500px',
      width: '90%',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    },
    successIcon: {
      color: '#2ecc71',
      fontSize: '4rem',
      marginBottom: '1rem',
    },
    errorIcon: {
      color: '#e74c3c',
      fontSize: '4rem',
      marginBottom: '1rem',
    },
    closeButton: {
      background: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '0.5rem 1.5rem',
      marginTop: '1rem',
      cursor: 'pointer',
    },
    autosuggestContainer: {
      position: 'relative',
    },
    autosuggestSuggestionsContainer: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      maxHeight: '200px',
      overflowY: 'auto',
    },
    autosuggestSuggestion: {
      padding: '10px',
      cursor: 'pointer',
    },
    autosuggestSuggestionHighlighted: {
      backgroundColor: '#f0f0f0',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>⚙️ Customer Service Request</h1>
          <p style={styles.subtitle}>
            Submit your service request and our team will process it promptly
          </p>
        </div>

        {/* Form */}
        <div style={styles.formBody}>
          <div>
            {/* Location/Company Information Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>
                <span style={styles.icon}>🏢</span>
                Sale/ตามศูนย์สาขา/PM-BU
              </h2>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>🏠 1. ชื่อสถานที่เข้างาน *</label>
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
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>📍 2. รายละเอียดที่อยู่ *</label>
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
                  <label style={styles.label}>📍 3. รหัสไปรษณีย์ *</label>
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
                  <label style={styles.label}>4. ตำบล/แขวง *</label>
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
                  <label style={styles.label}>5. อำเภอ/เขต *</label>
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
                  <label style={styles.label}>6. จังหวัด *</label>
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
                <label style={styles.label}>7. ที่อยู่วางบิล/ที่อยู่บริษัท</label>
                <input
                  type="text"
                  placeholder="Billing address (optional)"
                  value={locationData.billingAddress}
                  onChange={(e) => handleLocationChange('billingAddress', e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>
                <span style={styles.icon}>👤</span>
                ข้อมูลผู้ติดต่อ
              </h2>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>👤 1. ชื่อ - นามสกุล *</label>
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
                  <label style={styles.label}>📞 2. เบอร์โทร *</label>
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

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>✉️ 3. อีเมล *</label>
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

                <div style={styles.formGroup}>
                  <label style={styles.label}>📦 4. รหัสสินค้า ประเภทเครื่อง *</label>
                  <Autosuggest
                    suggestions={suggestions.productCode}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested('productCode')}
                    onSuggestionsClearRequested={onSuggestionsClearRequested('productCode')}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    onSuggestionSelected={onProductCodeSuggestionSelected}
                    inputProps={{
                      placeholder: 'Product code',
                      value: contactData.productCode,
                      onChange: (event, { newValue }) => handleContactChange('productCode', newValue),
                      style: {
                        ...styles.input,
                        ...(errors.productCode ? styles.inputError : {}),
                      },
                    }}
                    theme={{
                      container: styles.autosuggestContainer,
                      suggestionsContainer: styles.autosuggestSuggestionsContainer,
                      suggestion: styles.autosuggestSuggestion,
                      suggestionHighlighted: styles.autosuggestSuggestionHighlighted,
                    }}
                  />
                  {errors.productCode && (
                    <div style={styles.errorText}>{errors.productCode}</div>
                  )}
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>5. จำนวน *</label>
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

                <div style={styles.formGroup}>
                  <label style={styles.label}>📅 6. วันที่เริ่มประกัน</label>
                  <input
                    type="date"
                    value={contactData.warrantyStartDate}
                    onChange={(e) => handleContactChange('warrantyStartDate', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>🛡️ 7. ระยะเวลารับประกัน</label>
                  <Autosuggest
                    suggestions={suggestions.warrantyPeriod}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested('warrantyPeriod')}
                    onSuggestionsClearRequested={onSuggestionsClearRequested('warrantyPeriod')}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    inputProps={{
                      placeholder: 'Warranty period',
                      value: contactData.warrantyPeriod,
                      onChange: (event, { newValue }) => handleContactChange('warrantyPeriod', newValue),
                      style: styles.input,
                    }}
                    theme={{
                      container: styles.autosuggestContainer,
                      suggestionsContainer: styles.autosuggestSuggestionsContainer,
                      suggestion: styles.autosuggestSuggestion,
                      suggestionHighlighted: styles.autosuggestSuggestionHighlighted,
                    }}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>9. จำนวนครั้งการบริการ</label>
                  <Autosuggest
                    suggestions={suggestions.serviceFrequency}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested('serviceFrequency')}
                    onSuggestionsClearRequested={onSuggestionsClearRequested('serviceFrequency')}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    inputProps={{
                      placeholder: 'Service frequency',
                      value: contactData.serviceFrequency,
                      onChange: (event, { newValue }) => handleContactChange('serviceFrequency', newValue),
                      style: styles.input,
                    }}
                    theme={{
                      container: styles.autosuggestContainer,
                      suggestionsContainer: styles.autosuggestSuggestionsContainer,
                      suggestion: styles.autosuggestSuggestion,
                      suggestionHighlighted: styles.autosuggestSuggestionHighlighted,
                    }}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>8. อะไหล่ที่รับประกัน</label>
                <Autosuggest
                  suggestions={suggestions.warrantyParts}
                  onSuggestionsFetchRequested={onSuggestionsFetchRequested('warrantyParts')}
                  onSuggestionsClearRequested={onSuggestionsClearRequested('warrantyParts')}
                  getSuggestionValue={getSuggestionValue}
                  renderSuggestion={renderSuggestion}
                  inputProps={{
                    placeholder: 'Warranty parts',
                    value: contactData.warrantyParts,
                    onChange: (event, { newValue }) => handleContactChange('warrantyParts', newValue),
                    style: styles.input,
                  }}
                  theme={{
                    container: styles.autosuggestContainer,
                    suggestionsContainer: styles.autosuggestSuggestionsContainer,
                    suggestion: styles.autosuggestSuggestion,
                    suggestionHighlighted: styles.autosuggestSuggestionHighlighted,
                  }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>10. ที่อยู่ทรัพย์สิน</label>
                <input
                  type="text"
                  placeholder="Property address"
                  value={contactData.propertyAddress}
                  onChange={(e) => handleContactChange('propertyAddress', e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div style={styles.submitContainer}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  ...styles.submitButton,
                  ...(isSubmitting ? styles.submitButtonDisabled : {}),
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    Object.assign(e.target.style, styles.submitButtonHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    Object.assign(e.target.style, styles.submitButton);
                  }
                }}
              >
                {isSubmitting ? (
                  <>⏳ Submitting Request...</>
                ) : (
                  <>✅ Submit Service Request</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessMessage && (
        <div style={styles.modal} onClick={() => setShowSuccessMessage(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.successIcon}>✅</div>
            <h2>Request Submitted Successfully!</h2>
            <p>
              Thank you for your request. Your service request has been submitted successfully and will be reviewed by our team.
            </p>
            {documentId && (
              <div
                style={{
                  background: '#d4edda',
                  color: '#155724',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  margin: '1rem 0',
                }}
              >
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
            <div style={styles.errorIcon}>❌</div>
            <h2>Submission Error</h2>
            <p>{errorMessage}</p>
            <button
              style={{ ...styles.closeButton, background: '#e74c3c' }}
              onClick={() => setShowErrorMessage(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalServiceForm;