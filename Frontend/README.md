# VORA Ecommerce Frontend

React + Vite storefront — responsive UI only. All data persistence is meant for your **Node.js + MongoDB** backend (no `localStorage`).

## Run locally

```bash
cd Frontend
npm install
npm run dev
```

## Connect MongoDB backend

1. Copy `.env.example` → `.env`
2. Set:

```env
VITE_API_URL=http://localhost:5000/api
```

3. Implement the routes documented in `src/services/api.js` (auth, products, cart, wishlist, orders).

### Auth

- JWT can be returned in the response body and is kept **in memory** only (`setAuthToken`).
- Prefer **httpOnly cookies** from your backend; the client already sends `credentials: "include"` and calls `GET /auth/me` on load.

### CRUD used by the UI

| Feature | Methods |
|---------|---------|
| Auth | register, login, logout, me, profile |
| Cart | get, add, update, remove, clear |
| Wishlist | get, add, remove |
| Orders | list, create |
| Catalog | products, product, categories |

Until `VITE_API_URL` is set, the app uses in-memory mock data (lost on refresh) so you can still preview the UI.
