const applicationForm = document.querySelector('#application-form');
const applicationError = document.querySelector('#application-error');
const applicationSuccess = document.querySelector('#application-success');
const submitButton = document.querySelector('#application-submit');

applicationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    applicationError.textContent = '';
    applicationSuccess.textContent = '';
    submitButton.disabled = true;

    try {
        const payload = Object.fromEntries(new FormData(applicationForm).entries());
        const response = await fetch('/api/stylist-applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Your application could not be sent.');
        applicationForm.reset();
        applicationSuccess.textContent = `Thanks, ${result.application.name}. Your interest application is saved as pending in this demo.`;
    } catch (error) {
        applicationError.textContent = error.message;
    } finally {
        submitButton.disabled = false;
    }
});

document.querySelector('#mobile-menu').addEventListener('click', () => {
    document.querySelector('.main-nav').classList.toggle('open');
});
