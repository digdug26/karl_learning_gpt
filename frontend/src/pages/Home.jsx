import { Button } from "../components/ui/button";
import { motion } from "framer-motion";

export default function Home({ onStart }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-blue-100 to-grass-100">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Button
          variant="menu"
          size="xl"
          onClick={onStart}
          className="rounded-2xl shadow-2xl hover:scale-105 active:scale-95 focus-visible:outline-dashed focus-visible:outline-4 focus-visible:outline-amber-500"
        >
          Start Karl’s Adventure!
        </Button>
      </motion.div>
    </div>
  );
}
