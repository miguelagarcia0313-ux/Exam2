import { randomUUID } from 'node:crypto';

const applications = [];
const categories = new Set(['Hair', 'Clothing', 'Jewelry', 'Watches']);

function invalid(message) {
    return Object.assign(new Error(message), { status: 400 });
}

function createStylistApplication(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw invalid('Add the required application details.');
    }

    const { name, email, category, location, experience = '' } = input;
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
        throw invalid('Enter your name (2–100 characters).');
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        throw invalid('Enter a valid email address.');
    }
    if (!categories.has(category)) {
        throw invalid('Choose a valid specialty.');
    }
    if (typeof location !== 'string' || location.trim().length < 2 || location.length > 120) {
        throw invalid('Enter a city or service area (2–120 characters).');
    }
    if (typeof experience !== 'string' || experience.length > 800) {
        throw invalid('Keep your experience summary under 800 characters.');
    }

    const application = {
        id: randomUUID(),
        name: name.trim(),
        email: email.trim(),
        category,
        location: location.trim(),
        experience: experience.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    applications.push(application);
    return application;
}

export { createStylistApplication };
