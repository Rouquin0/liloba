"use client";

import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  alt?: string;
}

export default function Logo({
  size = 32,
  className = "",
  alt = "LILOBA",
}: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      className={`rounded-lg object-contain ${className}`}
      priority
    />
  );
}
