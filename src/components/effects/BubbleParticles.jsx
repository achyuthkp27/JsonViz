import React, { useMemo } from 'react';

export function BubbleParticles({ isPaused }) {
    // Generate static set of bubbles
    const bubbles = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        size: Math.random() * 60 + 20,
        left: `${Math.random() * 90 + 5}%`,
        duration: Math.random() * 10 + 10 + 's',
        delay: Math.random() * -20 + 's', // Negative delay prevents clumping at start
        swayDuration: Math.random() * 3 + 3 + 's'
    })), []);

    return (
        <div
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
            style={{ '--play-state': isPaused ? 'paused' : 'running' }}
        >
            {bubbles.map((b) => (
                <div
                    key={b.id}
                    className="bubble-container"
                    style={{
                        width: b.size,
                        height: b.size,
                        left: b.left,
                        animationDuration: b.duration,
                        animationDelay: b.delay,
                    }}
                >
                    <div
                        className="bubble-inner bg-indigo-400/5 dark:bg-indigo-300/5 border border-indigo-200/10 dark:border-indigo-400/10 backdrop-blur-[1px]"
                        style={{
                            animationDuration: b.swayDuration
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
