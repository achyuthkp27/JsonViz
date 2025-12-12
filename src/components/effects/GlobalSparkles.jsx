import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function GlobalSparkles() {
    const [sparkles, setSparkles] = useState([]);

    useEffect(() => {
        const handleClick = (e) => {
            // Don't sparkle on interactive elements to avoid noise/double effects if they have their own
            // But purely aesthetic global effect is usually fine.
            const id = Date.now();
            const newSparkles = Array.from({ length: 8 }).map((_, i) => ({
                id: id + i,
                x: e.clientX,
                y: e.clientY,
                dx: (Math.random() - 0.5) * 120,
                dy: (Math.random() - 0.5) * 120,
                scale: Math.random() * 0.5 + 0.2,
                rotate: Math.random() * 360
            }));
            setSparkles(prev => [...prev, ...newSparkles]);
            setTimeout(() => {
                setSparkles(prev => prev.filter(s => s.id < id));
                // Logic for removal needs to be smarter if we add multiple.
                // Actually unique IDs are better.
            }, 800);
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
            <AnimatePresence>
                {sparkles.map(s => (
                    <motion.div
                        key={s.id}
                        initial={{ x: s.x, y: s.y, scale: 0, opacity: 1 }}
                        animate={{
                            x: s.x + s.dx,
                            y: s.y + s.dy,
                            scale: s.scale,
                            opacity: 0,
                            rotate: s.rotate
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute w-3 h-3 text-indigo-400 dark:text-indigo-300"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                        </svg>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}


