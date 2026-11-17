# Dapper

Dapper is a stylist marketplace demo. Browse independent stylists, filter by specialty and price, request an appointment, leave a review after your appointment, edit a demo stylist profile, and apply to become a stylist.

## Requirements

- Node.js 18 or newer
- npm

## Getting started

Install dependencies:

```sh
npm install
```

Start the app in development mode (restarts when JavaScript, EJS, CSS, or JSON files change):

```sh
npm run dev
```

Or start it normally:

```sh
npm start
```

Open [http://localhost:4000](http://localhost:4000). Set the `PORT` environment variable to use a different port.

Stylist profile editing is protected by a shared passphrase. `.env`, then replace the placeholder with a unique passphrase of at least 16 characters for safety:

The app loads `.env` on startup. `.env` is excluded from Git; do not remove that ignore rule or commit the passphrase. Restart the server after changing it.

## Tests

Run the test suite with Node's built-in test runner:

```sh
npm test
```

## API

All API responses use JSON.

### List stylists

```http
GET /api/stylists
```

Optional query parameters:

| Parameter | Description |
| --- | --- |
| `category` | Filter by `Hair`, `Clothing`, `Jewelry`, or `Watches` |
| `mode` | Filter by `In person` or `Video` |
| `query` | Search stylist names, titles, specialties, and locations |
| `location` | Match part of a stylist's location |
| `maxPrice` | Maximum stylist session price |
| `minRating` | Minimum stylist rating |
| `sort` | Sort by `price` or `rating` |

Example:

```text
GET /api/stylists?category=Hair&location=Brooklyn&maxPrice=100&sort=rating
```

### Get a stylist

```http
GET /api/stylists/:id
```

Returns the stylist and their reviews. Returns `404` if the stylist does not exist.

### Request a booking

```http
POST /api/bookings
Content-Type: application/json
```

Example request:

```json
{
  "stylistId": "morgan-lee",
  "serviceName": "Signature haircut",
  "date": "2030-01-15",
  "time": "10:00",
  "mode": "In person",
  "location": "Brooklyn",
  "clientName": "Taylor Client",
  "clientEmail": "taylor@example.com"
}
```

Choose a future date when the stylist is available and a service and meeting format they offer. Successful requests return `201` with the booking. Invalid requests return an error; overlapping appointments return `409`.

### Submit a review

```http
POST /api/reviews
Content-Type: application/json
```

Send a `bookingId`, an integer `rating` from 1 to 5, and a `comment` between 5 and 1,000 characters. Reviews can only be submitted after the appointment.

### Update a demo stylist profile

```http
PATCH /api/stylists/:id/profile
Content-Type: application/json
```

The profile editor validates and updates a seeded stylist in memory. It requires the HttpOnly stylist session cookie created by signing in at `/stylist/login`; changes are shared by visitors and reset when the server restarts.

### Apply to become a stylist

```http
POST /api/stylist-applications
Content-Type: application/json
```

Applications are validated, stored in memory with a `pending` status, and cleared when the server restarts. Submitting an application does not create a public stylist profile.

The pages are `/`, `/stylist/login`, `/stylist/profile`, and `/become-a-stylist`. Stylist sessions expire after 30 minutes and are cleared when the server restarts. Sign-in is limited to five failed attempts per IP per 15-minute window.

## Project structure

```text
server.js               Express app and server
public/
  css/                  Stylesheets
  images/               Local image assets
  js/                   Browser JavaScript
controllers/            HTTP request handlers
data/                   Seed stylist data
middleware/             Security, authentication, and error handling
routes/                 Page and API routes
services/               Booking, review, profile, and application logic
tests/                  Automated tests
views/
  partials/             Shared header and footer
```

## Data storage

Stylist listings are seeded in `data/stylists.js`. Bookings, reviews, profile changes, applications, and stylist sessions are stored in memory and are cleared when the server restarts. Booking history shown in the browser is stored in that browser's local storage.

### LLM Usage
GPT was used to edit HTML/CSS and to search for sources where i could understand middleware
