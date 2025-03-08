import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const room1 = await prisma.room.create({
    data: { name: "Room 1", width: 400, height: 300, x: 0, y: 0 },
  });

  const room2 = await prisma.room.create({
    data: { name: "Room 2", width: 350, height: 300, x: 400, y: 0 },
  });

  const room3 = await prisma.room.create({
    data: { name: "Room 3", width: 400, height: 250, x: 0, y: 300 },
  });

  const room4 = await prisma.room.create({
    data: { name: "Room 4", width: 350, height: 250, x: 400, y: 300 },
  });

  await prisma.door.createMany({
    data: [
      { roomId: room1.id, position: "right", width: 50 }, // Between Room 1 & 2
      { roomId: room2.id, position: "left", width: 50 }, // Between Room 2 & 1
      { roomId: room3.id, position: "right", width: 50 }, // Between Room 3 & 4
      { roomId: room4.id, position: "left", width: 50 }, // Between Room 4 & 3
    ],
  });

  await prisma.window.createMany({
    data: [
      { roomId: room1.id, position: "top", width: 80 },
      { roomId: room2.id, position: "top", width: 80 },
      { roomId: room3.id, position: "bottom", width: 80 },
      { roomId: room4.id, position: "bottom", width: 80 },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
