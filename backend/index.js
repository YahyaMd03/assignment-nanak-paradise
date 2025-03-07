require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

// Hardcoded Floor Plan Data
const floorPlanData = {
  rooms: [
    { name: "Living Room", dimensions: { width: 5, height: 4 } },
    { name: "Bedroom", dimensions: { width: 4, height: 3 } },
    { name: "Kitchen", dimensions: { width: 3, height: 3 } }
  ],
  walls: [
    { length: 5, position: "north" },
    { length: 4, position: "east" },
    { length: 3, position: "west" },
    { length: 3, position: "south" }
  ],
  doors: [
    { position: "east", room: "Living Room" },
    { position: "west", room: "Bedroom" }
  ],
  windows: [
    { position: "north", room: "Living Room" },
    { position: "east", room: "Kitchen" }
  ]
};

// API Endpoint
app.get("/api/floorplan", (req, res) => {
  res.json(floorPlanData);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
