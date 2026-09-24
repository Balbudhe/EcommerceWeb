import { Link, useParams } from "react-router-dom";
import MediaSlot from "../components/ui/MediaSlot";
import { getBlog, blogs } from "../data/blogs";
import "./Blogs.css";

export default function BlogDetail() {
  const { slug } = useParams();
  const post = getBlog(slug);
  const others = blogs.filter((item) => item.slug !== slug).slice(0, 3);

  if (!post) {
    return (
      <div className="page container">
        <div className="empty-state">
          <h3>Article not found</h3>
          <Link to="/blogs" className="btn btn-primary">
            Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="blog-detail">
      <header className="blog-detail-hero">
        <MediaSlot label="Article image" alt={post.title} />
        <div className="blog-detail-copy">
          <p className="eyebrow">{post.date}</p>
          <h1>{post.title}</h1>
        </div>
      </header>

      <div className="page container">
        <div className="prose">
          {post.content.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
        </div>

        {others.length > 0 ? (
          <section className="section">
            <div className="section-head">
              <h2>More from the journal</h2>
              <Link to="/blogs" className="view-all">
                View all
              </Link>
            </div>
            <div className="blog-grid">
              {others.map((item) => (
                <article key={item.slug} className="blog-card">
                  <Link to={`/blogs/${item.slug}`} className="blog-card-media">
                    <MediaSlot label="Blog image" alt={item.title} />
                  </Link>
                  <div className="blog-card-body">
                    <time>{item.date}</time>
                    <Link to={`/blogs/${item.slug}`}>
                      <h2>{item.title}</h2>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
