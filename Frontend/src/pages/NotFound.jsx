import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page container">
      <div className="empty-state">
        <span className="eyebrow">404</span>
        <h3>Page not found</h3>
        <p>The page you’re looking for doesn’t exist or was moved.</p>
        <Link to="/" className="btn btn-primary">Back home</Link>
      </div>
    </div>
  );
}
