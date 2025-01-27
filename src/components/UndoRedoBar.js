import React from 'react';

/**
 * A bar that shows up at the bottom of the screen with undo/redo buttons
 * Only appears when there are actual changes to undo/redo
 */
const UndoRedoBar = ({ 
  undoCount = 0,    // Number of changes that can be undone
  redoCount = 0,    // Number of changes that can be redone
  onUndo,           // What to do when undo is clicked
  onRedo            // What to do when redo is clicked
}) => {
  // If there's nothing to undo or redo, don't show anything
  if (undoCount === 0 && redoCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex justify-center space-x-4">
      {/* Only show undo button if there are changes to undo */}
      {undoCount > 0 && (
        <button
          onClick={onUndo}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center"
        >
          {/* Left arrow icon */}
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Undo ({undoCount} {undoCount === 1 ? 'Change' : 'Changes'})
        </button>
      )}

      {/* Only show redo button if there are changes to redo */}
      {redoCount > 0 && (
        <button
          onClick={onRedo}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center"
        >
          {/* Right arrow icon */}
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M14 5l7 7m0 0l-7 7m7-7H3" 
            />
          </svg>
          Redo ({redoCount} {redoCount === 1 ? 'Change' : 'Changes'})
        </button>
      )}
    </div>
  );
};

export default UndoRedoBar;
