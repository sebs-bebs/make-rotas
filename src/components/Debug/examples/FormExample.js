import React, { useState, useCallback, useEffect } from 'react';
import { useDebug } from '../index';

export const FormExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  });
  const [errors, setErrors] = useState({});
  const { updateDebugVariables } = useDebug();

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.age) newErrors.age = 'Age is required';
    setErrors(newErrors);
  }, [formData]);

  // Example of tracking multiple related states
  const updateDebug = useCallback(() => {
    updateDebugVariables({
      FormExample: {
        formState: {
          value: formData,
          lastUpdated: new Date().toLocaleTimeString(),
          type: typeof formData
        },
        validationErrors: {
          value: errors,
          lastUpdated: new Date().toLocaleTimeString(),
          type: typeof errors
        },
        isValid: {
          value: Object.keys(errors).length === 0,
          lastUpdated: new Date().toLocaleTimeString(),
          type: 'boolean'
        }
      }
    });
  }, [formData, errors, updateDebugVariables]);

  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  useEffect(() => {
    updateDebug();
  }, [updateDebug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form className="space-y-4">
      <div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full p-2 border rounded"
        />
        {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
      </div>
      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
      </div>
      <div>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="Age"
          className="w-full p-2 border rounded"
        />
        {errors.age && <span className="text-red-500 text-sm">{errors.age}</span>}
      </div>
    </form>
  );
};
