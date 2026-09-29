import React, { useId } from 'react';

interface KeyStashLogoProps {
  className?: string;
  size?: number;
  title?: string;
}

export const KeyStashLogo: React.FC<KeyStashLogoProps> = ({
  className = 'size-5',
  size,
  title,
}) => {
  const gradientId = `ks-logo-${useId().replace(/:/g, '')}`;
  const labelled = Boolean(title);

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? title : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="40"
          y1="216"
          x2="216"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <g transform="translate(132.725, 121.925) scale(1.35) rotate(-45) translate(-128, -128)">
        <circle
          cx="92"
          cy="128"
          r="44"
          stroke={`url(#${gradientId})`}
          strokeWidth="22"
          fill="none"
        />
        <path
          d="M136 128 H214"
          stroke={`url(#${gradientId})`}
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M188 128 V156"
          stroke={`url(#${gradientId})`}
          strokeWidth="22"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
