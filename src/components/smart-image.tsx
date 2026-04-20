// SmartImage — wraps next/image with graceful fallback for missing dimensions.
//
// Three cases, in priority order:
// 1. width + height provided → use <Image> with those
// 2. aspectRatio provided (no dims) → use <Image fill> inside aspect-ratio container
// 3. Neither → fall back to plain <img>

import Image from "next/image";

type BaseProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  style?: React.CSSProperties;
};

type WithDims = BaseProps & { width: number; height: number; aspectRatio?: never };
type WithAspect = BaseProps & { aspectRatio: string; width?: never; height?: never };
type Fallback = BaseProps & { aspectRatio?: never; width?: never; height?: never };

export type SmartImageProps = WithDims | WithAspect | Fallback;

export function SmartImage(props: SmartImageProps) {
  const { src, alt, className, sizes, priority, style } = props;

  if ("width" in props && props.width && props.height) {
    return (
      <Image
        src={src}
        alt={alt}
        width={props.width}
        height={props.height}
        sizes={sizes}
        priority={priority}
        className={className}
        style={style}
      />
    );
  }

  if ("aspectRatio" in props && props.aspectRatio) {
    return (
      <div
        className={className}
        style={{ position: "relative", aspectRatio: props.aspectRatio, ...style }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
          priority={priority}
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }

  // Fallback — should be rare after backfill
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} style={style} />;
}
