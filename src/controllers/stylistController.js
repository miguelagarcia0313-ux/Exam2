import stylists from '../data/stylists.js';
import { listReviews } from '../services/reviewService.js';

function listStylists(req, res) {
    const { category, mode, query, location, maxPrice, minRating, sort } = req.query;
    if ((maxPrice && !Number.isFinite(Number(maxPrice))) || (minRating && !Number.isFinite(Number(minRating)))) {
        return res.status(400).json({ error: 'Price and rating filters must be numbers.' });
    }
    let results = stylists.filter((stylist) => {
        if (category && category !== 'All' && stylist.category !== category) return false;
        if (mode && mode !== 'Any' && !stylist.modes.includes(mode)) return false;
        if (maxPrice && stylist.price > Number(maxPrice)) return false;
        if (minRating && stylist.rating < Number(minRating)) return false;
        if (location && !stylist.location.toLowerCase().includes(String(location).toLowerCase())) return false;
        if (query) {
            const search = String(query).toLowerCase();
            const searchable = [stylist.name, stylist.title, stylist.category, stylist.location, ...stylist.specialties].join(' ').toLowerCase();
            if (!searchable.includes(search)) return false;
        }
        return true;
    });

    if (sort === 'price') results = [...results].sort((a, b) => a.price - b.price);
    else if (sort === 'rating') results = [...results].sort((a, b) => b.rating - a.rating);

    res.json({ stylists: results });
}

function getStylist(req, res) {
    const stylist = stylists.find((item) => item.id === req.params.id);
    if (!stylist) return res.status(404).json({ error: 'Stylist not found.' });
    res.json({ stylist, reviews: listReviews(stylist.id) });
}

export { listStylists, getStylist };
