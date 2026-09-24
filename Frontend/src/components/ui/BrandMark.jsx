export default function BrandMark({
  className = "nav-logo",
  wordmark = "Artiqulate",
}) {
  return (
    <>
      <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
        <path
          fill="#c48a2b"
          d="M20 3c.4 6.8-2.6 12.4-8.2 16.4 4.2 1.2 7.6.6 10.4-1.8C23 22.8 22.2 28 18 36c8.4-3.2 12.8-10.6 13.2-20.2C36 12.4 34.6 6.8 28 3.6 24.8 8.8 22.4 10 20 3Z"
        />
        <path
          fill="#e0b45a"
          d="M20 6.2c1.8 5.4 5.4 8.6 10.8 9.6-2.4 7.8-6.6 13.4-12.8 16.8 2.8-6.4 2.6-11.2-.4-15.2-2.2 2-5 2.6-8.4 1.8C13.8 14.4 17.4 10.6 20 6.2Z"
        />
      </svg>
      {wordmark ? <span>{wordmark}</span> : null}
    </>
  );
}
