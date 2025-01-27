import React from 'react';

function AddButton({ onAdd }) {
  return (
    <button onClick={onAdd}>
      Add
    </button>
  );
}

export default AddButton;
