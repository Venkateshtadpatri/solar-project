import { Routes, Route, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Navbar, Sidebar
import Nav from './components/Home/Bar/Nav';
import Side from './components/Home/Bar/Side';
import Home from './components/Home/Home';

import Dashboard from './components/pages/Dashboard/Dashboard';
import PanelDetails from './components/pages/PanelDetails/PanelDetails';
import FaultsAndAlerts from './components/pages/FaultsAndAlerts/FaultsAndAlerts';
import Analysis from './components/pages/Analytics/Analysis';
import Maintenance from './components/pages/Maintenance/Maintenance';
import AIAndAutomation from './components/pages/AIandAutomation';
import Reports from './components/pages/Reports';
import UserInformation from './components/pages/UserInformation/UserInformation';
import UserSettings from './components/pages/UserSettings';
import Support from './components/pages/Support';

import AdminRegister from './Portal/pages/AdminRegister';
import AccessPortal from './Portal/index';
import PlantRegister from './Portal/pages/PlantRegister';
import ViewPlantList from './Portal/pages/ViewPlantList'; // Assuming this component exists
import ViewAdminList from './Portal/pages/ViewAdminList'; // Assuming this component exists
import View from './Portal/pages/View';
import Generate from './components/pages/Generate/Generate';
import ViewWeatherData from "./Portal/pages/ViewWeatherData.jsx";

import Login from './components/Auth/Login';
import EnterEmailPage from './components/Auth/EnterEmail';
import EnterOtpPage from './components/Auth/EnterOTP';
import ResetPasswordPage from './components/Auth/ResetPassword';

import PrivateRoute from './components/Auth/CustomAuth/PrivateRoute';
import NotFound from './components/Auth/CustomAuth/NotFound';
import {ToastContainer} from "react-toastify";

/**
 * The main App component that renders the entire application.
 *
 * This component renders the following components conditionally based on the route and authentication status:
 *   - Nav: If the user is not authenticated and the route is not in the excludedPaths array.
 *   - Side: If the user is authenticated and the route is not in the excludedPaths array.
 *
 * It also renders the following routes conditionally based on the authentication status:
 *   - Private routes: If the user is authenticated.
 *   - Regular routes: If the user is not authenticated.
 *
 * The PrivateRoute component is used to protect the private routes.
 * The NotFound component is used to render error pages for undefined paths.
 *
 * @returns {JSX.Element} The App component.
 */
const App = () => {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  // List of paths where Nav should not be shown
  const excludedPaths = [
    '/access-portal/admin-registration/admin-register',
    '/access-portal',
    '/access-portal/plant-registration/view-plant-list',
    '/access-portal/admin-registration/view-admin-list',
    '/access-portal/plant-registration/generate-layout',
    '/access-portal/plant-registration/plant-register',
    '/access-portal/plant-registration/view-plant-layout',
    '/access-portal/plant-registration/view-weather-data',
    '/Enter-email',
    '/enter-otp',
    '/reset-password',
    '/400',
    '/500',
    '/404',
    '/login',  // Login path, where we'll hide Nav
  ];

  // Check if the current path matches any of the excluded paths
  const isNotFoundPage = excludedPaths.includes(location.pathname) || location.pathname.startsWith('/404');

  // Determine whether to show Nav
  const shouldShowNav = !isNotFoundPage && !excludedPaths.includes(location.pathname);

  return (
    <div className="app-container h-screen flex flex-col overflow-hidden">
      {/* Conditional rendering of Nav or Side based on authentication and route */}
      {isAuth ? <Side /> : shouldShowNav && <Nav />}
      
      {/* Main Routes */}
      <Routes>

        {/* Regular Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Enter-email" element={!isAuth ? <EnterEmailPage /> : <Home />} />
        <Route path="/enter-otp" element={!isAuth ? <EnterOtpPage /> : <Home />} />
        <Route path="/reset-password" element={!isAuth ? <ResetPasswordPage /> : <Home />} />
        
        {/* Portal Pages */}
        <Route path="/access-portal" element={!isAuth ? <AccessPortal /> : <Home />} />
        
        {/* Plant Registration with Nested Routes */}
        <Route path="/access-portal/plant-registration">
          <Route path="view-plant-list" element={<ViewPlantList />} />
          <Route path="plant-register" element={<PlantRegister />} /> {/* Nested Route */}
          <Route path="view-plant-layout" element={<View />} />
          <Route path="generate-layout" element={<Generate />} />
          <Route path="view-weather-data" element={<ViewWeatherData />} />
        </Route>

        {/* Admin Registration with Nested Routes */}
        <Route path="/access-portal/admin-registration">
          <Route path="view-admin-list" element={<ViewAdminList />}/> 
          <Route path="admin-register" element={<AdminRegister />} />
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/solar-panel-details" element={<PanelDetails />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/faults-alerts" element={<FaultsAndAlerts />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/ai-automation" element={<AIAndAutomation />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/user-settings" element={<UserSettings />} />
          <Route path="/users-information" element={<UserInformation />} />
          <Route path="/support" element={<Support />} />
        </Route>

        {/* Error Pages */}
        <Route path="/400" element={<NotFound errorCode={400} />} />
        <Route path="/500" element={<NotFound errorCode={500} />} />
        <Route path="/404" element={<NotFound errorCode={404} />} />
        
        {/* Catch-all route for undefined paths */}
        <Route path="*" element={<NotFound errorCode={404} />} />
      </Routes>
      <ToastContainer />
    </div>
  );
};

export default App;