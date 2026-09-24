import PolicyPage from "./PolicyPage";
import { SITE } from "../data/site";

export default function PrivacyPolicy() {
  return (
    <PolicyPage title="Privacy policy">
      <p>Last updated: July 1, 2026</p>
      <p>
        This Privacy Policy describes how {SITE.name} (“the Site”, “we”, “us”, or “our”) collects,
        uses, and discloses your personal information when you visit, use our services, or make a
        purchase from this website, or otherwise communicate with us regarding the Site (collectively,
        the “Services”).
      </p>
      <p>
        Please read this Privacy Policy carefully. By using and accessing any of the Services, you
        agree to the collection, use, and disclosure of your information as described in this Privacy
        Policy. If you do not agree to this Privacy Policy, please do not use or access any of the
        Services.
      </p>
      <h2>How We Collect and Use Your Personal Information</h2>
      <p>
        Information that you directly submit to us may include contact details, order information,
        account information, shopping information, and customer support information. We may also
        automatically collect usage data using cookies and similar technologies, and obtain
        information from vendors such as payment processors.
      </p>
      <h2>How We Use Your Personal Information</h2>
      <ul>
        <li>Providing products and services, including payments, fulfillment, and account management.</li>
        <li>Marketing and advertising, including promotional emails you can opt out of.</li>
        <li>Security and fraud prevention.</li>
        <li>Communicating with you and improving our Services.</li>
      </ul>
      <h2>Your Rights</h2>
      <p>
        Depending on where you live, you may have rights to access, delete, correct, or port your
        personal information, restrict processing, withdraw consent, or manage communication
        preferences. We will not discriminate against you for exercising these rights.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this Privacy Policy, or to exercise your rights, please email{" "}
        {SITE.emails.primary} or write to {SITE.name}, {SITE.address}.
      </p>
    </PolicyPage>
  );
}
