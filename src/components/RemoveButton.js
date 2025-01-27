import React from 'react';

function RemoveButton({ onRemove }) {
  return (
    <button onClick={onRemove}>
      Remove
    </button>
  );
}

export default RemoveButton;