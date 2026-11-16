const profilePicker = document.querySelector('#stylist-picker');
const profileForm = document.querySelector('#profile-form');
const profileError = document.querySelector('#profile-error');
const profileSuccess = document.querySelector('#profile-success');
let stylists = [];

function showProfile(stylist) {
    profileForm.elements.name.value = stylist.name;
    profileForm.elements.title.value = stylist.title;
    profileForm.elements.category.value = stylist.category;
    profileForm.elements.price.value = stylist.price;
    profileForm.elements.location.value = stylist.location;
    profileForm.elements.specialties.value = stylist.specialties.join(', ');
    profileForm.elements.bio.value = stylist.bio;
    profileForm.querySelectorAll('input[name="modes"]').forEach((input) => {
        input.checked = stylist.modes.includes(input.value);
    });
}

async function loadProfiles() {
    try {
        const response = await fetch('/api/stylists');
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Stylist profiles could not be loaded.');
        stylists = result.stylists;
        profilePicker.replaceChildren(...stylists.map((stylist) => {
            const option = document.createElement('option');
            option.value = encodeURIComponent(stylist.id);
            option.textContent = stylist.name;
            return option;
        }));
        if (stylists.length) showProfile(stylists[0]);
    } catch (error) {
        profileError.textContent = error.message;
        profilePicker.innerHTML = '<option value="">Profiles unavailable</option>';
    }
}

profilePicker.addEventListener('change', () => {
    const stylist = stylists.find((item) => item.id === decodeURIComponent(profilePicker.value));
    profileError.textContent = '';
    profileSuccess.textContent = '';
    if (stylist) showProfile(stylist);
});

profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    profileError.textContent = '';
    profileSuccess.textContent = '';
    const stylistId = decodeURIComponent(profilePicker.value);
    const formData = new FormData(profileForm);
    const payload = Object.fromEntries(formData.entries());
    payload.price = Number(payload.price);
    payload.specialties = payload.specialties.split(',').map((item) => item.trim()).filter(Boolean);
    payload.modes = [...profileForm.querySelectorAll('input[name="modes"]:checked')].map((input) => input.value);
    const submitButton = document.querySelector('#profile-save');
    submitButton.disabled = true;

    try {
        const response = await fetch(`/api/stylists/${encodeURIComponent(stylistId)}/profile`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Your profile could not be saved.');
        const index = stylists.findIndex((stylist) => stylist.id === result.stylist.id);
        if (index !== -1) stylists[index] = result.stylist;
        profileSuccess.textContent = 'Your profile has been updated.';
    } catch (error) {
        profileError.textContent = error.message;
    } finally {
        submitButton.disabled = false;
    }
});

document.querySelector('#mobile-menu').addEventListener('click', () => {
    document.querySelector('.main-nav').classList.toggle('open');
});

loadProfiles();
