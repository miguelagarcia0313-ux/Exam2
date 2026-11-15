# Dapper

Dapper is a stylist marketplace demo. Browse independent stylists, filter by specialty and price, request an appointment, and leave a review after your appointment.

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

## Project structure

```text
app.js                 Express app and server
public/                Browser JavaScript and styles
src/controllers/       API request handlers
src/data/               Seed stylist data
src/routes/             API routes
src/services/           Booking and review logic
tests/                  Automated tests
views/                  EJS page templates
```

## Data storage

Stylist listings are seeded in `src/data/stylists.js`. Bookings and reviews are stored in memory and are cleared when the server restarts. Booking history shown in the browser is stored in that browser's local storage.