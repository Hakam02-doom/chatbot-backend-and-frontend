import { motion } from 'motion/react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  index: number;
}

export function ChatMessage({ message, isUser, index }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`flex gap-4 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
        className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
        }`}
      >
        {isUser ? (
          <span className="text-white font-semibold text-sm">U</span>
        ) : (
          <div className="w-5 h-5 bg-white rounded-full" />
        )}
      </motion.div>

      {/* Message Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
        className={`px-6 py-4 rounded-2xl max-w-2xl ${
          isUser
            ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30'
            : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30'
        } backdrop-blur-sm`}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
          className="text-white leading-relaxed whitespace-pre-wrap"
        >
          {message}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
