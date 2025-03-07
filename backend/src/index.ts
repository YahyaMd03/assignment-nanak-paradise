import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());

const port = process.env.PORT || 5000;

app.get("/api/floorplan", async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany();
    const doors = await prisma.door.findMany();
    const windows = await prisma.window.findMany();

    res.json({ rooms, doors, windows });
  } catch (error) {
    console.error("Error fetching floor plan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
