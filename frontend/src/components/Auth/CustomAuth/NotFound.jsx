import { useLocation, useNavigate } from 'react-router-dom';



/**
 * The NotFound component is used to display a message when a page is not
 * found. The message displayed is based on the current URL path.
 * 
 * @returns {React.ReactElement} The JSX element representing the NotFound
 * component.
 * 
 * @example
 * <NotFound />
 */
const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  /**
   * Returns the appropriate message based on the current URL path.
   * 
   * @returns {string} The message to be displayed on the page.
   */

  const getMessage = () => {
    switch (location.pathname) {
      case '/400':
        return '400 - Bad Request';
      case '/500':
        return '500 - Internal Server Error';
      default:
        return '404 - Page Not Found';
    }
  };

  /**
   * Navigate to the home page when the button is clicked.
   */
  const handleNavigateHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-200 text-center">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">{getMessage()}</h1>
      <p className="text-lg text-gray-600 mb-6">
        Sorry, the page you are looking for does not exist or an error occurred.
      </p>
      <button
        onClick={handleNavigateHome}
        className="bg-blue-900 p-3 rounded-xl hover:bg-blue-700 transition text-white"
      >
        Go to Homepage
      </button>
    </div>
  );
};

export default NotFound;
