import React from 'react';

interface ClearCanvasButtonProps {
  onClick: () => void; // Update to use onClick for clearing
}

const ClearCanvasButton: React.FC<ClearCanvasButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick} // Use onClick prop to clear
      className="absolute bottom-4 right-4 p-2 bg-red-500 text-white rounded cursor-pointer"
      aria-label="Clear Canvas"
    >
      Clear
    </button>
  );
};

export default ClearCanvasButton;
