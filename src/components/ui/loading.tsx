"use client"

import { motion } from "framer-motion"

export const LoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-12">
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-4 h-4 rounded-full bg-primary"
            initial={{ y: 0 }}
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.6,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <motion.p
        className="mt-4 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Carregando produtos...
      </motion.p>
    </div>
  )
}
