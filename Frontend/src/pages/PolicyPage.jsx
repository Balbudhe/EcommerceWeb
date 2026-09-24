export default function PolicyPage({ eyebrow, title, children }) {
  return (
    <div>
      <header className="page-banner">
        <p className="eyebrow">{eyebrow || "Policies"}</p>
        <h1>{title}</h1>
      </header>
      <div className="page container">
        <div className="prose">{children}</div>
      </div>
    </div>
  );
}
