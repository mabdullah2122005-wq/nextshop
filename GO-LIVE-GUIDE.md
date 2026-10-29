# Go-live guide

This guide walks you through switching on payments and launching your store. No coding is needed. Each step takes a few minutes.

**Your store:** https://nextshop-ten-rho.vercel.app
**Admin panel:** https://nextshop-ten-rho.vercel.app/admin

---

## Step 1: Turn on Stripe payments (about 10 minutes)

### 1a. Copy your Stripe secret key
1. Log in at https://dashboard.stripe.com.
2. To test first, turn on **Test mode** (toggle at the top right). Switch it off later for real payments.
3. Go to **Developers → API keys**.
4. Under **Secret key**, click **Reveal** and copy it. It starts with `sk_test_` in test mode or `sk_live_` in live mode.

### 1b. Create the webhook
The webhook is how Stripe tells your store that a payment succeeded.
1. In Stripe, go to **Developers → Webhooks → Add endpoint**. In newer dashboards this is **Workbench → Webhooks → Create an event destination**.
2. **Endpoint URL:**
   ```
   https://nextshop-ten-rho.vercel.app/api/webhooks/stripe
   ```
   If you have connected your own domain, use `https://yourdomain.com/api/webhooks/stripe` instead.
3. **Events to send:** select these two:
   - `checkout.session.completed`
   - `checkout.session.expired`
4. Click **Add endpoint**.
5. On the endpoint page, click **Reveal** under **Signing secret** and copy it. It starts with `whsec_`.

### 1c. Add the keys to Vercel
1. Log in at https://vercel.com and open the **nextshop** project.
2. Go to **Settings → Environment Variables**.
3. Add these three variables. For each one, tick **Production** and **Preview**.

   | Name | Value |
   | --- | --- |
   | `STRIPE_SECRET_KEY` | the `sk_...` key from step 1a |
   | `STRIPE_WEBHOOK_SECRET` | the `whsec_...` secret from step 1b |
   | `NEXT_PUBLIC_APP_URL` | `https://nextshop-ten-rho.vercel.app` (or your own domain) |

4. Go to **Deployments**. On the top deployment, click **⋯ → Redeploy**. New variables only take effect after a redeploy.

### 1d. Test a payment
1. Open the store, add a product to the cart, and click **Checkout securely**.
2. In test mode, pay with:
   - Card number `4242 4242 4242 4242`
   - Any future expiry date, any 3-digit CVC, and any name and address
3. You should land on the **Thank you** page.
4. Open **Admin → Orders**. The order should show as **PAID**, and the product's stock should be lower by the quantity you bought.

To accept real payments, repeat steps 1a–1c with **Test mode switched off**: use the live `sk_live_` key, create a live webhook and its `whsec_` secret, then redeploy.

---

## Step 2: Secure the admin account (about 2 minutes)
The store comes with a demo admin login. Replace it with your own:
1. Open the store and click **Sign in → Create an account** using your own email and a strong password.
2. Sign out, then sign in with the demo admin: `admin@example.com` and the password you were given.
3. Go to **Admin → Users** and change **your** account's role to **ADMIN**.
4. Sign out, sign in with **your** account, open **Admin → Users**, and change `admin@example.com` to **CUSTOMER**.

---

## Step 3: Connect your domain (optional, about 5 minutes)
1. In Vercel, open **nextshop → Settings → Domains → Add** and type your domain.
2. Vercel shows the DNS records to add at your domain registrar (GoDaddy, Namecheap, etc.).
3. When the domain is active:
   - Update `NEXT_PUBLIC_APP_URL` in Vercel to `https://yourdomain.com` and redeploy.
   - Update the Stripe webhook URL to `https://yourdomain.com/api/webhooks/stripe`.

---

## Step 4: Order emails (optional, about 5 minutes)
Until this is set up, the store works normally but does not send emails.
1. Sign up at https://resend.com, add and verify your domain, and create an **API key**.
2. In Vercel, add these environment variables, then redeploy:

   | Name | Value |
   | --- | --- |
   | `RESEND_API_KEY` | `re_...` |
   | `EMAIL_FROM` | `Your Store <orders@yourdomain.com>` |

Customers will then receive a welcome email, an order confirmation, and shipping updates.

---

## Step 5: Add your products and branding
- **Products:** go to **Admin → Products → New product**. Paste an image URL, then set the price, stock and category. To hide the demo products, open each one and untick **Visible in store**, or delete it.
- **Store name:** change `NEXT_PUBLIC_STORE_NAME` in Vercel and redeploy.
- **Colours and logo:** edit `src/app/globals.css` in the repo (`--color-brand` and `--color-accent`). Every push to GitHub redeploys automatically.

---

## Daily use of the admin panel
| Task | Where |
| --- | --- |
| See sales, revenue and low stock | **Admin → Dashboard** |
| Ship an order | **Admin → Orders**, filter **PAID**, then set the status to **SHIPPED** (the customer is emailed) |
| Add or edit products | **Admin → Products** |
| Give someone admin access | **Admin → Users** |

## Troubleshooting
| Problem | Fix |
| --- | --- |
| Checkout says "Online payments aren't enabled yet" | `STRIPE_SECRET_KEY` is missing. Add it and redeploy. |
| Payment succeeds but the order stays PENDING | The webhook URL or `STRIPE_WEBHOOK_SECRET` is wrong. Check Stripe → Webhooks → your endpoint → recent deliveries. |
| A change made in Vercel has no effect | Redeploy. Environment variables only apply to new deployments. |

Technical documentation for developers is in `README.md` and `HANDOVER.md`.
