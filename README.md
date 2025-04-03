# Project: Solar Plant Management System

## Overview

This project is a comprehensive solution for managing and visualizing solar plant data. It includes a **React.js** frontend and a **Python/Django** backend integrated with **MongoDB** for data storage. Users can view plant details, manage workspace layouts, and interact with various components.

---

## Frontend

### Technologies Used

- **React.js for building user interfaces**
- **TailwindCSS for styling**
- **Material-UI (MUI) for UI components and icons**
- **Emotion for CSS-in-JS styling**
- **Framer Motion for animations**
- **Axios for API requests**
- **Redux Toolkit for state management**
- **React Redux for integrating Redux with React**
- **React Router for navigation**
- **React Spinners for loading indicators**
- **Recharts for data visualization**
- **Day.js for date manipulation**
- **JS PDF and JS PDF AutoTable for PDF generation**
- **React Toastify for notifications**
- **React Otp Input for OTP handling**
- **React Phone Input 2 and React Phone Number Input for phone number input handling**
- **React Dropzone for file uploads**
- **React Lazyload for lazy loading components**
- **React Window for efficiently rendering large lists**
- **React Zoom Pan Pinch for drag and zoom functionality**
- **Font Awesome for icons**
- **Country State City library for handling location data**
- **TanStack React Table for creating tables**
- **MDB React UI Kit for additional UI components**

### Features

- **Dynamic Plant Selection**: Dropdown to select plant IDs dynamically fetched from the backend.
- **Workspace Visualization**: Drag and zoom functionality with real-time scaling.
- **Loading Indicators**: Visual feedback while data is being fetched.
- **Custom Components**: Reusable components such as `SMBSection` and `ControlPanel`.

### Installation and Setup

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd solar-layout/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. The frontend will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the `frontend` directory and add the following:

```env
VITE_SMB_IMAGE_URL=/smb-image.png
```

### Folder Structure

#### Frontend

