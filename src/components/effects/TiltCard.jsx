import React, { useRef } from 'react';
import Tilt from 'react-parallax-tilt';

export function TiltCard({ children, className = '' }) {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--x', `${x}px`);
        cardRef.current.style.setProperty('--y', `${y}px`);
    };

    return (
        <Tilt
            tiltMaxAngleX={2}
            tiltMaxAngleY={2}
            perspective={1000}
            transitionSpeed={1000}
            scale={1.01}
            gyroscope={true}
            className={`h-full group ${className}`}
        >
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                className="h-full w-full relative overflow-hidden rounded-2xl"
            >
                {/* Aurora Gradient Overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                    style={{
                        background: `radial-gradient(600px circle at var(--x) var(--y), rgba(255,255,255,0.07), transparent 40%)`
                    }}
                />

                {/* Content */}
                <div className="relative z-10 h-full">
                    {children}
                </div>
            </div>
        </Tilt>
    );
}
