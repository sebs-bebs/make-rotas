import React, { useRef } from 'react';

export default function StaffImport({ onImport }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n');
      
      const staffList = lines
        .map(line => line.trim())
        .filter(line => line.length > 0) // Skip empty lines
        .map(line => {
          // Expected format: firstName,lastName,role,email,phone
          const [firstName, lastName, role, email, phone] = line.split(',').map(item => item.trim());
          
          if (!firstName || !lastName) {
            throw new Error('Each line must contain at least a first name and last name');
          }

          return {
            firstName,
            lastName,
            role: role || '',
            email: email || '',
            phone: phone || '',
            defaultAvailability: {
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: false,
              sunday: false,
            },
            isActive: true,
          };
        });

      onImport(staffList);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert(`Error importing staff list: ${error.message}\n\nPlease ensure your file is in the correct format:\nfirstName,lastName,role,email,phone`);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-blue-500');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-blue-500');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-blue-500');
    
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.txt')) {
      if (fileInputRef.current) {
        fileInputRef.current.files = event.dataTransfer.files;
        handleFileSelect({ target: { files: [file] } });
      }
    } else {
      alert('Please drop a .txt file');
    }
  };

  return (
    <div className="mb-6">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept=".txt"
          className="hidden"
          onChange={handleFileSelect}
          ref={fileInputRef}
        />
        <div className="text-gray-500">
          <p className="mb-2">Drag and drop a .txt file here, or click to select</p>
          <p className="text-sm">
            Format: firstName,lastName,role,email,phone
            <br />
            One staff member per line
          </p>
        </div>
      </div>
    </div>
  );
}
