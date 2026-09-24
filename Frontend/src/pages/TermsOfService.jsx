import { Link } from "react-router-dom";
import PolicyPage from "./PolicyPage";
import { SITE } from "../data/site";

export default function TermsOfService() {
  return (
    <PolicyPage title="Terms of service">
      <p>
        This website is operated by {SITE.name}. Throughout the site, the terms “we”, “us” and “our”
        refer to {SITE.name}. By visiting our site and/or purchasing something from us, you engage
        in our Service and agree to be bound by these Terms of Service.
      </p>
      <h2>Online store terms</h2>
      <p>
        By agreeing to these Terms of Service, you represent that you are at least the age of
        majority in your state or province of residence. You may not use our products for any
        illegal or unauthorized purpose.
      </p>
      <h2>Products, prices, and orders</h2>
      <p>
        Prices for our products are subject to change without notice. Certain products may have
        limited quantities and are subject to return or exchange only according to our{" "}
        <Link to="/refund-policy">Refund Policy</Link>. We reserve the right to refuse any order you
        place with us.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        The Service and all products delivered to you are provided “as is” and “as available” for
        your use, without any representation, warranties or conditions of any kind, except as
        expressly stated by us.
      </p>
      <h2>Governing law</h2>
      <p>These Terms of Service shall be governed by and construed in accordance with the laws of India.</p>
      <h2>Contact information</h2>
      <p>
        Questions about the Terms of Service should be sent to us at {SITE.emails.primary}.{" "}
        {SITE.name} Pvt. Ltd. · {SITE.emails.primary} · {SITE.phone}
      </p>
    </PolicyPage>
  );
}
