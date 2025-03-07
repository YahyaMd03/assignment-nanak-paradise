import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Canvas, Rect, Textbox, Group, Line, IText, FabricObject } from "fabric";

interface Room {
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

interface DoorWindow {
  room: string;
  position: string;
  width: number;
}

interface FloorPlanData {
  rooms: Room[];
  doors: DoorWindow[];
  windows: DoorWindow[];
}

const SCALE_FACTOR = 0.5;

const FloorPlan: React.FC = () => {
  const [floorPlan, setFloorPlan] = useState<FloorPlanData | null>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Group | null>(null);
  const _clipboard = useRef<FabricObject | null>(null); // Store copied object

  useEffect(() => {
    axios.get("http://localhost:5000/api/floorplan").then((response) => {
      setFloorPlan(response.data);
    });
  }, []);

  useEffect(() => {
    if (!canvasEl.current) return;
    canvasRef.current = new Canvas(canvasEl.current, {
      backgroundColor: "#f8f8f8",
      selection: true,
      width: window.innerWidth,
      height: window.innerHeight,
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
    const roomGroups: Group[] = [];
    data.rooms.forEach((room) => {
      const rect = new Rect({
        left: room.x * SCALE_FACTOR,
        top: room.y * SCALE_FACTOR,
        width: room.width * SCALE_FACTOR,
        height: room.height * SCALE_FACTOR,
        fill: "lightgray",
        stroke: "black",
        strokeWidth: 2,
        selectable: true,
      });

      const text = new Textbox(`${room.name} \n${room.width}x${room.height}`, {
        left: rect.left! + 10,
        top: rect.top! + 10,
        fontSize: 16,
        fill: "black",
      });

      const group = new Group([rect, text], {
        left: rect.left,
        top: rect.top,
        selectable: true,
        hasControls: true,
      });

      group.on("moving", () => {
        preventOverlap(group, roomGroups);
        updateDimensions(group);
      });

      group.on("scaling", () => {
        preventOverlap(group, roomGroups);
        updateDimensions(group);
      });

      group.on("selected", () => {
        setSelectedRoom(group);
      });

      roomGroups.push(group);
      canvas.add(group);
    });

    data.doors.forEach((door) => {
      const room = data.rooms.find((r) => r.name === door.room);
      if (!room) return;

      const doorX = room.x + room.width / 2 - door.width / 2;

      const doorLine = new Line(
        [
          doorX * SCALE_FACTOR,
          (room.y + room.height) * SCALE_FACTOR,
          (doorX + door.width) * SCALE_FACTOR,
          (room.y + room.height) * SCALE_FACTOR,
        ],
        {
          stroke: "brown",
          strokeWidth: 4,
          selectable: true,
          lockMovementY: true,
        }
      );

      canvas.add(doorLine);
    });

    data.windows.forEach((window) => {
      const room = data.rooms.find((r) => r.name === window.room);
      if (!room) return;

      const windowX = room.x + room.width / 2 - window.width / 2;

      const windowLine = new Line(
        [
          windowX * SCALE_FACTOR,
          room.y * SCALE_FACTOR,
          (windowX + window.width) * SCALE_FACTOR,
          room.y * SCALE_FACTOR,
        ],
        {
          stroke: "gray",
          strokeWidth: 4,
          strokeDashArray: [5, 5],
          selectable: true,
          lockMovementY: true,
        }
      );

      canvas.add(windowLine);
    });

    canvas.renderAll();
  };

  const preventOverlap = (movingGroup: Group, roomGroups: Group[]) => {
    const movingRect = movingGroup.getObjects()[0] as Rect;
    roomGroups.forEach((group) => {
      if (group === movingGroup) return;
      const rect = group.getObjects()[0] as Rect;
      if (movingRect.intersectsWithObject(rect)) {
        movingGroup.set({
          left: movingGroup.left! + 1,
          top: movingGroup.top! + 1,
        });
        canvasRef.current?.renderAll();
      }
    });
  };

  const updateDimensions = (group: any) => {
    const rect = group.getObjects()[0] as Rect;
    const text = group.getObjects()[1] as Textbox;
    text.set({
      text: `${group.name} \n${Math.round(rect.width! / SCALE_FACTOR)}x${Math.round(
        rect.height! / SCALE_FACTOR
      )}`,
    });
    canvasRef.current?.renderAll();
  };

  const addRoom = () => {
    if (!floorPlan || !canvasRef.current || !selectedRoom) return;

    const selectedRect = selectedRoom.getObjects()[0] as Rect;
    const newRoom: Room = {
      name: `Room ${floorPlan.rooms.length + 1}`,
      width: selectedRect.width! / SCALE_FACTOR,
      height: selectedRect.height! / SCALE_FACTOR,
      x: selectedRect.left! / SCALE_FACTOR + 20,
      y: selectedRect.top! / SCALE_FACTOR + 20,
    };

    const newFloorPlan = { ...floorPlan, rooms: [...floorPlan.rooms, newRoom] };
    setFloorPlan(newFloorPlan);
  };

  const deleteRoom = () => {
    if (!floorPlan || !canvasRef.current || !selectedRoom) return;

    const newRooms = floorPlan.rooms.filter(
      (room) => room.name !== selectedRoom.name
    );
    const newFloorPlan = { ...floorPlan, rooms: newRooms };
    setFloorPlan(newFloorPlan);
    canvasRef.current.remove(selectedRoom);
    setSelectedRoom(null);
  };

  const groupRooms = () => {
    if (!canvasRef.current) return;

    const activeObjects = canvasRef.current.getActiveObjects();
    if (activeObjects.length < 2) return;

    const group = new Group(activeObjects);
    canvasRef.current.add(group);
    canvasRef.current.discardActiveObject().renderAll();
  };

  const copyObject = () => {
    if (!canvasRef.current) return;
    const activeObject = canvasRef.current.getActiveObject();
    if (activeObject) {
      activeObject.clone()
      .then((cloned) => {
        _clipboard = cloned;
      });
    }
  };

  const pasteObject = async () => {
    if (!canvasRef.current || !_clipboard.current) return;

    const clonedObj = await _clipboard.current.clone();
    canvasRef.current.discardActiveObject();
    clonedObj.set({
      left: clonedObj.left! + 10,
      top: clonedObj.top! + 10,
      evented: true,
    });

    if (clonedObj instanceof fabric.ActiveSelection) {
      clonedObj.canvas = canvasRef.current;
      clonedObj.forEachObject((obj) => {
        canvasRef.current!.add(obj);
      });
      clonedObj.setCoords();
    } else {
      canvasRef.current.add(clonedObj);
    }

    _clipboard.current.top += 10;
    _clipboard.current.left += 10;
    canvasRef.current.setActiveObject(clonedObj);
    canvasRef.current.requestRenderAll();
  };

  return (
    <div className="w-full h-screen flex flex-col items-center">
      <h1 className="text-xl font-bold my-4">Floor Plan</h1>
      <div className="flex space-x-4 my-4">
        <button
          onClick={addRoom}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Room
        </button>
        <button
          onClick={deleteRoom}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete Room
        </button>
        <button
          onClick={groupRooms}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Group Rooms
        </button>
        <button
          onClick={copyObject}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Copy
        </button>
        <button
          onClick={pasteObject}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Paste
        </button>
      </div>
      <div className="w-full h-[80vh] flex justify-center">
        <canvas
          ref={canvasEl}
          className="w-full h-full border border-gray-400"
        ></canvas>
      </div>
    </div>
  );
};

export default FloorPlan;