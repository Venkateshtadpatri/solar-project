import { AnimatePresence, motion } from 'framer-motion'

/**
 * This component renders a home page with a background image of solar panels
 * and a large, centered heading that says "Welcome to the Solar Dashboard Application"
 * It uses framer-motion to animate the component in from the right side of the screen
 * when it is mounted, and out to the right when it is unmounted.
 */
const Home = () => {
  return (
    <AnimatePresence>
    <motion.div initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
      className="flex items-center justify-center flex-1 bg-cover bg-center text-white mt-16"
      style={{ backgroundImage: `url(/solarpanel.jpg)` }}
    >
      <motion.h1 className="text-4xl md:text-6xl font-bold">
        Welcome to the Solar Dashboard Application
      </motion.h1>
    </motion.div>
    </AnimatePresence>
  );
};

export default Home;
