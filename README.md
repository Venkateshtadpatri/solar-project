# Project: Solar Layout Generator

## Overview

This project consists of a frontend and backend application for managing and visualizing solar plant data. Users can view plant details, manage workspace layouts, and interact with various components. The project employs React.js for the frontend and a Python/Django backend integrated with MongoDB for data storage.

---

## Frontend

### Technologies Used

- **React.js**
- **TailwindCSS** for styling
- **React Spinners** for loading indicators
- **Axios** for API requests
- **Custom Hooks** for reusable logic (e.g., drag and zoom functionality)

### Features

- **Dynamic Plant Selection**: Dropdown to select plant IDs dynamically fetched from the backend.
- **Workspace Visualization**: Drag and zoom functionality with real-time scaling.
- **Loading Indicators**: Visual feedback while data is being fetched.
- **Custom Components**: Reusable components such as `SMBSection` and `ControlPanel`.

### Installation and Setup

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. The frontend will be available at `http://localhost:3000`.

### Environment Variables

Create a `.env` file in the `frontend` directory and add the following:

```env
REACT_APP_BACKEND_URL=http://127.0.0.1:8000
```

### Folder Structure

- **hooks/**: Contains custom hooks like `useDrag` for workspace interactions.
- **UI/**: Reusable UI components such as `SMBSection`.
- **pages/**: Main pages like `ViewWorkspace`.
- **App.js**: Entry point for routing.

---

## Backend

### Technologies Used

- **Python**
- **Django** with Django REST Framework
- **MongoDB** using `pymongo`

### Features

- **Solar Plant APIs**:
  - `GET /app/solar-plants/`: Fetches a list of all plants.
  - `GET /app/get-details/<plant_id>/`: Fetches details for a specific plant.
- **Authentication** (Optional): Secure endpoints for future enhancements.
- **Database Management**: Uses MongoDB to store plant data.

### Installation and Setup

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run the development server:

   ```bash
   python manage.py runserver
   ```

5. The backend will be available at `http://127.0.0.1:8000`.

### Environment Variables

Create a `.env` file in the `backend` directory and add the following:

```env
MONGO_URI=mongodb+srv://admin:<password>@node.8s5hmks.mongodb.net/
DEBUG=True
```

### Database Setup

To restore a specific database:

```bash
mongorestore --uri="<MONGO_URI>" ./data/myDatabase
```

### Folder Structure

- **app/**: Contains Django apps for API endpoints.
- **settings.py**: Backend configuration.
- **urls.py**: API routing.

---

## How to Run the Project

1. Start the backend server.
2. Start the frontend development server.
3. Access the application at `http://localhost:3000`.

---

## API Documentation

### Endpoints

#### `GET /app/solar-plants/`

- **Description**: Fetches all plant IDs.
- **Response**:
  ```json
  {
    "plants": [
      {"Plant_ID": "SP-2024-0001"},
      {"Plant_ID": "SP-2024-0002"}
    ]
  }
  ```

#### `GET /app/get-details/<plant_id>/`

- **Description**: Fetches details for a specific plant.
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "PlantID": "SP-2024-0002",
      "SmbCount": 4,
      "StringCount": 8,
      "PanelCount": 10
    }
  }
  ```

---

## Future Enhancements

- **User Authentication**: Role-based access control.
- **Real-Time Updates**: WebSocket integration for live updates.
- **Enhanced Visualization**: 3D modeling for workspace layout.

---

## Contributors

- **saigopal-dev**- Frontend Development
- **divya** - Backend Development

---
