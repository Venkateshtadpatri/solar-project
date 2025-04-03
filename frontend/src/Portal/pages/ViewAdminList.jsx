import { useState } from 'react'
import Sidebar from '../UI/Sidebar'
import { AnimatePresence, motion } from 'framer-motion'
import AdminDetailsTable from './../Tables/AdminDetailsTable';
/**
 * ViewAdminList component:
 *
 * This component renders a page to view the list of administrators. It includes
 * a Sidebar for navigation and utilizes Framer Motion for page and component animations.
 *
 * - Manages the active state to determine which component to render, initially set to 'View Admin List'.
 * - Defines page transition animations with opacity changes for initial, animate, and exit states.
 * - Uses the `AnimatePresence` component from Framer Motion to handle the presence of components
 *   in the virtual DOM with animations.
 * - Renders an `AdminDetailsTable` component when the active state is 'View Admin List'.
 * - Includes a button to set the active state, styled conditionally based on the active state.
 * - The main content area is animated and styled to occupy the full screen height, with a
 *   background color and centered content.
 *
 * @returns {JSX.Element} The rendered component including navigation and content area.
 */

const ViewAdminList = () => {
  const [active, setActive] = useState('View Admin List');
  const pageVariants = {
    initial: { opacity: 0},  // Start hidden and to the right
    animate: { opacity: 1},    // Fade in and slide to position
    exit: { opacity: 0 }     // Fade out and slide out to the left
  }; 
  /**
   * Function to render the active component based on the active state.
   * If the active state is 'View Admin List', it renders the AdminDetailsTable component.
   * If the active state is neither of the above, it returns null.
   * @returns {JSX.Element | null} The rendered active component or null.
   */
  const renderActiveComponent = () => {
    if (active === 'View Admin List') {
      return <AdminDetailsTable />;
    }
    return null; // Fallback if neither tab is selected
  };
  return (
    <>
    <AnimatePresence>
       <div className="flex h-screen">
        {/* Navbar as Sidebar */}
        <Sidebar />
        {/* Main Content */}
            <motion.div 
            className="flex-1 p-6 bg-violet-200 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            >
            <div className="bg-white w-[200px] absolute -mt-[600px] rounded-t-3xl flex justify-center -ml-[640px]">
              <div className="w-[200px] h-[60px] rounded-t-3xl bg-white">
                <button
                  className={`px-4 w-full h-full flex justify-center py-2 rounded-t-3xl ${active === 'View Admin List' ? 'bg-violet-500 text-white' : 'bg-white text-black'}`}
                  onClick={() => setActive('View Admin List')}
                >
                  <div className="mt-2 font-bold text-xl">
                  Admin List
                  </div>
                </button>
              </div>
            </div>

            <div className="w-[1200px] ml-[300px] mt-10 h-[600px] bg-white rounded-2xl p-4 z-10">
              {/* Content Area */}
              <div className="w-full h-full p-1">
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={active}  // Key changes with activeTab, triggering exit and enter animations
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}  // Adjust duration for smoother transitions
                    className="w-full h-full"
                  >
                    {renderActiveComponent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            </motion.div>
    </div>
    </AnimatePresence>
  </>
  )
}

export default ViewAdminList