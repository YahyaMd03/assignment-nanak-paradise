import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Canvas, Rect, Textbox, Group, Line, IText, FabricObject, ActiveSelection } from "fabric";

interface Room {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

interface DoorWindow {
  id: string;
  roomId: string;
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
  const _clipboard = useRef<FabricObject | null>(null); 

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

      const text = new Textbox(room.name, {
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
        name: room.name, 
      });

      group.on("moving", () => {
        preventOverlap(group, roomGroups);
      });

      group.on("scaling", () => {
        preventOverlap(group, roomGroups);
      });

      group.on("selected", () => {
        setSelectedRoom(group);
      });

      roomGroups.push(group);
      canvas.add(group);
    });

    data.doors.forEach((door) => {
      const room = data.rooms.find((r) => r.id === door.roomId);
      if (!room) return;

      let doorLine;
      switch (door.position) {
        case "left":
          doorLine = new Line(
            [
              room.x * SCALE_FACTOR,
              (room.y + room.height / 2) * SCALE_FACTOR,
              room.x * SCALE_FACTOR,
              (room.y + room.height / 2 + door.width) * SCALE_FACTOR,
            ],
            {
              stroke: "brown",
              strokeWidth: 4,
              selectable: true,
              lockMovementY: true,
            }
          );
          break;
        case "right":
          doorLine = new Line(
            [
              (room.x + room.width) * SCALE_FACTOR,
              (room.y + room.height / 2) * SCALE_FACTOR,
              (room.x + room.width) * SCALE_FACTOR,
              (room.y + room.height / 2 + door.width) * SCALE_FACTOR,
            ],
            {
              stroke: "brown",
              strokeWidth: 4,
              selectable: true,
              lockMovementY: true,
            }
          );
          break;
        case "top":
          doorLine = new Line(
            [
              (room.x + room.width / 2) * SCALE_FACTOR,
              room.y * SCALE_FACTOR,
              (room.x + room.width / 2 + door.width) * SCALE_FACTOR,
              room.y * SCALE_FACTOR,
            ],
            {
              stroke: "brown",
              strokeWidth: 4,
              selectable: true,
              lockMovementY: true,
            }
          );
          break;
        case "bottom":
          doorLine = new Line(
            [
              (room.x + room.width / 2) * SCALE_FACTOR,
              (room.y + room.height) * SCALE_FACTOR,
              (room.x + room.width / 2 + door.width) * SCALE_FACTOR,
              (room.y + room.height) * SCALE_FACTOR,
            ],
            {
              stroke: "brown",
              strokeWidth: 4,
              selectable: true,
              lockMovementY: true,
            }
          );
          break;
        default:
          return;
      }

      canvas.add(doorLine);
    });

    data.windows.forEach((window) => {
      const room = data.rooms.find((r) => r.id === window.roomId);
      if (!room) return;

      let windowLine;
      switch (window.position) {
        case "left":
          windowLine = new Line(
            [
              room.x * SCALE_FACTOR,
              (room.y + room.height / 2) * SCALE_FACTOR,
              room.x * SCALE_FACTOR,
              (room.y + room.height / 2 + window.width) * SCALE_FACTOR,
            ],
            {
              stroke: "gray",
              strokeWidth: 4,
              strokeDashArray: [5, 5],
              selectable: true,
              lockMovementY: true,
            }
          );
          break;
        case "right":
          windowLine = new Line(
            [
              (room.x + room.width) * SCALE_FACTOR,
              (room.y + room.height / 2) * SCALE_FACTOR,
              (room.x + room.width) * SCALE_FACTOR,
              (room.y + room.height / 2 + window.width) * SCALE_FACTOR,
            ],
            {
              stroke: "gray",
              strokeWidth: 4,
              strokeDashArray: [5, 5],
              selectable: true,
              lockMovementY: true,
            }
          );
          break;
        case "top":
          windowLine = new Line(
            [
              (room.x + room.width / 2) * SCALE_FACTOR,
              room.y * SCALE_FACTOR,
              (room.x + room.width / 2 + window.width) * SCALE_FACTOR,
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
          break;
        case "bottom":
          windowLine = new Line(
            [
              (room.x + room.width / 2) * SCALE_FACTOR,
              (room.y + room.height) * SCALE_FACTOR,
              (room.x + room.width / 2 + window.width) * SCALE_FACTOR,
              (room.y + room.height) * SCALE_FACTOR,
            ],
            {
              stroke: "gray",
              strokeWidth: 4,
              strokeDashArray: [5, 5],
              selectable: true,
              lockMovementY: true,
            }
          );
          break;
        default:
          return;
      }

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

  const addRoom = () => {
    if (!floorPlan || !canvasRef.current) return;

    const canvasWidth = canvasRef.current.getWidth();
    const canvasHeight = canvasRef.current.getHeight();

    const newRoom: Room = {
      id: `room-${Date.now()}`, 
      name: `Room ${floorPlan.rooms.length + 1}`,
      width: 100,
      height: 100,
      x: (canvasWidth / 2 - 50) / SCALE_FACTOR,
      y: (canvasHeight / 2 - 50) / SCALE_FACTOR,
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

  const ungroupRooms = () => {
    if (!canvasRef.current) return;

    const activeObject = canvasRef.current.getActiveObject();
    if (activeObject && activeObject instanceof Group) {
      const objects = activeObject.getObjects();
      activeObject.destroy(); 
      canvasRef.current.discardActiveObject();
      canvasRef.current.add(...objects); 
      canvasRef.current.renderAll();
    }
  };

  const copyObject = () => {
    if (!canvasRef.current) return;
    const activeObject = canvasRef.current.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned) => {
        if (cloned instanceof Group) {
          const clonedObjects = cloned.getObjects().map((obj) => obj.clone());
          const clonedGroup = new Group(clonedObjects, {
            left: cloned.left,
            top: cloned.top,
            angle: cloned.angle,
            scaleX: cloned.scaleX,
            scaleY: cloned.scaleY,
          });
          _clipboard.current = clonedGroup;
        } else {
          _clipboard.current = cloned;
        }
      });
    }
  };
  const pasteObject = () => {
    if (!canvasRef.current || !_clipboard.current) return;

    _clipboard.current.clone((clonedObj) => {
      if (clonedObj instanceof Group) {
        const clonedObjects = clonedObj.getObjects().map((obj) => obj.clone());
        const clonedGroup = new Group(clonedObjects, {
          left: clonedObj.left + 20,
          top: clonedObj.top + 20,
          angle: clonedObj.angle,
          scaleX: clonedObj.scaleX,
          scaleY: clonedObj.scaleY,
        });
        canvasRef.current.add(clonedGroup);
        canvasRef.current.setActiveObject(clonedGroup);
      } else {
        clonedObj.set({
          left: clonedObj.left + 20,
          top: clonedObj.top + 20,
          evented: true,
        });
        canvasRef.current.add(clonedObj);
        canvasRef.current.setActiveObject(clonedObj);
      }

      canvasRef.current.requestRenderAll();
    });
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
          onClick={ungroupRooms}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          Ungroup Rooms
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