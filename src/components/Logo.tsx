import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
    return (
        <img
            src="/logo.png"
            alt="Logo"
            width={size}
            height={size}
            className={`object-contain ${className}`}
        />
    );
};
