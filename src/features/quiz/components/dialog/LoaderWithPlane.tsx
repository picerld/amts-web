import { motion } from "framer-motion";
import { Plane, Radar } from "lucide-react";

export default function LoaderWithPlane({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 flex items-center justify-center"
      transition={{ duration: 0.4 }}
    >
      <div className="text-center">
        <motion.div
          className="relative mb-8"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        >
          <Radar className="w-24 h-24 text-blue-400 mx-auto opacity-60" />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Plane className="w-12 h-12 text-blue-600" />
          </motion.div>
        </motion.div>
        <motion.h3
          className="text-2xl font-bold text-gray-800 mb-2"
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {title ?? "Loading..."}
        </motion.h3>
        <motion.p
          className="text-blue-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {subtitle ?? "Validating the mission"}
        </motion.p>
      </div>
    </motion.div>
  );
}
