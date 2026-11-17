import test from 'node:test';
import assert from 'node:assert/strict';
import stylists from '../data/stylists.js';
import { createBooking } from '../services/bookingService.js';
import { createReview } from '../services/reviewService.js';
import { updateStylistProfile } from '../services/stylistProfileService.js';
import { createStylistApplication } from '../services/stylistApplicationService.js';
import {
    createSessionCookie,
    createStylistSession,
    destroyStylistSession,
    findStylistSession
} from '../services/authService.js';

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

test('updates a stylist profile and rejects invalid profile data', () => {
    const stylist = stylists.find((item) => item.id === 'morgan-lee');
    const original = {
        name: stylist.name,
        title: stylist.title,
        category: stylist.category,
        price: stylist.price,
        location: stylist.location,
        specialties: [...stylist.specialties],
        modes: [...stylist.modes],
        bio: stylist.bio
    };
    const updated = updateStylistProfile(stylist.id, {
        ...original,
        title: 'The demo profile editor',
        price: 99,
        specialties: ['Haircuts', 'Styling'],
        modes: ['Video']
    });

    assert.equal(updated.title, 'The demo profile editor');
    assert.equal(updated.price, 99);
    assert.deepEqual(updated.specialties, ['Haircuts', 'Styling']);
    assert.deepEqual(updated.modes, ['Video']);
    assert.throws(() => updateStylistProfile(stylist.id, { ...original, modes: [] }), { status: 400 });
    updateStylistProfile(stylist.id, original);
});

test('saves a pending stylist application and validates required details', () => {
    const application = createStylistApplication({
        name: 'Jordan Stylist',
        email: 'jordan@example.com',
        category: 'Clothing',
        location: 'Brooklyn, NY',
        experience: 'Personal shopping and wardrobe edits.'
    });

    assert.equal(application.name, 'Jordan Stylist');
    assert.equal(application.status, 'pending');
    assert.throws(() => createStylistApplication({ name: 'J', email: 'not-an-email' }), { status: 400 });
});

test('requires a configured passphrase and issues revocable HttpOnly sessions', () => {
    const previousPassword = process.env.STYLIST_EDITOR_PASSWORD;
    try {
        delete process.env.STYLIST_EDITOR_PASSWORD;
        assert.throws(() => createStylistSession('anything'), { status: 503 });

        process.env.STYLIST_EDITOR_PASSWORD = 'classroom-test-passphrase-2026';
        assert.throws(() => createStylistSession('incorrect'), { status: 401 });
        const token = createStylistSession('classroom-test-passphrase-2026');
        assert.equal(findStylistSession(token), token);
        assert.match(createSessionCookie(token), /HttpOnly; SameSite=Strict/);
        destroyStylistSession(token);
        assert.equal(findStylistSession(token), null);
    } finally {
        if (previousPassword === undefined) delete process.env.STYLIST_EDITOR_PASSWORD;
        else process.env.STYLIST_EDITOR_PASSWORD = previousPassword;
    }
});
