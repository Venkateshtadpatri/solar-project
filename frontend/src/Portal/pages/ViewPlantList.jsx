import  { useState } from 'react'
import Sidebar from '../UI/Sidebar'
import { AnimatePresence, motion } from 'framer-motion'
import PlantDetailsTable from './../Tables/PlantDetailsTable';
/**
 * ViewPlantList component:
 *
 * This component renders a page with a single tab, 'View Plant List'.
 * It uses the `useState` hook to manage the active tab state.
 * It defines an `renderActiveComponent` function to render the active component based
 * on the activeTab state.
 * It uses the `AnimatePresence` component from Framer Motion to animate the tab content.
 * It renders the tab navigation and content area with a container for the tabs and
 * content.
 * It renders the active component inside the content area.
 */
const ViewPlantList = () => {
  const [active, setActive] = useState('View Plant List');
  const pageVariants = {
    initial: { opacity: 0},  // Start hidden and to the right
    animate: { opacity: 1},    // Fade in and slide to position
    exit: { opacity: 0 }     // Fade out and slide out to the left
  }; 
  const renderActiveComponent = () => {
    if (active === 'View Plant List') {
  /**
   * Function to render the active component based on the active state.
   * If the active state is 'View Plant List', it renders the PlantDetailsTable component.
   * If the active state is neither of the above, it returns null.
   * @returns {JSX.Element | null} The rendered active component or null.
   */
      return <PlantDetailsTable />;
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
                  className={`px-4 w-full h-full flex justify-center py-2 rounded-t-3xl ${active === 'View Plant List' ? 'bg-violet-500 text-white' : 'bg-white text-black'}`}
                  onClick={() => setActive('View Plant List')}
                >
                  <div className="mt-2 font-bold text-xl">
                  Plant List
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

export default ViewPlantList