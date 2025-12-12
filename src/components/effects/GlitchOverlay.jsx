import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function GlitchOverlay({ show }) {
    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
                    {/* Red Flash */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-red-600 mix-blend-overlay"
                    />

                    {/* Glitch Bars */}
                    {Array.from({ length: 5 }).map((_, i) => (
                        <GlitchBar key={i} index={i} />
                    ))}

                    {/* Vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(220,38,38,0.2)_100%)]" />
                </div>
            )}
        </AnimatePresence>
    );
}

function GlitchBar({ index }) {
    return (
        <motion.div
            initial={{
                x: '-100%',
                top: `${Math.random() * 100}%`,
                height: Math.random() * 50 + 10
            }}
            animate={{
                x: '200%',
            }}
            transition={{
                duration: 0.2,
                delay: Math.random() * 0.1,
                ease: "linear"
            }}
            className="absolute left-0 w-full bg-red-500/20 mix-blend-color-dodge backdrop-invert blur-[1px]"
            style={{
                transform: `skewX(${Math.random() * 40 - 20}deg)`
            }}
        />
    );
}
