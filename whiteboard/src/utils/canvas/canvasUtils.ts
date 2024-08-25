import { DrawingElement } from '../../pages/Canvas/page'; // Adjust the import path as necessary

// Utility function for starting the drawing
export const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
    tool: string | null,
    color: string,
    size: number,
    setStartPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>,
    setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>,
    elements: DrawingElement[],  
    setElements: React.Dispatch<React.SetStateAction<DrawingElement[]>>,
    setUndoStack: React.Dispatch<React.SetStateAction<DrawingElement[][]>>,
    setCurrentLine: React.Dispatch<React.SetStateAction<DrawingElement | null>>,
    getCanvasCoordinates: (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => { x: number; y: number }
  ) => {
    const { x, y } = getCanvasCoordinates(e);
    setStartPos({ x, y });
    setIsDrawing(true);
  
    // Push a copy of the current elements to the undo stack
    setUndoStack(prev => [...prev, [...elements]]);
  
    if (tool === 'pencil' || tool === 'eraser') {
      const elementType = tool === 'pencil' ? 'pencil' : 'eraser';
      const elementColor = tool === 'eraser' ? '#FFFFFF' : color;
      const elementWidth = tool === 'eraser' ? 10 : size;
      setElements(prevElements => [
        ...prevElements,
        {
          type: elementType,
          start: { x, y },
          path: [{ x, y }],
          color: elementColor,
          width: elementWidth,
        },
      ]);
    } else if (tool === 'line') {
      setCurrentLine({
        type: 'line',
        start: { x, y },
        end: { x, y },
        color,
        width: size,
      });
    } else if (tool === 'rectangle' || tool === 'circle') {
      setElements(prevElements => [
        ...prevElements,
        { type: tool, start: { x, y }, end: { x, y }, color, width: size },
      ]);
    }
  };
  
// Utility function for handling mouse move
export const handleMouseMove = (
  e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  tool: string | null,
  isDrawing: boolean,
  startPos: { x: number; y: number } | null,
  currentLine: DrawingElement | null,
  color: string,
  size: number,
  elements: DrawingElement[],
  setElements: React.Dispatch<React.SetStateAction<DrawingElement[]>>,
  getCanvasCoordinates: (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => { x: number; y: number },
  canvasRef: React.RefObject<HTMLCanvasElement>,
  redrawElements: (context: CanvasRenderingContext2D) => void
) => {
  if (!isDrawing || !startPos) return;

  const { x, y } = getCanvasCoordinates(e);

  if ((tool === 'pencil' || tool === 'eraser') && elements.length > 0) {
    const updatedElements = [...elements];
    const lastElement = updatedElements[updatedElements.length - 1];
    if (lastElement.path) {
      lastElement.path.push({ x, y });
    }
    setElements(updatedElements);

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      redrawElements(context);
    }
  } else if (tool === 'line' && currentLine) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      redrawElements(context);

      context.strokeStyle = currentLine.color;
      context.lineWidth = currentLine.width;
      context.beginPath();
      context.moveTo(currentLine.start.x, currentLine.start.y);
      context.lineTo(x, y);
      context.stroke();
      context.closePath();
    }
  } else if ((tool === 'rectangle' || tool === 'circle')) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      redrawElements(context);

      context.strokeStyle = color;
      context.lineWidth = size;

      if (tool === 'rectangle') {
        const width = x - startPos.x;
        const height = y - startPos.y;
        context.strokeRect(startPos.x, startPos.y, width, height);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        context.beginPath();
        context.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        context.stroke();
        context.closePath();
      }
    }
  }
};

// Utility function for stopping the drawing
export const stopDrawing = (
  e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  isDrawing: boolean,
  tool: string | null,
  startPos: { x: number; y: number } | null,
  currentLine: DrawingElement | null,
  elements: DrawingElement[],
  setElements: React.Dispatch<React.SetStateAction<DrawingElement[]>>,
  setCurrentLine: React.Dispatch<React.SetStateAction<DrawingElement | null>>,
  getCanvasCoordinates: (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => { x: number; y: number },
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>,
  setStartPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>
) => {
  if (isDrawing) {
    const { x, y } = getCanvasCoordinates(e);

    if (tool === 'pencil' || tool === 'eraser') {
      const updatedElements = [...elements];
      const lastElement = updatedElements[updatedElements.length - 1];
      if (lastElement.path) {
        lastElement.path.push({ x, y });
      }
      setElements(updatedElements);
    } else if (tool === 'line' && startPos && currentLine) {
      const newElement: DrawingElement = {
        ...currentLine,
        end: { x, y },
      };
      setElements([...elements, newElement]);
      setCurrentLine(null);
    } else if ((tool === 'rectangle' || tool === 'circle') && startPos) {
      const updatedElements = [...elements];
      const lastElement = updatedElements[updatedElements.length - 1];
      if (lastElement.end) {
        lastElement.end = { x, y };
        setElements(updatedElements);
      }
    }

    setIsDrawing(false);
    setStartPos(null);
  }
};
