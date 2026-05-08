# MyShop-Pay Ecommerce Interface Lab

MyShop-Pay is a browser-based ecommerce interface for product browsing, cart management, checkout, account history, and session-protected login flows.

## Security Architecture

The frontend is designed for session-based authentication:

1. The browser requests `GET /login` before submitting credentials.
2. The server returns a CSRF token in the login HTML, usually as a hidden `_csrf` input or `_csrf` meta tag.
3. `login.html` copies that token into the login form and submits `POST /login` with `username`, `password`, and `_csrf`.
4. After successful login, the server creates a server-side session and sends a `JSESSIONID` cookie.
5. The browser automatically includes `JSESSIONID` on same-origin requests. The frontend does not read or store the session ID in JavaScript.
6. The server uses the cookie to look up the session and decide whether the user is authenticated and authorized.
7. Protected frontend pages call `/api/user/me` before rendering. A `401 Unauthorized` redirects to `login.html`; a `403 Forbidden` displays an access denied message.

Security-related frontend behavior:

- `authFetch()` in `script.js` uses `credentials: 'same-origin'` so browser-managed cookies are sent with API requests.
- `401` responses mean the user has no valid session and should log in.
- `403` responses mean the user is logged in but does not have the required role or permission.
- CSRF protection is handled by loading the token from `GET /login` and submitting it in the login POST body.
- Postman testing should enable cookie storage and redirect following so it behaves like a browser session.

## Validation Rules

Login:

- Email is required.
- Email must look like a valid email address.
- Password is required.
- CSRF token must be loaded before the form submits.

Signup:

- Full name is required.
- Email is required and must be valid.
- Password is required.
- Password must be at least 6 characters.
- Terms must be accepted before account creation.

Checkout:

- Full name is required.
- Country is required.
- Province is required.
- Municipality or city is required.
- Street or barangay is required.
- Zip code is required.
- Zip code must be numeric and at least 4 digits.
- A payment method must be selected.
- Cart must contain at least one item before checkout can be completed.

Cart and products:

- Product IDs must match products defined in `script.js`.
- Cart quantity must be at least 1.
- Cart totals are calculated from item price multiplied by quantity.

## API Reference

| Method | Endpoint | Auth Required | CSRF Required | Purpose |
| --- | --- | --- | --- | --- |
| `GET` | `/login` | No | No | Serves the login page and CSRF token. |
| `POST` | `/login` | No | Yes | Authenticates user credentials and creates the server-side session. |
| `POST` | `/register` | No | Backend-dependent | Creates a new user account. |
| `GET` | `/api/user/me` | Yes | No | Verifies the current session and returns the logged-in user. |
| `POST` | `/api/v1/orders` | Yes | Backend-dependent | Creates an order for the authenticated user. |

Expected auth responses:

- `200`, `201`, or `204`: request succeeded.
- `302`: redirect after login or registration, depending on backend configuration.
- `401`: not logged in or session expired. The frontend redirects to `login.html`.
- `403`: logged in but lacking permission. The frontend shows an access denied message.

## Testing

Task 8 testing artifacts are included:

- `postman/session-auth-csrf.postman_collection.json`
- `docs/task-8-testing.md`

Recommended Postman flow:

1. `GET /login` to capture CSRF.
2. `POST /register` to create a user.
3. `POST /login` with username, password, and CSRF.
4. Verify `JSESSIONID` is stored.
5. `POST /api/v1/orders` with the session cookie.
6. Delete `JSESSIONID`.
7. Retry `POST /api/v1/orders` and expect `401`.

## Frontend Files

- `login.html`: session login form with CSRF handling.
- `script.js`: product data, cart logic, validation, `authFetch()`, and protected-route handling.
- `checkout.html`: protected checkout page using `/api/user/me`.
- `docs/task-8-testing.md`: manual testing checklist.
- `postman/session-auth-csrf.postman_collection.json`: Postman collection for session and CSRF testing.
