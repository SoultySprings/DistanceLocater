import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
            </defs>
            <path
                d="M16 2L4 8L16 14L28 8L16 2Z"
                fill="url(#logo-gradient)"
                fillOpacity="0.8"
            />
            <path
                d="M4 8V20L16 26V14L4 8Z"
                fill="url(#logo-gradient)"
                fillOpacity="0.4"
            />
            <path
                d="M28 8V20L16 26V14L28 8Z"
                fill="url(#logo-gradient)"
            />
            <circle cx="16" cy="6" r="1.5" fill="white" fillOpacity="0.9" />
        </svg>
    );
};
