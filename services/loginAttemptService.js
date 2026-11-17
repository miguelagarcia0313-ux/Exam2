const attempts = new Map();
const loginWindowMs = 15 * 60 * 1000;
const maxLoginAttempts = 5;

function isStylistLoginBlocked(address) {
    const now = Date.now();
    for (const [attemptAddress, attempt] of attempts) {
        if (attempt.resetAt <= now) attempts.delete(attemptAddress);
    }

    const attempt = attempts.get(address);
    return Boolean(attempt && attempt.count >= maxLoginAttempts);
}

function recordStylistLoginFailure(address) {
    const now = Date.now();
    const attempt = attempts.get(address);
    if (!attempt || attempt.resetAt <= now) {
        attempts.set(address, { count: 1, resetAt: now + loginWindowMs });
        return;
    }
    attempt.count += 1;
}

function clearStylistLoginFailures(address) {
    attempts.delete(address);
}

export { clearStylistLoginFailures, isStylistLoginBlocked, recordStylistLoginFailure };
