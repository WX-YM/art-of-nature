import { useEffect, useRef, useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { GalleryImageAsset } from '../lib/gallery';

type GalleryImageProps = {
  asset: GalleryImageAsset;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function GalleryImage({ asset, className, sizes, priority = false }: GalleryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setIsLoaded(false);
  }, [asset.src]);

  useEffect(() => {
    const image = imageRef.current;

    if (image?.complete && image.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [asset.src]);

  return (
    <div className={`relative overflow-hidden bg-secondary/70 ${className ?? ''}`}>
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="h-full w-full bg-[linear-gradient(110deg,rgba(255,255,255,0.12),rgba(255,255,255,0.42),rgba(255,255,255,0.12))] bg-[length:220%_100%] animate-[gallery-shimmer_1.8s_linear_infinite]" />
      </div>
      <ImageWithFallback
        ref={imageRef}
        src={asset.src}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`h-full w-full object-cover transition-transform duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'} `}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
