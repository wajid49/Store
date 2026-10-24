# Ghar Bazaar – Kitchen, Home and Decor Store (MERN)

A full online store: customers can browse, search, add to cart, register, log in and order (Cash on Delivery).
The store owner (admin) can add, edit and delete products and manage orders.

- `client/`  the website (React, Vite, TypeScript, Tailwind CSS)
- `server/`  the backend (Node.js, Express, MongoDB, TypeScript)

"Ghar Bazaar" is only a placeholder name. Change it in `client/src/config/store.ts` and in `client/index.html`.

## 1. Before you start

1. Install **Node.js 18 or newer** (nodejs.org). Check with `node -v`.
2. You need a **MongoDB database**. Pick one:
   - **MongoDB Atlas (free, online):** create an account at mongodb.com/atlas, create a free cluster, create a database user, allow your IP address (Network Access), then click **Connect → Drivers** and copy the connection string.
   - **MongoDB on your computer:** install MongoDB Community Server and use `mongodb://127.0.0.1:27017/store`.

## 2. Start the server

Open a terminal in the `server` folder:

```bash
cd server
npm install
```

Copy `.env.example` to a new file named `.env` and fill it in:

```
MONGODB_URI=your connection string
JWT_SECRET=any long random text
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=a-strong-password-8+characters
```

Then create your admin account and sample products, and start the server:

```bash
npm run seed
npm run dev
```

You should see "Connected to MongoDB" and "Server running on http://localhost:5000".

## 3. Start the website

Open a **second** terminal in the `client` folder:

```bash
cd client
npm install
npm run dev
```

Copy `.env.example` to `.env` first (it already points to `http://localhost:5000`).
Open http://localhost:5173.

Log in with your admin email and password, then open **Admin** in the menu.

## 4. Add your real products

- The seed script adds **12 sample products** with example names and prices. Delete or edit them in **Admin → Products**.
- To show product photos, put image files in `client/public/images/` and type `/images/your-photo.jpg` in the product's **Image link** field. You can also paste a full `https://` image link. With no image, a neat placeholder is shown.

## 5. Things you can change

| What | Where |
| --- | --- |
| Store name, tagline, category names | `client/src/config/store.ts` |
| Delivery charge and free-delivery amount | `server/.env` (`SHIPPING_FEE`, `FREE_SHIPPING_OVER`) |
| Colours and fonts | `client/src/index.css` |
| Page title and description | `client/index.html` |

The delivery charge (200) and free-delivery limit (5000) are only examples. Set your own rates.

## 6. Put it online

**Server (Render.com, free plan):**
1. Push the project to GitHub. Create a new **Web Service** on Render from the repository.
2. Root Directory: `server`. Build Command: `npm install --include=dev && npm run build`. Start Command: `npm start`.
3. Add the environment variables from `.env` (MONGODB_URI, JWT_SECRET, CLIENT_ORIGIN, SHIPPING_FEE, FREE_SHIPPING_OVER). Set `CLIENT_ORIGIN` to your Netlify link (without a slash at the end).
4. In MongoDB Atlas → Network Access, allow access from anywhere (0.0.0.0/0) so Render can connect.
5. Run the seed once from your own computer (with the Atlas connection string in `server/.env`) to create the admin account.
6. Render's free plan sleeps when unused, so the first visit after a while can take about a minute.

**Website (Netlify):**
1. In `client/.env` set `VITE_API_URL` to your Render link, for example `https://your-store-api.onrender.com`.
2. Run `npm run build` inside `client`, then drag the `dist` folder to app.netlify.com/drop.
   (Or connect the GitHub repository: Base directory `client`, Build command `npm run build`, Publish directory `client/dist`, and add `VITE_API_URL` under Environment variables.)
3. The file `client/public/_redirects` is already included so page links keep working after a refresh.

## 7. Good to know

- **Payment is Cash on Delivery only.** Card, JazzCash or Easypaisa need a separate merchant account and are not included.
- Prices are always taken from the database on the server, and stock is checked and reduced when an order is placed. A cancelled order puts its items back in stock.
- Login uses a token saved in the browser. Passwords are stored hashed (never as plain text).
- Back up your database regularly (Atlas has built-in backups on paid plans, or export from MongoDB Compass).
