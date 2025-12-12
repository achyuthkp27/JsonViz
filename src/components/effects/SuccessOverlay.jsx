import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SuccessOverlay({ show }) {
    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    {/* Backdrop Flash */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px]"
                    />

                    {/* Neon Checkmark */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative z-10 p-12 rounded-3xl bg-black/20 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                    >
                        <svg width="120" height="120" viewBox="0 0 100 100" className="drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">
                            <motion.path
                                d="M15 50 L40 75 L85 25"
                                fill="transparent"
                                stroke="#10b981"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                        </svg>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
                        >
                            <span className="text-2xl font-bold text-emerald-400 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]">
                                Validated
                            </span>
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
