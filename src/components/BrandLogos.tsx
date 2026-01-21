import React from "react";

export default function BrandLogos({
  index,
  logo,
}: {
  index: number;
  logo: { src: string; name: string };
}) {
  return (
    <div key={index} className="flex justify-center items-center p-4 ">
      <img
        src={logo.src}
        alt={logo.name}
        className="h-12 opacity-80 hover:opacity-100 transition-opacity backdrop-grayscale-1 hover:grayscale-0 max-w-full object-contain"
      />
    </div>
  );
}
