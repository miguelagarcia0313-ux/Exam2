import stylists from '../data/stylists.js';

const categories = new Set(['Hair', 'Clothing', 'Jewelry', 'Watches']);
const meetingModes = new Set(['In person', 'Video']);

function invalid(message) {
    return Object.assign(new Error(message), { status: 400 });
}

function updateStylistProfile(stylistId, input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw invalid('Add the required profile details.');
    }

    const stylist = stylists.find((item) => item.id === stylistId);
    if (!stylist) {
        throw Object.assign(new Error('Stylist profile not found.'), { status: 404 });
    }

    const { name, title, category, price, location, specialties, modes, bio } = input;
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
        throw invalid('Enter a display name between 2 and 100 characters.');
    }
    if (typeof title !== 'string' || title.trim().length < 2 || title.length > 120) {
        throw invalid('Enter a professional title between 2 and 120 characters.');
    }
    if (!categories.has(category)) {
        throw invalid('Choose a valid specialty.');
    }
    if (!Number.isInteger(price) || price < 1 || price > 2000) {
        throw invalid('Set a starting rate between $1 and $2,000.');
    }
    if (typeof location !== 'string' || location.trim().length < 2 || location.length > 120) {
        throw invalid('Enter a service area between 2 and 120 characters.');
    }
    if (!Array.isArray(specialties) || specialties.length < 1 || specialties.length > 8
        || specialties.some((item) => typeof item !== 'string' || !item.trim() || item.trim().length > 50)) {
        throw invalid('Add 1 to 8 specialties, each no longer than 50 characters.');
    }
    if (!Array.isArray(modes) || modes.length < 1 || modes.some((mode) => !meetingModes.has(mode))) {
        throw invalid('Choose at least one valid meeting format.');
    }
    if (typeof bio !== 'string' || bio.trim().length < 10 || bio.length > 1000) {
        throw invalid('Write an introduction between 10 and 1,000 characters.');
    }

    Object.assign(stylist, {
        name: name.trim(),
        title: title.trim(),
        category,
        price,
        location: location.trim(),
        specialties: specialties.map((item) => item.trim()),
        modes: [...new Set(modes)],
        bio: bio.trim()
    });

    return stylist;
}

export { updateStylistProfile };
