import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_CENTS } from "@/lib/shipping";

export const metadata = { title: "FAQ" };

const faqs = [
  { id: "shipping", q: "How much is shipping?", a: `Shipping is free on all orders over ${formatPrice(FREE_SHIPPING_CENTS)}. Below that, rates are shown at checkout based on your address.` },
  { id: "delivery", q: "How long does delivery take?", a: "Orders ship within 1–2 business days. Delivery usually takes 3–5 business days, and you’ll get an email when your order ships." },
  { id: "returns", q: "What is your return policy?", a: "You can return unused items within 30 days of delivery for a full refund. Contact us and we’ll send you a prepaid return label." },
  { id: "payment", q: "Which payment methods do you accept?", a: "All major cards (Visa, Mastercard, Amex), Apple Pay and Google Pay. Payments are processed securely by Stripe — we never see or store your card details." },
  { id: "account", q: "Do I need an account to order?", a: "No — you can check out as a guest. An account lets you track orders, save a wishlist and leave reviews." },
  { id: "contact", q: "How can I contact you?", a: "Email support@example.com and a real person will get back to you within one business day." },
];

export default function FaqPage() {
  return (
    <div className="container-page max-w-3xl py-16">
      <p className="eyebrow">Help centre</p>
      <h1 className="heading mt-2 text-5xl">Frequently asked questions</h1>
      <div className="mt-10 divide-y divide-ink/8 border-y border-ink/8">
        {faqs.map((f) => (
          <details key={f.id} id={f.id} className="group scroll-mt-28 py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
              {f.q}
              <span className="text-2xl text-ink/40 transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-relaxed text-ink/70">{f.a}</p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
