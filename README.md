# assignment-nanak-paradise

# Floor Plan Project

This project consists of a **Node.js API (backend)** for serving floor plan data and a **React application (frontend)** for rendering the floor plan interactively using Fabric.js.

## Folder Structure
```
project-root/
│── backend/       # Node.js API server
│── frontend/      # React frontend application
│── README.md      # Documentation
```

---

## Backend Setup (Node.js API)
### Prerequisites
- Install [Node.js](https://nodejs.org/) (latest LTS recommended)

### Installation & Running the Server
1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run database migrations
   ```sh
   npx prisma migrate dev
   ```
4. Seed the database:
   ```sh
   npx prisma db seed
   ```
4. Start the server:
   ```sh
   npm start
   ```
4. The API server will run at **http://localhost:5000**

### API Endpoint
- `GET /api/floorplan` → Returns floor plan data in JSON format

---

## Frontend Setup (React App)
### Prerequisites
- Install [Node.js](https://nodejs.org/) (latest LTS recommended)

### Installation & Running the Frontend
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Open **http://localhost:5173** in your browser (default Vite port)

---

## Environment Variables (Optional)
If required, create a `.env` file in the `backend` or `frontend` directory to store configurations.

Example `.env` for backend:
```
PORT=5000
```

Example `.env` for frontend:
```
VITE_API_URL=http://localhost:5000
```

---

## Notes
- The backend serves data for the floor plan.
- The frontend fetches data from the backend and renders it using Fabric.js.
- Ensure both backend and frontend are running simultaneously for proper functionality.

---


