import React, { useCallback, useEffect, useRef, useState } from 'react';
import './../App.css';

export default function Canvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [isDrawStart, setIsDrawStart] = useState(false);
  const [startPosition, setStartPosition] = useState(null);
  const [lineCoordinates, setLineCoordinates] = useState(null);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    canvasRef.current.width = window.innerWidth * 2;
    canvasRef.current.height = window.innerHeight * 2;
    canvasRef.current.style.width = `${window.innerWidth}px`;
    canvasRef.current.style.height = `${window.innerHeight}px`;
    const context = canvasRef.current.getContext('2d');
    context.scale(2, 2);
    ctxRef.current = context;
  }, []);

  const calculateIntersection = (ab, cd) => {
    const x1 = ab.c1.x;
    const x2 = ab.c2.x;
    const x3 = cd.c1.x;
    const x4 = cd.c2.x;
    const y1 = ab.c1.y;
    const y2 = ab.c2.y;
    const y3 = cd.c1.y;
    const y4 = cd.c2.y;
    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
      return false;
    }

    const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

    // Lines are parallel
    if (denominator === 0) {
      return false;
    }

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
      return false;
    }

    // Return a object with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1);
    let y = y1 + ua * (y2 - y1);

    return { x, y };
  };

  const getClientOffset = (event) => {
    const { pageX, pageY } = event.touches ? event.touches[0] : event;
    const x = pageX - canvasRef.current.offsetLeft;
    const y = pageY - canvasRef.current.offsetTop;

    return { x, y };
  };

  const clearCanvas = () => {
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
  };

  const drawCircle = useCallback(({ x, y }) => {
    ctxRef.current.strokeStyle = '#e80505';
    ctxRef.current.lineWidth = 2;
    ctxRef.current.beginPath();
    ctxRef.current.arc(x, y, 3, 0, 2 * Math.PI);
    ctxRef.current.stroke();
  });

  const drawLine = useCallback((start, end) => {
    ctxRef.current.lineCap = 'round';
    ctxRef.current.strokeStyle = '#0b2b08';
    ctxRef.current.lineWidth = 1;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(start.x, start.y);
    ctxRef.current.lineTo(end.x, end.y);
    ctxRef.current.closePath();
    ctxRef.current.stroke();
  }, []);

  const mouseDownListener = useCallback(
    (event) => {
      const coorsinates = getClientOffset(event);
      if (coorsinates) {
        setIsDrawStart(true);
        setStartPosition(coorsinates);
        setLineCoordinates(coorsinates);
      }
    },
    [isDrawStart, startPosition]
  );

  const mouseMoveListener = useCallback(
    (event) => {
      if (!isDrawStart) {
        return;
      }

      const coordinates = getClientOffset(event);
      if (startPosition) {
        setLineCoordinates(coordinates);
        clearCanvas();
        const line = { c1: startPosition, c2: lineCoordinates };
        if (lines.length) {
          for (let i = 0; i < lines.length; i++) {
            const intersectionPoint = calculateIntersection(line, lines[i]);

            drawCircle(intersectionPoint);
          }
        }
        drawLine(startPosition, lineCoordinates);
      }
    },
    [isDrawStart, lineCoordinates]
  );

  const mouseUpListener = useCallback(
    (event) => {
      setIsDrawStart(false);
      setLines((prev) => [...prev, { c1: startPosition, c2: lineCoordinates }]);
    },
    [startPosition, lineCoordinates]
  );

  useEffect(() => {
    if (lines.length) {
      for (let i = 0; i < lines.length; i++) {
        const { c1, c2 } = lines[i];
        drawLine(c1, c2);

        if (lines.length) {
          for (let j = 0; j <= i; j++) {
            const intersectionPoint = calculateIntersection(lines[i], lines[j]);

            if (intersectionPoint) {
              drawCircle(intersectionPoint);
            }
          }
        }
      }
    }
  });

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    canvasRef.current.addEventListener('mousedown', mouseDownListener);

    return () => {
      canvasRef.current.removeEventListener('mousedown', mouseDownListener);
    };
  }, [mouseDownListener]);

  useEffect(() => {
    if (!isDrawStart) {
      return;
    }

    canvasRef.current.addEventListener('mousemove', mouseMoveListener);

    return () => {
      canvasRef.current.removeEventListener('mousemove', mouseMoveListener);
    };
  }, [mouseMoveListener, isDrawStart]);

  useEffect(() => {
    canvasRef.current.addEventListener('mouseup', mouseUpListener);
    return () => {
      canvasRef.current.removeEventListener('mouseup', mouseUpListener);
    };
  }, [mouseUpListener]);

  return (
    <div className='container'>
        <canvas className='canvas' ref={canvasRef} />;
    </div>
  )
}
