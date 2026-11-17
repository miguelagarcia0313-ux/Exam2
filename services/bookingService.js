import { randomUUID } from 'node:crypto';
import stylists from '../data/stylists.js';

const bookings = [];
const allowedModes = new Set(['In person', 'Video']);
const timePattern = /^(09|10|11|12|13|14|15|16|17|18):(?:00|30)$/;

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function createBooking(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw Object.assign(new Error('Add the required booking details.'), { status: 400 });
    }
    const { stylistId, serviceName, date, time, mode, clientName, clientEmail, location } = input;
    if (typeof stylistId !== 'string' || stylistId.length > 80) {
        throw Object.assign(new Error('Choose a stylist to book.'), { status: 400 });
    }
    const stylist = stylists.find((item) => item.id === stylistId);

    if (!stylist) {
        throw Object.assign(new Error('That stylist could not be found.'), { status: 404 });
    }
    if (stylist.category === 'Hair' && !stylist.licenseVerified) {
        throw Object.assign(new Error('Haircut appointments are only available with state-licensed stylists.'), { status: 403 });
    }

    const service = stylist.services.find((item) => item.name === serviceName);
    if (!service) {
        throw Object.assign(new Error('Choose a service from this stylist’s profile.'), { status: 400 });
    }

    if (!clientName || typeof clientName !== 'string' || clientName.trim().length < 2 || clientName.length > 100) {
        throw Object.assign(new Error('Enter your name (2–100 characters).'), { status: 400 });
    }
    if (!clientEmail || typeof clientEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail) || clientEmail.length > 254) {
        throw Object.assign(new Error('Enter a valid email address.'), { status: 400 });
    }
    if (!allowedModes.has(mode) || !stylist.modes.includes(mode)) {
        throw Object.assign(new Error('Choose a meeting type offered by this stylist.'), { status: 400 });
    }
    if (mode === 'In person' && (!location || typeof location !== 'string' || location.trim().length < 2 || location.length > 200)) {
        throw Object.assign(new Error('Add a location for your in-person appointment.'), { status: 400 });
    }
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw Object.assign(new Error('Choose a valid appointment date.'), { status: 400 });
    }

    const appointmentDate = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(appointmentDate.getTime()) || formatLocalDate(appointmentDate) !== date || appointmentDate < today) {
        throw Object.assign(new Error('Choose a date that is today or later.'), { status: 400 });
    }
    if (!stylist.availability.includes(appointmentDate.getDay())) {
        throw Object.assign(new Error('This stylist is not available on that day. Try another date.'), { status: 409 });
    }
    if (typeof time !== 'string' || !timePattern.test(time)) {
        throw Object.assign(new Error('Choose an appointment time between 9:00 AM and 6:30 PM.'), { status: 400 });
    }
    if (date === formatLocalDate(today)) {
        const [hour, minute] = time.split(':').map(Number);
        const requestedTime = new Date();
        requestedTime.setHours(hour, minute, 0, 0);
        if (requestedTime <= new Date()) {
            throw Object.assign(new Error('Choose a time later today.'), { status: 400 });
        }
    }

    const [requestedHour, requestedMinute] = time.split(':').map(Number);
    const requestedStart = requestedHour * 60 + requestedMinute;
    const isTaken = bookings.some((booking) => {
        if (booking.stylistId !== stylistId || booking.date !== date) return false;
        const [bookedHour, bookedMinute] = booking.time.split(':').map(Number);
        const bookedStart = bookedHour * 60 + bookedMinute;
        return requestedStart < bookedStart + booking.duration && bookedStart < requestedStart + service.duration;
    });
    if (isTaken) {
        throw Object.assign(new Error('That time was just booked. Please choose another.'), { status: 409 });
    }

    const booking = {
        id: randomUUID(),
        stylistId,
        stylistName: stylist.name,
        serviceName: service.name,
        date,
        time,
        mode,
        location: mode === 'In person' ? location.trim() : null,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        price: service.price,
        duration: service.duration,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    bookings.push(booking);
    return booking;
}

function findBooking(id) {
    return bookings.find((booking) => booking.id === id);
}

export { createBooking, findBooking };
