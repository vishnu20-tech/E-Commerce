# Mini E-Commerce Website

A server-rendered e-commerce demo built with Node.js, Express, MongoDB, Mongoose, EJS, and Cloudinary. It includes a product catalog, local account authentication, product image uploads, and a per-user shopping cart.

> **Project status:** This is a learning project. Checkout currently displays a confirmation page only; it does not create a persistent order or process a payment.

## Key Features

- Browse products with text/category search and pagination.
- View product details, availability, stock, price, and images.
- Create, edit, and delete catalog products; upload multiple images to Cloudinary.
- Register, log in, and log out using Passport's local strategy and `passport-local-mongoose`.
- Maintain a cart per user, update quantities with stock checks, remove items, and clear the cart.
- View a cart subtotal and a checkout confirmation screen.
- Display success and error messages using `connect-flash`.

The application currently does not implement a payment provider, persistent order records, or complete route-level access control. See [Authentication and Authorization](#authentication-and-authorization).

## Technologies Used

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Server | Express 5 |
| Database / ODM | MongoDB / Mongoose |
| Templates | EJS / ejs-mate |
| UI | Bootstrap 5.3 (CDN) |
| Authentication | Passport, passport-local, passport-local-mongoose |
| Sessions and messages | express-session, connect-flash |
| Image uploads | Multer, multer-storage-cloudinary, Cloudinary |
| Configuration | dotenv |

Dependencies and their version ranges are listed in `package.json`; `package-lock.json` records the installed dependency tree.

## Project Architecture

```text
.
├── app.js                    # Express app, middleware, routes, and server startup
├── isLogged.js               # Authentication guard helper
├── seed.js                   # Sample product data loader
├── cloudinary/
│   └── index.js              # Cloudinary client and Multer storage setup
├── models/
│   ├── cart.js               # Cart and product-item references
│   ├── product.js            # Product catalog schema
│   └── user.js               # User schema and local-auth plugin
├── views/
│   ├── cart/                 # Cart page
│   ├── includes/             # Navbar and flash messages
│   ├── layouts/              # Shared EJS layout
│   ├── orders/               # Checkout confirmation page
│   ├── products/             # Product listing, detail, create, and edit pages
│   └── users/                # Registration and login pages
├── .env.example              # Environment variable template (safe to commit)
├── .gitignore
├── package.json
└── package-lock.json
```

Local uploads and dependencies are not included in the repository. Product image files are configured to use Cloudinary storage.

## Application Screenshots

Screenshots are not included yet. Add genuine screenshots of the running application here before publishing if you want to showcase the UI; no placeholder images are presented as real captures.

## Installation and Setup

### Prerequisites

- Node.js and npm.
- A running MongoDB instance, local or hosted.
- A Cloudinary account for product image uploads.

### Install

Clone the repository, then from its root directory install the dependencies:

```bash
npm install
```

Create a local environment file from the template:

```powershell
Copy-Item .env.example .env
```

On macOS/Linux, use `cp .env.example .env` instead. Edit `.env` with your own MongoDB, session, and Cloudinary values. Do not commit `.env`.

Start MongoDB and ensure the `MONGODB_URI` in `.env` points to the database you intend to use.

## Environment Variables Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes for a non-default database | MongoDB connection string. If omitted, the app and seed script use `mongodb://127.0.0.1:27017/shop`. |
| `SESSION_SECRET` | Yes | Secret used to sign Express session cookies. Set a long, unique random value. |
| `CLOUDINARY_CLOUD_NAME` | For image uploads | Cloudinary cloud name. |
| `CLOUDINARY_KEY` | For image uploads | Cloudinary API key. |
| `CLOUDINARY_SECRET` | For image uploads | Cloudinary API secret. |

The names and safe placeholder values are provided in `.env.example`. Never put real credentials in source files or commit them to Git.

## How to Run the Project

Run the app from the project directory:

```bash
node app.js
```

Then open [http://localhost:3000/products](http://localhost:3000/products).

The package currently has no `start` or working test script; `npm test` intentionally exits with “no test specified.” Run the optional sample-data script only after confirming the configured database:

```bash
node seed.js
```

**Warning:** `seed.js` calls `Product.deleteMany({})` before inserting its sample catalog. It deletes all existing product documents in the selected database.

## Main Application Routes

These are server-rendered Express routes, not a separate JSON API. Forms use `method-override` for `PATCH` and `DELETE`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/register` | Show the registration form. |
| `POST` | `/register` | Register a user. |
| `GET` | `/login` | Show the login form. |
| `POST` | `/login` | Authenticate a user with Passport local strategy. |
| `GET` | `/logout` | Log out the current session. |
| `GET` | `/products` | Render products; accepts `search` and `page` query parameters (8 items per page). |
| `GET` | `/products/new` | Show the product creation form. |
| `POST` | `/products` | Create a product and accept up to 10 image files. |
| `GET` | `/products/:id` | Show a product. |
| `GET` | `/products/:id/edit` | Show the product edit form. |
| `PATCH` | `/products/:id` | Update product fields, add images, and optionally delete selected images. |
| `DELETE` | `/products/:id` | Delete a product and its Cloudinary images. |
| `POST` | `/cart/:productId` | Add one available product to the cart. |
| `GET` | `/cart` | Show the current user's cart and totals. |
| `PATCH` | `/cart/:productId` | Change a cart item's quantity, subject to stock checks. |
| `DELETE` | `/cart/:productId` | Remove an item from the cart. |
| `DELETE` | `/cart` | Clear the cart. |
| `POST` | `/checkout` | Render the checkout success page; no order/payment is persisted. |

## Database Models and Relationships

- **User** — stores an email; `passport-local-mongoose` adds username/password-hash authentication fields and helpers.
- **Product** — stores product name, description, image metadata, price, category, stock, and active status.
- **Cart** — has a unique reference to one `User`; each item references a `Product` and stores a quantity. Schemas include timestamps.

There is no Order model. The checkout route currently renders a confirmation view without recording an order, charging a customer, or clearing the cart.

## Image Upload Integration (Cloudinary)

`cloudinary/index.js` configures the Cloudinary client and a `multer-storage-cloudinary` storage engine. Product forms accept multiple images (up to 10 per upload), restricted by the storage configuration to JPEG/PNG formats. Product documents store each uploaded image's Cloudinary URL and filename. Product deletion and image-removal flows request deletion from Cloudinary.

Cloudinary credentials must be configured in `.env` for uploads and image deletion to work.

## Authentication and Authorization

Registration and login use Passport's local strategy with `passport-local-mongoose`; Express sessions retain the authenticated user, and the navigation displays login/register or cart/logout links based on session state.

An `isLoggedIn` helper exists, but it is not applied to the route handlers in `app.js`. Product management routes also have no role-based authorization in the current implementation. Cart handlers access `req.user`, so route protection should be completed before exposing the app publicly. The navbar's logout form submits `POST /logout`, while the application currently defines `GET /logout`.

## Future Improvements

- Apply authentication middleware to cart routes and add explicit authorization for product management.
- Align the logout form and route methods.
- Persist orders and integrate a payment provider before presenting checkout as a completed purchase.
- Add validation, error handling, and automated tests for routes and model behavior.
- Configure a production session store and deployment-ready server settings.
- Capture real screenshots and add them to the repository.

## Author

**[Your Name]** — replace this placeholder with your name and link to your GitHub profile before publishing.
