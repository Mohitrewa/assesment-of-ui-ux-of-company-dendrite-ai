import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

export type DrawingElement = {
  type: 'line' | 'pencil' | 'eraser' | 'rectangle' | 'circle';
  start: { x: number; y: number };
  end?: { x: number; y: number };
  color: string;
  width: number;
  path?: { x: number; y: number }[];
};

const Session: React.FC = () => {
  const { userUID, canvasId, token } = useParams<{ userUID: string; canvasId: string; token: string }>();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth);
  const [canvasHeight, setCanvasHeight] = useState(window.innerHeight);
  
  useEffect(() => {
    // Initialize WebSocket connection
    const socket = new WebSocket(`ws://localhost:8080?userUID=${userUID}&canvasId=${canvasId}&token=${token}`);
    
    socket.onopen = () => console.log('WebSocket connection established');
    
    socket.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        // Convert Blob to text
        const text = await event.data.text();
        try {
          const data = JSON.parse(text);
          if (data.type === 'drawing') {
            console.log('Received drawing data:', data.elements);
            drawElements(data.elements);
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      } else {
        console.error('Received non-Blob data:', event.data);
      }
    };
    
    setWs(socket);

    return () => {
      socket.close();
    };
  }, [userUID, canvasId, token]); // Dependency array includes the URL parameters

  const drawElements = (elements: DrawingElement[]) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      elements.forEach((element) => {
        context.strokeStyle = element.color;
        context.lineWidth = element.width;

        if (element.type === 'pencil' || element.type === 'eraser') {
          context.beginPath();
          if (element.path) {
            context.moveTo(element.path[0].x, element.path[0].y);
            element.path.forEach(point => context.lineTo(point.x, point.y));
          }
          context.stroke();
          context.closePath();
        } else if (element.type === 'line' && element.end) {
          context.beginPath();
          context.moveTo(element.start.x, element.start.y);
          context.lineTo(element.end.x, element.end.y);
          context.stroke();
          context.closePath();
        } else if (element.type === 'rectangle' && element.end) {
          const width = element.end.x - element.start.x;
          const height = element.end.y - element.start.y;
          context.strokeRect(element.start.x, element.start.y, width, height);
        } else if (element.type === 'circle' && element.end) {
          const radius = Math.sqrt(
            Math.pow(element.end.x - element.start.x, 2) + Math.pow(element.end.y - element.start.y, 2)
          );
          context.beginPath();
          context.arc(element.start.x, element.start.y, radius, 0, 2 * Math.PI);
          context.stroke();
          context.closePath();
        }
      });
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
};

export default Session;
