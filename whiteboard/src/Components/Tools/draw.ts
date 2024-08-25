import React, { RefObject } from 'react';

export const draw = (
  e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, 
  isDrawing: boolean, 
  tool: string, 
  canvasRef: RefObject<HTMLCanvasElement>, 
  color: string
) => {
  if (isDrawing && (tool === 'pencil' || tool === 'eraser')) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    
    if (context) {
      context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      context.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
      context.lineWidth = tool === 'eraser' ? 10 : 2; // Larger width for eraser
      context.stroke();
    }
  }
};
