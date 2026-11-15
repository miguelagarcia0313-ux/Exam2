import { randomUUID } from 'node:crypto';
import stylists from '../data/stylists.js';

const bookings = [];

function fail(status, message) {
    const error = new Error(message);
    error.status = status;
    throw error;
}

function isValidDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return false;

    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.getFullYear() === Number(year)
        && date.getMonth() === Number(month) - 1
        && date.getDate() === Number(day);
}

function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function timeInMinutes(value) {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 9 || hours > 18 || minutes % 30 !== 0 || (hours === 18 && minutes !== 0)) {
        return null;
    }

    return hours * 60 + minutes;
}

export function createBooking(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        fail(400, 'A booking request is required.');
    }

    const {
        stylistId,
        serviceName,
        date,
        time,
        mode,
        clientName,
        clientEmail,
        location
    } = input;

    if (typeof stylistId !== 'string' || !stylistId) {
        fail(400, 'Choose a stylist for this booking.');
    }

    const stylist = stylists.find((item) => item.id === stylistId);
    if (!stylist) fail(404, 'Stylist not found.');

    const service = stylist.services.find((item) => item.name === serviceName);
    if (!service) fail(400, 'Choose a service offered by this stylist.');

    if (typeof clientName !== 'string' || clientName.trim().length < 2 || clientName.trim().length > 100) {
        fail(400, 'Enter a name between 2 and 100 characters.');
    }
    if (typeof clientEmail !== 'string' || clientEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
        fail(400, 'Enter a valid email address.');
    }
    if (!isValidDate(date)) fail(400, 'Choose a valid booking date.');
    if (date < localDateString(new Date())) fail(400, 'The booking date cannot be in the past.');

    const appointmentDate = new Date(`${date}T12:00:00`);
    if (!stylist.availability.includes(appointmentDate.getDay())) {
        fail(400, 'This stylist is not available on that date.');
    }

    const start = timeInMinutes(time);
    if (start === null) fail(400, 'Choose an available appointment time.');
    if (!stylist.modes.includes(mode)) fail(400, 'Choose a meeting format offered by this stylist.');
    if (mode === 'In person' && (typeof location !== 'string' || !location.trim())) {
        fail(400, 'Enter a meeting location for an in-person booking.');
    }

    const conflict = bookings.some((booking) => {
        if (booking.stylistId !== stylist.id || booking.date !== date) return false;
        const existingStart = timeInMinutes(booking.time);
        const existingEnd = existingStart + booking.duration;
        return start < existingEnd && existingStart < start + service.duration;
    });
    if (conflict) fail(409, 'This stylist is already booked for that time.');

    const booking = {
        id: randomUUID(),
        stylistId: stylist.id,
        stylistName: stylist.name,
        serviceName: service.name,
        date,
        time,
        mode,
        location: mode === 'In person' ? location.trim() : '',
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        price: service.price,
        duration: service.duration,
        status: 'confirmed'
    };

    bookings.push(booking);
    return { ...booking };
}

export function findBookingById(bookingId) {
    const booking = bookings.find((item) => item.id === bookingId);
    return booking ? { ...booking } : null;
}
