export default function MediaSlot({
  src,
  alt = "",
  className = "",
  label = "Image",
  ratio,
}) {
  const style = ratio ? { aspectRatio: ratio } : undefined;

  if (src) {
    return <img src={src} alt={alt} className={className} style={style} loading="lazy" />;
  }

  return (
    <div
      className={`media-slot ${className}`.trim()}
      style={style}
      role="img"
      aria-label={alt || label}
    >
      <span>{label}</span>
    </div>
  );
}