```
frontend/                      # React-based frontend for the Solar Plant Management System
├── .env                       # Environment variables (e.g., API URLs, keys)
├── .gitignore                 # Files and directories to exclude from version control
├── eslint.config.js           # ESLint configuration for code quality and linting
├── index.html                 # Main HTML template for the React application
├── package.json               # Project metadata, scripts, and dependencies
├── postcss.config.js          # PostCSS configuration for CSS transformations
├── README.md                  # Documentation for setting up and running the frontend
├── tailwind.config.js         # TailwindCSS configuration file
├── vercel.json                # Configuration for Vercel deployment
├── vite.config.js             # Vite configuration for bundling and development server
|
├── public/                    # Static assets served directly
│   ├── favicon.ico            # Website favicon
│   ├── index.html             # Main HTML template
│   ├── logo-icon.svg          # Logo in SVG format
│   ├── logo192.png            # Logo for web app manifest (192x192)
│   ├── logo512.png            # Logo for web app manifest (512x512)
│   ├── manifest.json          # Web app manifest for PWA support
│   ├── mepstralogo.png        # Mepstra logo
│   ├── robots.txt             # Rules for web crawlers
│   ├── smb-image.png          # Image for the SMB section
│   ├── smb-image.svg          # SVG version of the SMB image
│   ├── solar-panels.ico       # Icon representing solar panels
│   ├── solarpanel.jpg         # Image of a solar panel
│   └── vite.svg               # Vite logo
|
├── src/                       # Source code for the frontend
│   ├── App.css                # Global styles for the main App component
│   ├── App.jsx                # Main App component with routing logic
│   ├── index.css              # Base styles imported from TailwindCSS
│   ├── main.jsx               # Entry point for the React application
│   |
│   ├── components/            # Reusable UI components
|   |   |
|   |   |__ api/               # Components for API integrations
|   |   |    |
|   |   |    |__ DustDetection.jsx  # Component for Dust Detection API
|   |   |    |__ WeatherAPI.jsx     # Component for Weather API
|   |   |    |__ WeatherContext.jsx # Context for managing Weather API data
|   |   |   
│   │   ├── Auth/              # Components for user authentication
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── EnterEmail.jsx        # Email input for password recovery
│   │   │   ├── EnterOTP.jsx          # OTP input for verification
│   │   │   ├── ResetPassword.jsx     # Password reset form
│   │   │   └── CustomAuth/           # Custom authentication components
│   │   │       ├── ErrorBoundary.jsx # Error boundary for catching application errors
│   │   │       ├── NotFound.jsx      # 404 error page
│   │   │       ├── PrivateRoute.jsx  # Route protection for authenticated users
│   │   │       ├── useOtpInput.jsx   # Custom hook for handling OTP input
│   │   │       └── useOtpTimer.jsx   # Custom hook for OTP countdown timer
|   |   |__ Home/              # Components for the Home page
|   |   |   |
|   |   |   |__ Bar/           # Navbar and Sidebar components
|   |   |   |    |_ Nav.jsx     # Navbar for the homepage
|   |   |   |    |_ Sidebar.jsx # Sidebar for the Dashboard page
|   |   |   |__ Home.jsx        # Main Home page component
|   |   | 
|   │   ├── hooks/              # Custom React hooks for state and effects
│   │   |      ├── useDrag.jsx         # Hook for draggable UI elements
│   │   |      ├── useZoom.jsx         # Hook for zoom functionality
│   │   |      └── useWeatherCard.jsx  # Hook for fetching and displaying weather data
|   |   |__ icons/
|   |   |    |__ ...                   # List of image files used in the application
|   |   |    |__ index.jsx             # Centralized export of imported images
|   |   |
|   |   |__ pages/             # Page components for various features
|   |   |    |
|   |   |    |__ Analytics/    # Analytics page components
|   |   |    |     |__ Table/  # Components for displaying analytics tables
|   |   |    |     |    |__ AnalyticsTable.jsx  # Displays analytics table data
|   |   |    |     |__ UI/     # UI components for analytics
|   |   |    |     |    |__ ViewGraphModal.jsx  # Modal for displaying graphs using Chart.js
|   |   |    |     |__ Analytics.jsx           # Main Analytics page component
|   |   |    |
|   |   |    |__ Dashboard/    # Dashboard page components
|   |   |    |     |__ UI/     # UI components for the Dashboard
|   |   |    |     |   |__ AlertsTable.jsx     # Table for displaying alerts
|   |   |    |     |   |__ Card.jsx            # Displays cards with energy data from APIs
|   |   |    |     |   |__ DigitalClock.jsx    # Displays current time and date
|   |   |    |     |   |__ TotalEnergyChart.jsx # Displays energy time chart using Chart.js
|   |   |    |     |__ Dashboard.jsx          # Main Dashboard page component
|   |   |    | 
|   |   |    |__ FaultsAndAlerts/ # Components for Faults and Alerts page
|   |   |    |     |__ Tables/   # Table components for Faults and Alerts
|   |   |    |     |     |__ ActiveAlerts.jsx  # Table for active alerts
|   |   |    |     |     |__ AlertHistory.jsx  # Table for alert history
|   |   |    |     |__ FaultsAndAlerts.jsx    # Main Faults and Alerts page component
|   |   |    | 
|   |   |    |__ Generate/       # Components for generating solar layouts (optional)
|   |   |    |     |__ Generate.css # Styles for the layout generation page
|   |   |    |     |__ Generate.jsx # Main layout generation page
|   |   |    |     |__ Navbar.jsx   # Navbar for user input
|   |   |    |     |__ SMBSection.jsx # Component for SMB section
|   |   |    |     |__ Workspace.jsx # Canvas for displaying the layout
|   |   |    |
|   |   |    |__ Maintenance/   # Components for the Maintenance page
|   |   |    |     |__ Tables/  # Table components for maintenance data
|   |   |    |     |     |__ MaintenanceHistory.jsx # Table for maintenance history
|   |   |    |     |     |__ UpComingMaintenance.jsx # Table for upcoming maintenance
|   |   |    |     |__ UI/      # UI components for maintenance
|   |   |    |     |    |__ UpdateTaskModal.jsx # Modal for updating maintenance tasks
|   |   |    |     |__ Maintenance.jsx         # Main Maintenance page component
|   |   |    |
│   │   │    ├── PanelDetails/  # Components for displaying detailed panel information
│   │   │    │   |__ Tables/    # Table components for panel data
│   │   │    │   |     |__ PanelDetails.jsx # Displays solar panel details
│   │   │    |   |     |__ SMBTable.jsx     # Table for SMB data
|   |   |    |   |__ UI/        # UI components for panel details
|   |   |    |   |    |__ AddSMBModal.jsx (Deprecated)  # Modal for adding SMBs to the database
|   |   |    |   |    |__ DeleteSMBModal.jsx (Deprecated) # Modal for deleting SMBs from the database
|   |   |    |   |    |__ TimePulse.jsx  # Displays live data pulse over time
|   |   |    |   |    |__ ViewSMBModal.jsx # Modal for viewing SMB details
|   |   |    |   |__ PanelDetails.jsx    # Main Panel Details page component
|   |   |    |
|   |   |    |__ Reports/       # Components for the Reports page
|   |   |    |     |__ Tabs/    # Components for report generation and listing
|   |   |    |     |     |__ ReportGeneration.jsx # Generates reports based on user input
|   |   |    |     |     |__ ReportList (Deprecated) # Displays a list of generated reports
|   |   |    |     |__ UI/      # UI components for reports
|   |   |    |     |    |__ fetchWeatherData.jsx # Fetches weather data from APIs
|   |   |    |     |    |__ getFormattedDateTime.jsx # Formats date and time for reports
|   |   |    |     |__ Reports.jsx         # Main Reports page component
|   |   |    | 
|   |   |    |__ UserInformation/ # Components for the User Information page
|   |   |    |      |__ Tables/  # Table components for user data
|   |   |    |      |     |__ LoginHistory.jsx # Table for login history
|   |   |    |      |     |__ UserInformationTable.jsx # Table for user information
|   |   |    |      |__ UI/      # UI components for user information
|   |   |    |      |    |__ AddUserModal.jsx # Modal for adding users to the database
|   |   |    |      |    |__ DeleteUserModal.jsx # Modal for deleting users from the database
|   |   |    |      |    |__ UpdateUserModal.jsx # Modal for updating user information
|   |   |    |      |__ UserInformation.jsx     # Main User Information page component
|   |   |    | 
│   │   │    ├── AIandAutomation.jsx  # Page for AI and Automation features
│   │   │    ├── Support.jsx          # Support page component
│   │   │    └── UserSettings.jsx     # User settings page component
│   │   |__ UI (Optional)
|   |       |__ LayoutSubmitModal.jsx # Modal for submitting generated layouts to the database
|   |       |__ MiniMap.jsx           # Displays a minimap for layout visualization
|   |   
│   ├── Portal/            # Components for the Access Portal
│   │   ├── UI/            # UI-specific components
│   │   │   ├── AdminDeleteModal.jsx  # Modal for deleting admin data
│   │   │   ├── AdminUpdateModal.jsx  # Modal for updating admin data
│   │   │   |── ControlPanel.jsx      # Displays workspace control panel
│   │   │   |── LocationSelect.jsx    # Dropdown for selecting locations
│   │   │   |── PlantDeleteModal.jsx  # Modal for deleting plant data
│   │   │   |── PlantUpdateModal.jsx  # Modal for updating plant data
│   │   │   |── Sidebar.jsx           # Sidebar for portal navigation
│   │   │   |── ThemeToggleButton.jsx # Button for toggling themes
│   │   │   |── useDrag.jsx           # Hook for draggable elements
│   │   │   |── ViewAdminModal.jsx    # Modal for viewing admin details
│   │   │   |── ViewNavbar.jsx        # Navbar for portal pages
│   │   │   |── ViewPlantModal.jsx    # Modal for viewing plant details
│   │   │   |── ViewSMBSection.jsx    # Displays SMB section details
│   │   │   |── ViewWorkspace.jsx     # Displays workspace layout
│   │   |__ pages/          # Portal-specific pages
│   │   |     ├── ViewPlantList.jsx  # Displays a list of plants in the system
│   │   |     ├── PlantRegister.jsx  # Form for registering new plants
│   │   |     ├── Generate.jsx       # Page for generating reports
│   │   |     |── ViewWeatherData.jsx # Visualizes weather data
|   |   |     |__ AdminRegister.jsx  # Form for registering admins
|   |   |     |__ View.jsx           # Displays plant layout view
│   |   |__ Tables/
|   |   |    |__ AdminDetailsTable.jsx # Table for admin details
|   |   |    |__ PlantDetailsTable.jsx # Table for plant details
│   │   │__ index.js # Main page component for Access Portal
│   |
│   ├── redux/                 # Redux store configuration and slices
│        ├── index.js           # Configures the Redux store and middleware
│        ├── authSlice.js       # Manages user authentication state
│        ├── plantSlice.js      # Manages plant data
│        ├── userIdSlice.js     # Manages user IDs
│        ├── emailSlice.js      # Manages email data
│        ├── userSlice.js       # Manages user profile and data
│        └── reportSlice.js     # Manages report data

```

