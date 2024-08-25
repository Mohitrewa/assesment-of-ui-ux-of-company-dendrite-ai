import React, { useRef, useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Chat from '../../Components/Chat/index';
import ToolBox from '../../Components/Tools/index';
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';
 
import InviteFriends from '../../Components/InviteFriend/index';
import {
  startDrawing,
  handleMouseMove,
  stopDrawing,
} from '../../utils/canvas/canvasUtils';
import SaveButton from '../../Components/Button/SaveButton/saveButt';

export type DrawingElement = {
  type: 'line' | 'pencil' | 'eraser' | 'rectangle' | 'circle';
  start: { x: number; y: number };
  end?: { x: number; y: number };
  color: string;
  width: number;
  path?: { x: number; y: number }[];
};

const Canvas: React.FC = () => {
  const { canvasId } = useParams<{ canvasId: string }>();
  const {userId} = useParams<{userId: string}>();
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'rectangle' | 'circle' | 'line' | null>(null);
  const [color, setColor] = useState<string>('#000000');
  const [size, setSize] = useState<number>(5);
  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentLine, setCurrentLine] = useState<DrawingElement | null>(null);
  const [undoStack, setUndoStack] = useState<DrawingElement[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingElement[][]>([]);
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth);
  const [canvasHeight, setCanvasHeight] = useState(window.innerHeight);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
 
  // WebSocket setup with required parameters
  const [ws, setWs] = useState<WebSocket | null>(null);

    // Function to generate a random 7-digit token
    function generateToken() {
      return Math.floor(1000000 + Math.random() * 9000000).toString();
    }
    
    // Retrieve the token from localStorage or generate a new one
    const token = localStorage.getItem('userToken') || (() => {
      const newToken = generateToken();
      localStorage.setItem('userToken', newToken);
      return newToken;
    })();
    
    console.log(token); 

  useEffect(() => {



  
      console.log("Data geting "+userId , canvasId)
  
    if (userId && canvasId && token) {
      const socket = new WebSocket(`ws://localhost:8080?userUID=${userId}&canvasId=${canvasId}&token=${token}`);
      const  url = `ws://localhost:8080?userUID=${userId}&canvasId=${canvasId}&token=${token}`
      setSocketUrl(url)

      socket.onopen = () => console.log('WebSocket connection established');
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'drawing') {
          console.log('Received drawing data:', data);
          // Update canvas with received data
          setElements(data.elements);
        }
      };
      
      setWs(socket);
  
      return () => {
        socket.close();
      };
    }
  }, [userId, canvasId, token]);

  const sendDrawingData = (elements: DrawingElement[]) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type: 'drawing', elements });
      console.log('Sending drawing data:', message);
      ws.send(message);
    }
  };

  const handleInviteClick = () => {
    setInviteOpen(true);
  };

  const handleInviteClose = () => {
    setInviteOpen(false);
  };

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
  
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    // Send drawing data
    if (isDrawing) {
      sendDrawingData([...elements, {
        type: tool || 'pencil',
        start: startPos || { x: x, y: y },
        end: { x, y },
        color,
        width: size,
      }]);
    }
    
    return { x, y };
  };

  const redrawElements = (context: CanvasRenderingContext2D) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    elements.forEach((element) => {
      if (element.type === 'pencil' || element.type === 'eraser') {
        context.strokeStyle = element.color;
        context.lineWidth = element.width;
        context.beginPath();
        if (element.path) {
          context.moveTo(element.path[0].x, element.path[0].y);
          element.path.forEach(point => context.lineTo(point.x, point.y));
        }
        context.stroke();
        context.closePath();
      } else if (element.type === 'line' && element.end) {
        context.strokeStyle = element.color;
        context.lineWidth = element.width;
        context.beginPath();
        context.moveTo(element.start.x, element.start.y);
        context.lineTo(element.end.x, element.end.y);
        context.stroke();
        context.closePath();
      } else if (element.type === 'rectangle' && element.end) {
        context.strokeStyle = element.color;
        context.lineWidth = element.width;
        const width = element.end.x - element.start.x;
        const height = element.end.y - element.start.y;
        context.strokeRect(element.start.x, element.start.y, width, height);
      } else if (element.type === 'circle' && element.end) {
        context.strokeStyle = element.color;
        context.lineWidth = element.width;
        const radius = Math.sqrt(
          Math.pow(element.end.x - element.start.x, 2) + Math.pow(element.end.y - element.start.y, 2)
        );
        context.beginPath();
        context.arc(element.start.x, element.start.y, radius, 0, 2 * Math.PI);
        context.stroke();
        context.closePath();
      }
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const previousElements = undoStack.pop()!;
    setRedoStack([...redoStack, elements]);
    setElements(previousElements);
    sendDrawingData(previousElements);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const nextElements = redoStack.pop()!;
    setUndoStack([...undoStack, elements]);
    setElements(nextElements);
    sendDrawingData(nextElements);
  };

  useEffect(() => {
    const handleResize = () => {
      setCanvasWidth(window.innerWidth);
      setCanvasHeight(window.innerHeight);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        handleUndo();
      } else if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [elements, undoStack, redoStack]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      redrawElements(context);
    }
  }, [elements, canvasWidth, canvasHeight]);

  return (
    <Box>
      {/* ToolBox Component */}
      <ToolBox
        onToolSelect={(tool) => setTool(tool)}
        onColorChange={(color) => setColor(color)}
        onSizeChange={(size) => setSize(size)}
      />

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ border: '1px solid black' }}
        onMouseDown={(e) => startDrawing(
          e,
          tool,
          color,
          size,
          setStartPos,
          setIsDrawing,
          elements,
          setElements,
          setUndoStack,
          setCurrentLine,
          getCanvasCoordinates
        )}
        onMouseMove={(e) => handleMouseMove(
          e,
          tool,
          isDrawing,
          startPos,
          currentLine,
          color,
          size,
          elements,
          setElements,
          getCanvasCoordinates,
          canvasRef,
          redrawElements
        )}
        onMouseUp={(e) => stopDrawing(
          e,
          isDrawing,
          tool,
          startPos,
          currentLine,
          elements,
          setElements,
          setCurrentLine,
          getCanvasCoordinates,
          setIsDrawing,
          setStartPos
        )}
      />

      <Chat />
      {canvasId && (
        <SaveButton canvasId={canvasId} elements={elements} setElements={setElements} />
      )}

      {/* Invite Friends Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="contained"
          color="primary"
          onClick={handleInviteClick}
        >
          Invite Friends
        </Button>
   
        {/* InviteFriends Dialog */}
        <InviteFriends open={inviteOpen} onClose={handleInviteClose} Socket={socketUrl || ''} />
      </div>
    </Box>
  );
};

export default Canvas;