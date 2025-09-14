import React from 'react';

import { BaseComponentProps } from '@/types/components-common';
import { buildClassNames, omitProps } from '@/utils/component';

// Image loading types
export type ImageLoading = 'lazy' | 'eager';

// Image fit types for CSS object-fit property
export type ImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

// Responsive image source for different breakpoints
export interface ResponsiveImageSource {
  src: string;
  srcSet?: string;
  media?: string; // CSS media query (e.g., "(max-width: 768px)")
  type?: string; // MIME type (e.g., "image/webp")
}

// Common image props
interface CommonImageProps extends BaseComponentProps {
  alt: string;
  loading?: ImageLoading;
  width?: number | string;
  height?: number | string;
  objectFit?: ImageFit;
  placeholder?: string; // Placeholder image URL while loading
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

// Simple image props (using img element)
export interface SimpleImageProps extends CommonImageProps {
  src: string;
  srcSet?: string;
  sources?: never; // Not used in simple mode
}

// Responsive image props (using picture element)
export interface ResponsiveImageProps extends CommonImageProps {
  src: string; // Fallback image
  srcSet?: string; // Fallback srcset
  sources: ResponsiveImageSource[]; // Array of sources for different breakpoints
}

// Combined image props
export type ImageProps = SimpleImageProps | ResponsiveImageProps;

/**
 * Creates image classes based on object-fit and additional classes
 * @param objectFit - CSS object-fit property
 * @param additionalClasses - Additional class names
 * @returns Combined class name string
 */
function createImageClasses(
  objectFit?: ImageFit,
  ...additionalClasses: (string | undefined)[]
): string {
  const objectFitClass = objectFit ? `object-fit-${objectFit}` : undefined;
  return buildClassNames('img-fluid', objectFitClass, ...additionalClasses);
}

/**
 * Image component that supports lazy loading and responsive images
 * Can render as a simple img element or a picture element with multiple sources
 * for different breakpoints (SP - mobile, PC - desktop)
 *
 * @param props - The props for the image
 * @returns The image component
 *
 * @example
 * // Simple image with lazy loading
 * <Image
 *   src="/images/example.jpg"
 *   alt="Example"
 *   loading="lazy"
 *   width={400}
 *   height={300}
 * />
 *
 * @example
 * // Responsive image with different sources for mobile and desktop
 * <Image
 *   src="/images/fallback.jpg"
 *   alt="Responsive Example"
 *   sources={[
 *     {
 *       src: "/images/mobile.jpg",
 *       srcSet: "/images/mobile.jpg 1x, /images/mobile@2x.jpg 2x",
 *       media: "(max-width: 768px)" // SP (Small Phone/Mobile)
 *     },
 *     {
 *       src: "/images/desktop.jpg",
 *       srcSet: "/images/desktop.jpg 1x, /images/desktop@2x.jpg 2x",
 *       media: "(min-width: 769px)" // PC (Desktop)
 *     }
 *   ]}
 *   loading="lazy"
 * />
 */
const Image: React.FC<ImageProps> = (props) => {
  const {
    alt,
    loading = 'lazy',
    objectFit,
    placeholder,
    className,
    onLoad,
    onError,
    ...restProps
  } = props;

  // Create image classes
  const imageClasses = createImageClasses(objectFit, className);

  // Common img attributes
  const imgAttributes = omitProps(
    restProps as Record<string, unknown>,
    ['sources'] as const,
  ) as React.ImgHTMLAttributes<HTMLImageElement>;

  // Handle responsive images (picture element)
  if ('sources' in props && props.sources && props.sources.length > 0) {
    const { sources, src, srcSet } = props as ResponsiveImageProps;

    return (
      <picture>
        {sources.map((source, index) => (
          <source
            key={index}
            srcSet={source.srcSet || source.src}
            media={source.media}
            type={source.type}
          />
        ))}
        <img
          {...imgAttributes}
          src={placeholder || src}
          srcSet={srcSet}
          alt={alt}
          loading={loading}
          className={imageClasses}
          onLoad={onLoad}
          onError={onError}
          data-src={src} // Store original src for lazy loading libraries
        />
      </picture>
    );
  }

  // Handle simple images (img element)
  const { src, srcSet } = props as SimpleImageProps;

  return (
    <img
      {...imgAttributes}
      src={placeholder || src}
      srcSet={srcSet}
      alt={alt}
      loading={loading}
      className={imageClasses}
      onLoad={onLoad}
      onError={onError}
      data-src={src} // Store original src for lazy loading libraries
    />
  );
};

export default Image;
