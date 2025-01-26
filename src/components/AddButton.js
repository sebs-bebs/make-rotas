import React, { useState } from 'react';

function AddButton({ onAdd, onRemove }) {
  const [isAdd, setIsAdd] = useState(true);

  const handleClick = () => {
    if (isAdd) {
      onAdd();
      setIsAdd(false);
    } else {
      onRemove();
      setIsAdd(true);
    }
  };

  return (
    <button onClick={handleClick}>
      {isAdd ? 'Add' : 'Remove'}
    </button>
  );
}

export default AddButton;
