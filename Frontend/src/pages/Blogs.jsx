import { Link } from "react-router-dom";
import MediaSlot from "../components/ui/MediaSlot";
import { blogs } from "../data/blogs";
import "./Blogs.css";

export default function Blogs() {
  return (
    <div className="blogs-page">
      <header className="page-banner">
        <p className="eyebrow">Journal</p>
        <h1>Blogs</h1>
        <p>Stories on teakwood, sacred corners, and considered living.</p>
      </header>

      <div className="page container">
        <div className="blog-grid">
          {blogs.map((post) => (
            <article key={post.slug} className="blog-card">
              <Link to={`/blogs/${post.slug}`} className="blog-card-media">
                <MediaSlot label="Blog image" alt={post.title} />
              </Link>
              <div className="blog-card-body">
                <time>{post.date}</time>
                <Link to={`/blogs/${post.slug}`}>
                  <h2>{post.title}</h2>
                </Link>
                <p>{post.excerpt}</p>
                <Link to={`/blogs/${post.slug}`} className="view-all">
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
