import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed Rooms
  const livingRoom = await prisma.room.create({
    data: { name: "Living Room", width: 400, height: 300, x: 0, y: 0 },
  });

  const bedroom = await prisma.room.create({
    data: { name: "Bedroom", width: 300, height: 300, x: 400, y: 0 },
  });

  // Seed Doors (Use `roomId` instead of `roomName`)
  await prisma.door.createMany({
    data: [
      { roomId: livingRoom.id, position: "center", width: 50 },
      { roomId: bedroom.id, position: "right", width: 50 },
    ],
  });

  // Seed Windows (if applicable)
  await prisma.window.createMany({
    data: [{ roomId: bedroom.id, position: "left", width: 80 }],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
