import React from 'react';
import { InputGroup, Form } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const SearchInput = ({ placeholder, value, onChange }) => (
  <InputGroup className="mb-3">
    <InputGroup.Text style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
      <FaSearch style={{ color: '#3498db' }} />
    </InputGroup.Text>
    <Form.Control
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        border: '1px solid #e9ecef',
        boxShadow: 'none',
        padding: '0.6rem 1rem',
        fontSize: '0.95rem',
      }}
    />
  </InputGroup>
);

export default React.memo(SearchInput);
