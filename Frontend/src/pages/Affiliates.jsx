import { Link } from "react-router-dom";
import PolicyPage from "./PolicyPage";
import { SITE } from "../data/site";

export default function Affiliates() {
  return (
    <PolicyPage eyebrow="Partners" title="Affiliates">
      <p>
        Share {SITE.name} with your audience and earn a student-friendly commission on qualifying
        sales. Our affiliate programme is built for students, interior lovers, and makers who
        believe in handmade teakwood and intentional living.
      </p>
      <p>
        One purchase already plants one tree. As an affiliate, you help more homes find furniture,
        temples, and lighting that last — and you earn for introducing the brand.
      </p>
      <h2>How it works</h2>
      <ul>
        <li>Write to us with your platform (Instagram, blog, campus club, or storefront).</li>
        <li>Receive a unique link or coupon to share.</li>
        <li>Earn commission on completed orders placed through your referral.</li>
      </ul>
      <p>
        To join, email {SITE.emails.primary} or use our{" "}
        <Link to="/contact">contact form</Link> with the subject “Affiliate enquiry”.
      </p>
    </PolicyPage>
  );
}
