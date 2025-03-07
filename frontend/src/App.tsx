import React from "react";
import FloorPlan from "./components/FloorPlan";

const App: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <FloorPlan />
    </div>
  );
};

export default App;
