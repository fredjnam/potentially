import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const NavigationArrow = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(-1)}
      className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
    >
      <span className="text-3xl">←</span>
      <span className="text-lg">Back</span>
    </motion.button>
  );
};