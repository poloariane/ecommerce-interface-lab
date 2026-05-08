# Task 8: Comprehensive Testing

## Postman Collection

Import this collection:

`postman/session-auth-csrf.postman_collection.json`

Before running it, confirm these Postman settings are enabled:

- Automatically follow redirects
- Store cookies

Collection variables:

- `baseUrl`: defaults to `http://localhost:8080`
- `username`: defaults to `task8-user@example.com`
- `password`: defaults to `Password123!`

Run the requests in order:

1. `GET /login` captures the CSRF token from a hidden `_csrf` input or `_csrf` meta tag.
2. `POST /register` creates the test user.
3. `POST /login` sends `username`, `password`, and `_csrf`.
4. `GET /api/user/me` verifies that `JSESSIONID` is present in Postman's cookie jar.
5. `POST /api/v1/orders` should succeed while the `JSESSIONID` cookie is stored.
6. `GET /login` with the pre-request script deletes `JSESSIONID`.
7. `POST /api/v1/orders` should fail with `401` after cookie removal.

If your backend uses different register, user-info, or order payload fields, update the request body in the collection while keeping the same session and CSRF flow.

## Browser Console Checks

Protected route redirect:

1. Open DevTools.
2. Clear cookies for the local app domain, especially `JSESSIONID`.
3. Visit `checkout.html`.
4. Expected result: checkout content stays hidden and the browser redirects to `login.html?redirect=...`.

Protected route success:

1. Log in through `login.html`.
2. Confirm the browser has a `JSESSIONID` cookie.
3. Visit `checkout.html`.
4. Expected result: `/api/user/me` returns success and checkout content renders.

Access denied behavior:

1. Use a logged-in user without the required role for a protected resource.
2. Trigger a request with `authFetch()` that returns `403`.
3. Expected result: the page shows `Access Denied: you do not have permission to view this page.`

Invalid form validation:

1. Open `login.html`.
2. Submit with an empty email.
3. Expected result: `Please enter your email address.`
4. Enter an invalid email such as `not-an-email`.
5. Expected result: `Please enter a valid email address.`
6. Submit with an empty password.
7. Expected result: `Please enter your password.`

Checkout validation:

1. Log in and open `checkout.html`.
2. Clear required shipping fields and click `Place Order`.
3. Expected result: each missing or invalid field displays its specific validation message.
