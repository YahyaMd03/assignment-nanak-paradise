import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Canvas, Rect } from "fabric";

interface Room {
  name: string;
  dimensions: { width: number; height: number };
}

interface DoorWindow {
  position: string;
  room: string;
}

interface FloorPlanData {
  rooms: Room[];
  walls: { length: number; position: string }[];
  doors: DoorWindow[];
  windows: DoorWindow[];
}

const FloorPlan: React.FC = () => {
  const [floorPlan, setFloorPlan] = useState<FloorPlanData | null>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const canvasEl = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/floorplan").then((response) => {
      setFloorPlan(response.data);
    });
  }, []);

  useEffect(() => {
    if (!canvasEl.current) return;
    
    canvasRef.current = new Canvas(canvasEl.current, {
      backgroundColor: "#f8f8f8",
    });

    return () => {
      canvasRef.current?.dispose();
      canvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current && floorPlan) {
      canvasRef.current.clear();
      drawFloorPlan(canvasRef.current, floorPlan);
    }
  }, [floorPlan]);

  const drawFloorPlan = (canvas: Canvas, data: FloorPlanData) => {
    data.rooms.forEach((room, index) => {
      const rect = new Rect({
        left: 100 + index * 120,
        top: 100,
        width: room.dimensions.width * 40,
        height: room.dimensions.height * 40,
        fill: "lightblue",
        stroke: "black",
        strokeWidth: 2,
      });

    //   const text = new Text(room.name, {
    //     left: rect.left! + 10,
    //     top: rect.top! + 10,
    //     fontSize: 14,
    //     fill: "black",
    //   });

      canvas.add(rect);
    //   canvas.add(text);
    });

    data.doors.forEach(() => {
      const doorRect = new Rect({
        left: 120,
        top: 200,
        width: 10,
        height: 40,
        fill: "brown",
      });
      canvas.add(doorRect);
    });

    data.windows.forEach(() => {
      const windowRect = new Rect({
        left: 200,
        top: 150,
        width: 40,
        height: 10,
        fill: "blue",
      });
      canvas.add(windowRect);
    });
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl font-bold my-4">Floor Plan</h1>
      <canvas ref={canvasEl} width={600} height={400}></canvas>
    </div>
  );
};

export default FloorPlan;
