
import  { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Side from '../../components/Home/Bar/Side';
/**
 * AIandAutomation component
 * 
 * This component renders the AI and Automation page only if the user is authenticated.
 * Otherwise, it redirects to the home page.
 * 
 * It renders a sidebar and a main content area. The main content area shows a heading
 * with the text "AI And Automation Page".
 */
const AIandAutomation = () => {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth) {
      navigate('/'); // Redirect to home page if not authenticated
    }
  }, [isAuth, navigate]);

  return (
    <>
    {isAuth && (
      <div className="flex h-screen">
        {/* Navbar as Sidebar */}
          <Side />
        {/* Main Content */}
        <motion.div 
          className="flex-1 p-6 bg-blue-100 flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold">AI And Automation Page</h1>
        </motion.div>
      </div>
    )}
  </>
  );
}

export default AIandAutomation