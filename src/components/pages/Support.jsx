import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Side from '../../components/Home/Bar/Side';

/**
 * Support component
 *
 * This component renders the Support page only if the user is authenticated.
 * Otherwise, it redirects to the home page.
 *
 * It renders a sidebar and a main content area. The main content area shows a heading
 * with the text "Support Page". The main content area is animated using framer-motion.
 *
 * @returns {JSX.Element} The Support page component.
 */
const Support = () => {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth) {
      navigate('/'); // Redirect to home page if not authenticated
    }
  }, [isAuth, navigate]);

  return (
      <div className="flex h-screen">
        {/* Sidebar */}
        <Side />

        {/* Main Content */}
        <motion.div
            className="flex-1 p-6 bg-blue-100 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
          <div className="grid gap-[20px] ml-[250px] w-full">
            {/* First Section with Two Columns */}
            <div className="grid grid-cols-2 gap-[50px]">
              <div className="h-[300px] flex flex-col justify-center bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-4">Help Center</h1>
                <p className="mb-4">
                  Access comprehensive resources to help you with common issues and questions.
                </p>
                <ul className="list-disc pl-4 space-y-2">
                  <li><a href="#" className="text-[#003366] hover:underline">FAQs</a></li>
                  <li><a href="#" className="text-[#003366] hover:underline">User Guides</a></li>
                  <li><a href="#" className="text-[#003366] hover:underline">Troubleshooting Resources</a></li>
                </ul>
              </div>
              <div className="h-[300px] flex flex-col bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mt-8 mb-3">Live Desk</h1>
                <p className="mb-4">
                  Need immediate help? Connect with our support team in real-time.
                </p>
                <button className="px-4 py-2 w-[200px] ml-[180px] mt-[50px] bg-[#003366] text-white rounded-lg hover:bg-[#0051A2]">
                  Start Live Chat
                </button>
              </div>
            </div>

            {/* Second Section Taking Full Width */}
            <div className="h-[370px] bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-2xl font-bold mb-4">Feedback</h1>
              <p className="mb-4">
                We value your input! Share your feedback or request new features:
              </p>
              <div className="flex flex-col space-y-4">
                <label htmlFor="your-feedback" className="text-sm font-medium">
                  Your Feedback
                </label>
                <textarea
                    id="your-feedback"
                    placeholder="Enter your feedback here..."
                    className="p-2 border border-gray-300 rounded-lg resize-none h-[150px]"
                ></textarea>
                <button className="px-4 py-2 w-[200px] bg-[#003366] text-white rounded-lg hover:bg-[#0051A2]">
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default Support;
