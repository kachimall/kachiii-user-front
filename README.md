# kachiii — storefront

Customer-facing shop built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4 and shadcn/ui.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Stack

| Concern        | Choice                                   |
| -------------- | ---------------------------------------- |
| Framework      | Next.js 16, React 19                     |
| Styling        | Tailwind CSS v4, shadcn/ui (Base UI)     |
| State          | Zustand (auth + cart), localStorage      |
| Forms          | React Hook Form + Zod                    |
| Toasts / icons | Sonner, lucide-react                     |

## Structure

```
src/
  app/                 /, /products, /products/[id], /cart, /checkout, /checkout/payment,
                       /checkout/success, /login, /register, /forgot-password,
                       /reset-password, /account, /account/orders/[id]
  components/
    layout/            header, footer, wordmark, cart button, user menu
    product/           product card/grid, image, price tag, add to cart
    cart/              cart view, order summary
    checkout/          checkout, address form, mock payment page
    account/           sign-in/up forms, account overview, order details
    ui/                shadcn components
  lib/
    api/               client.ts (fetch + envelope), schema.ts (API shapes),
                       products.ts (catalog), account.ts (auth, cart, checkout, orders)
    session.ts         sign-in / sign-out across the auth and cart stores
    schemas/           Zod schemas
    pricing.ts         AED formatting
  store/               auth (token) and cart stores
  types/               storefront view models
```

## Backend

Data comes from the KACHIII Laravel API (`../../backend/kachi`, started with its `start.bat`).
The shop portal is `http://localhost:8000/api/v1`; set it in `.env.local` (see `.env.example`):

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

- Catalog pages render on the server and cache API reads for a minute.
- Auth is a Sanctum bearer token kept in localStorage. There are no cookies.
- Guests keep their cart in this browser. The backend has no guest cart, so on
  sign-in the lines move to the server cart.
- Checkout needs a verified email. Delivery fees, vouchers and totals are priced by
  `POST /checkout/preview`.
- With the backend's mock gateway (`NOQODI_DRIVER=mock`), online payments land on
  `/checkout/payment`, where you choose to pay or decline.
- Demo shopper: `demo.buyer@kachi.test` / `password`. Vouchers: `WELCOME10` and
  `DEMOSTORE20`. Emails (verification, password reset) arrive in Mailpit at
  http://localhost:8025.