#### Backend

```
backend/                    # Django backend for API endpoints and server-side logic
├── env/                    # Python virtual environment folder
├── myproject/              # Main Django project folder
│   ├── media/              # Folder for storing media files
│   │   ├── permitfiles/    # Stores licenses and permit files
│   │   └── reports/        # Stores solar plant reports
│   ├── myapp/              # Django app for core functionality
│   │   ├── __pycache__/    # Compiled Python files
│   │   ├── migrations/     # Database migration files
│   │   ├── admin.py        # Admin panel configuration
│   │   ├── apps.py         # App-specific configuration
│   │   ├── models.py       # Database models for the app
│   │   ├── serializers.py  # Serializers for converting data to/from JSON
│   │   ├── tests.py        # Unit tests for the app
│   │   ├── urls.py         # URL routing for the app
│   │   └── views.py        # Views for handling API requests
│   ├── myproject/          # Django project-level configuration
│   │   ├── __init__.py     # Project initialization file
│   │   ├── settings.py     # Main settings for the Django project
│   │   ├── urls.py         # Root URL configuration
│   │   ├── wsgi.py         # WSGI configuration for deployment
│   │   └── asgi.py         # ASGI configuration for asynchronous support
│   ├── static/             # Static files for the project
│   │   ├── images/         # Folder for static images
│   │        └── mepstralogo.png # Mepstra logo image
|   ├── staticfiles/        # Generated static files for deployment
|   ├── templates/          # HTML templates for the project
|   │   ├── email.html       # Template for account creation emails
|   │   └── otp_email.html   # Template for OTP email notifications
|   ├── db.sqlite3          # SQLite database file generated through migrations
|   ├── manage.py           # Django management script
|   ├── historical_alerts_data.py # Script to generate historical alerts data in JSON
|   ├── historical_data.py  # Script to generate historical data in JSON
|   ├── login_error.log     # Log file for recording login errors
|   ├── MongoDB_DB_Seeding.py # Script to seed MongoDB database with JSON data
├── requirements.txt        # List of Python dependencies for the project
```

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
   cd solar-layout/backend
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
3. Access the application at `http://localhost:5173`.

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

- **saigopal-dev** - Frontend Development
- **divya** - Backend Development

---