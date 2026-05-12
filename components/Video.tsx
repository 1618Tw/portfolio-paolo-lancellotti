"use client";

type Props = {
  src: string;
  /** Tailwind max-width utility, default `max-w-3xl` so the video isn't full-page. */
  maxWidth?: string;
  /** Default autoPlay muted loop playsInline for ambient embeds. */
  autoPlay?: boolean;
  controls?: boolean;
};

export function Video({
  src,
  maxWidth = "max-w-3xl",
  autoPlay = true,
  controls = true,
}: Props) {
  return (
    <div className={`mx-auto my-12 w-full ${maxWidth}`}>
      <video
        src={src}
        className="w-full"
        autoPlay={autoPlay}
        muted
        loop
        playsInline
        controls={controls}
      />
    </div>
  );
}
