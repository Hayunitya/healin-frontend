"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const images = [
  "/images/hero/hero-1.png",
  "/images/hero/hero-2.png",
  "/images/hero/hero-3.png",
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-80 w-full overflow-hidden md:h-125">
      {images.map((img, index) => (
        <Image
          key={img}
          src={img}
          alt="Mental health support"
          fill
          priority={index === 0}
          className={`object-cover transition-opacity duration-1000 ${
            current === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* overlay */}
      <div className="absolute inset-0 bg-blue-100/40" />
    </section>
  );
}