import React, { useState } from 'react';
import { FaPencilAlt, FaEraser, FaSquare, FaCircle, FaSlash } from 'react-icons/fa';


interface ToolBoxProps {
  onToolSelect: (tool: 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'line') => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
}

export default function ToolBox({ onToolSelect, onColorChange, onSizeChange }: ToolBoxProps) {
  const [selectedTool, setSelectedTool] = useState<'pencil' | 'eraser' | 'rectangle' | 'circle' | 'line' | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [selectedSize, setSelectedSize] = useState<number>(2);
  const [inviteOpen, setInviteOpen] = useState(false);

  const handleToolSelect = (tool: 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'line') => {
    setSelectedTool(tool);
    onToolSelect(tool);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setSelectedColor(newColor);
    onColorChange(newColor);
  };

  const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(event.target.value);
    setSelectedSize(newSize);
    onSizeChange(newSize);
  };



  const getIconStyle = (tool: 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'line') => {
    return selectedTool === tool ? 'text-yellow-400' : 'text-white';
  };

  return (
    <div className="relative">
      {/* ToolBox */}
      <div
        className="fixed z-50 bg-gray-800 rounded left-0 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 p-4"
        style={{ fontSize: '1.5rem' }}
      >
        <FaSlash
          className={`${getIconStyle('line')} cursor-pointer`}
          onClick={() => handleToolSelect('line')}
        />
        <FaSquare
          className={`${getIconStyle('rectangle')} cursor-pointer`}
          onClick={() => handleToolSelect('rectangle')}
        />
        <FaCircle
          className={`${getIconStyle('circle')} cursor-pointer`}
          onClick={() => handleToolSelect('circle')}
        />
        <FaPencilAlt
          className={`${getIconStyle('pencil')} cursor-pointer`}
          onClick={() => handleToolSelect('pencil')}
        />
        <FaEraser
          className={`${getIconStyle('eraser')} cursor-pointer`}
          onClick={() => handleToolSelect('eraser')}
        />

        {/* Color Picker */}
        <input
          type="color"
          value={selectedColor}
          onChange={handleColorChange}
          className="ml-2 w-10 h-10 border-none cursor-pointer"
          title="Select color"
        />

        {/* Size Picker */}
        <select value={selectedSize} onChange={handleSizeChange} className="mt-2 p-2 rounded">
          <option value={2}>2</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>
      </div>

    </div>
  );
}
