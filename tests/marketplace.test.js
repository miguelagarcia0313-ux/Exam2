import test from 'node:test';
import assert from 'node:assert/strict';
import stylists from '../src/data/stylists.js';
import { createBooking } from '../src/services/bookingService.js';
import { createReview } from '../src/services/reviewService.js';

function nextAvailableDate(availableDays) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    for (let offset = 0; offset < 14; offset += 1) {
        if (availableDays.includes(date.getDay())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        date.setDate(date.getDate() + 1);
    }
    throw new Error('No available day found in the next two weeks.');
}

function bookingInput(stylist, overrides = {}) {
    return {
        stylistId: stylist.id,
        serviceName: stylist.services[0].name,
        date: nextAvailableDate(stylist.availability),
        time: '18:00',
        mode: stylist.modes[0],
        clientName: 'Taylor Client',
        clientEmail: 'taylor@example.com',
        location: stylist.modes[0] === 'In person' ? 'Brooklyn' : '',
        ...overrides
    };
}

test('creates a booking and prevents double-booking the same stylist and time', () => {
    const stylist = stylists.find((item) => item.category === 'Jewelry');
    const input = bookingInput(stylist);
    const created = createBooking(input);

    assert.equal(created.stylistId, stylist.id);
    assert.equal(created.status, 'confirmed');
    assert.equal(created.price, stylist.services[0].price);
    assert.throws(() => createBooking(input), { status: 409 });
    assert.throws(() => createBooking({ ...input, time: '17:30' }), { status: 409 });
});

test('rejects invalid services and review submissions before an appointment', () => {
    const stylist = stylists.find((item) => item.category === 'Clothing');
    assert.throws(() => createBooking({}), { status: 400 });
    assert.throws(
        () => createBooking(bookingInput(stylist, { serviceName: 'Not a real service' })),
        { status: 400 }
    );

    const booking = createBooking(bookingInput(stylist));
    assert.throws(
        () => createReview({ bookingId: booking.id, rating: 5, comment: 'Really enjoyed it.' }),
        { status: 409 }
    );
});
