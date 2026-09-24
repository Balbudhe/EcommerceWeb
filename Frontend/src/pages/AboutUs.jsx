import "./AboutUs.css";
import { Link } from "react-router-dom";
import MediaSlot from "../components/ui/MediaSlot";
import Reveal from "../components/ui/Reveal";
import { COLLECTIONS, SITE, TRUST_ITEMS } from "../data/site";

const STORY = [
  "At Artiqulate Lifestyle, we believe that beautiful spaces begin with thoughtful choices. Our mission is to blend aesthetics, functionality, and purpose through home solutions that simplify daily living.",
  "We design space-saving furniture that helps you stay organized without compromising on style. Whether for a compact apartment or a spacious home, our multifunctional pieces are made to adapt to your lifestyle with ease and elegance.",
  "Our collection also features designer lighting and handcrafted wooden temples that bring warmth and character to your home. Each piece is made from ethically sourced, aged Indian teakwood and carefully handcrafted by skilled artisans—celebrating the charm of timeless materials and traditional craftsmanship.",
  "We are more than just a brand; we make a commitment to intentional living. With smart design and enduring quality, we help you create a home that reflects your values—functional, beautiful, and uniquely yours.",
];

export default function AboutUs() {
  return (
    <div className="about-page">
      <header className="about-hero">
        <div className="container about-hero-inner">
          <p className="eyebrow">About us</p>
          <h1>
            Beautiful spaces begin
            <span>with thoughtful choices.</span>
          </h1>
          <p className="about-lead">
            Handmade teakwood furniture, lighting, and temples — crafted in India for homes that live well.
          </p>
        </div>
      </header>

      <section className="about-story">
        <div className="container about-story-grid">
          <Reveal className="about-story-media">
            <MediaSlot alt="Artiqulate atelier" label="" />
          </Reveal>
          <Reveal className="about-story-copy" delay={80}>
            <p className="eyebrow">Our story</p>
            <h2>Aesthetics, functionality, and purpose.</h2>
            {STORY.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
            <Link to="/shop" className="btn btn-primary">
              Shop the collection
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="about-values">
        <div className="container">
          <Reveal className="about-values-head">
            <p className="eyebrow">What we stand for</p>
            <h2>Made with care, meant to last.</h2>
          </Reveal>
          <div className="about-values-grid">
            {TRUST_ITEMS.map((item, i) => (
              <Reveal className="about-value" delay={i * 70} key={item.title}>
                <span>0{i + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="about-craft">
        <div className="container about-craft-grid">
          <Reveal className="about-craft-copy">
            <p className="eyebrow">The making</p>
            <h2>Aged teak. Skilled hands. Nagpur.</h2>
            <p>
              Every piece begins with ethically sourced, aged Indian teakwood — chosen for grain, strength, and the way it warms with time. Artisans shape, join, and finish each object by hand, so the work carries both precision and character.
            </p>
            <p>
              We work from Nagpur, where tradition and contemporary living sit side by side. A share of every sale supports students, and every purchase plants a tree — because a well-made home should also look after the world around it.
            </p>
            <dl>
              <div>
                <dt>Atelier</dt>
                <dd>{SITE.address}</dd>
              </div>
              <div>
                <dt>Material</dt>
                <dd>100% original teakwood</dd>
              </div>
            </dl>
          </Reveal>
          <Reveal className="about-craft-media" delay={90}>
            <MediaSlot className="about-craft-tall" alt="Handcrafted teak detail" label="" />
            <MediaSlot className="about-craft-wide" alt="Artisan workshop" label="" />
          </Reveal>
        </div>
      </section>

      <section className="about-collections">
        <div className="container">
          <Reveal className="about-values-head">
            <p className="eyebrow">The collection</p>
            <h2>Objects for every corner of home.</h2>
          </Reveal>
          <div className="about-collection-grid">
            {COLLECTIONS.map((col, i) => (
              <Reveal as={Link} key={col.slug} to={col.path} className="about-collection" delay={i * 80}>
                <div className="about-collection-media">
                  <MediaSlot alt={col.name} label="" />
                </div>
                <div>
                  <h3>{col.shortName}</h3>
                  <p>{col.description}</p>
                  <span className="view-all">Explore</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="about-close">
        <div className="container">
          <Reveal>
            <blockquote>
              We are more than just a brand; we make a commitment to intentional living.
            </blockquote>
            <div className="about-close-actions">
              <Link to="/shop" className="btn btn-primary">
                Shop now
              </Link>
              <Link to="/contact" className="btn btn-outline">
                Get in touch
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
