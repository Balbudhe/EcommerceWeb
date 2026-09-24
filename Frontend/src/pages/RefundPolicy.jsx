import { Link } from "react-router-dom";
import PolicyPage from "./PolicyPage";
import { SITE } from "../data/site";

export default function RefundPolicy() {
  return (
    <PolicyPage title="Refund policy">
      <h2>Return Policy</h2>
      <p>
        We have a 7-day return policy, which means you have 7 days after receiving your item to
        request a return. To be eligible for a return, your item must be in the same condition that
        you received it, unworn or unused, with tags, and in its original packaging. Items without
        the original packaging are not eligible for returns. You’ll also need the receipt or proof of
        purchase.
      </p>
      <p>
        Please note that returns are only executed for products which have a defect or are damaged.
        The same will be validated by our team over the phone. To start a return, you can contact us
        at {SITE.phone}. Please note that returns will need to be sent to the following address:{" "}
        {SITE.returnAddress}. If your return is accepted, we’ll send you a return shipping label, as
        well as instructions on how and where to send your package. Items sent back to us without
        first requesting a return will not be accepted.
      </p>
      <p>
        A refund will be initiated after a quality check of the item is completed at our factory and
        the item has classified as “returned in as-is condition”. You can always contact us for any
        return question at {SITE.emails.returns}.
      </p>
      <h2>Refunds</h2>
      <p>
        We will notify you once we’ve received and inspected your return, and let you know if the
        refund was approved or not. If approved, you’ll be automatically refunded on your original
        payment method within 10 business days. Please remember it can take some time for your bank
        or credit card company to process and post the refund too. If more than 15 business days
        have passed since we’ve approved your return, please contact us at {SITE.emails.primary}.
      </p>
      <p>
        Questions? Visit our <Link to="/contact">contact page</Link>.
      </p>
    </PolicyPage>
  );
}
