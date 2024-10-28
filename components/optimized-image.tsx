import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  draggable?: boolean;
  onLoad?: () => void;
}

const OptimizedImage = ({
  src,
  alt,
  className = "",
  width = 0,
  height = 0,
  priority = false,
  draggable = true,
  onLoad,
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative ${isLoading ? "animate-pulse bg-gray-200" : ""}`}>
      <Image
        src={src}
        alt={alt}
        width={width || undefined}
        height={height || undefined}
        className={`${className} ${
          isLoading ? "scale-110 blur-2xl" : "scale-100 blur-0"
        } transition-all duration-300`}
        onLoadingComplete={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        priority={priority}
        draggable={draggable}
        fill={!width && !height}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};

export default OptimizedImage;
