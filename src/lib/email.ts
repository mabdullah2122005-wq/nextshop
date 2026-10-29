import { Resend } from "resend";
import { formatPrice } from "./format";

type OrderEmail = {
  id: string;
  email: string;
  totalCents: number;
  items: { name: string; quantity: number; priceCents: number }[];
};

// Sends transactional email via Resend. Without RESEND_API_KEY it logs instead,
// so local development and CI never fail on email.
async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[email:dev] to=${to} subject="${subject}"`);
    return;
  }
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Store <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
  if (error) console.error("[email] send failed", error);
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export async function sendOrderConfirmation(order: OrderEmail) {
  const rows = order.items
    .map((i) => `<tr><td>${escape(i.name)} × ${i.quantity}</td><td align="right">${formatPrice(i.priceCents * i.quantity)}</td></tr>`)
    .join("");
  await send(
    order.email,
    `Order confirmed #${order.id.slice(-8).toUpperCase()}`,
    `<h2>Thanks for your order!</h2>
     <p>We've received your payment and are preparing your items.</p>
     <table width="100%" cellpadding="6">${rows}
       <tr><td><strong>Total</strong></td><td align="right"><strong>${formatPrice(order.totalCents)}</strong></td></tr>
     </table>`,
  );
}

export async function sendShippingUpdate(email: string, orderId: string, status: string) {
  await send(
    email,
    `Your order #${orderId.slice(-8).toUpperCase()} is ${status.toLowerCase()}`,
    `<p>Your order status changed to <strong>${escape(status)}</strong>.</p>`,
  );
}

export async function sendWelcome(email: string, name?: string | null) {
  await send(email, "Welcome to the store", `<p>Hi ${escape(name ?? "there")}, your account is ready.</p>`);
}
