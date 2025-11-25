/*
    Mapping attempts login and register:
    {
        ip : {count, lastAttempt}
    }
*/
const loginAttempts = new Map();
const registerAttempts = new Map();

const rateLimitLogin = (ip) => {
    const now = Date.now();
    const WINDOW = 60 * 1000; // 1 minute
    const MAX_ATTEMPTS = 10;

    let attempts = loginAttempts.get(ip);

    // First attempt
    if (!attempts) {
        loginAttempts.set(ip, {
            count: 1,
            lastAttempt: now
        });
        return;
    }

    // Window expired → reset counter
    if (now - attempts.lastAttempt > WINDOW) {
        loginAttempts.set(ip, {
            count: 1,
            lastAttempt: now
        });
        return;
    }

    // Increment attempts
    attempts.count++;
    attempts.lastAttempt = now;

    // Check limit
    if (attempts.count > MAX_ATTEMPTS) {
        throw new Error("Too many login attempts, please try again later");
    }
};

const resetLoginAttempt = (ip) => {
    loginAttempts.delete(ip);
};

const rateLimitRegister = (ip) => {
    const now = Date.now()
    const WINDOW = 60 * 1000 // 1 minute
    const MAX_ATTEMPTS = 3;

    let attempts = registerAttempts.get(ip)

    if (!attempts) {
        registerAttempts.set(ip, {
            count: 1,
            lastAttempt: now
        })
        return
    }

    if (now - attempts.lastAttempt > WINDOW) {
        registerAttempts.set(ip, {
            count: 1,
            lastAttempt: now
        })
        return
    }

    attempts.count++;
    attempts.lastAttempt = now

    if (attempts.count > MAX_ATTEMPTS) {
        throw new Error("Too many registration attempts from this IP, Try again later");

    }
}

module.exports = {
    rateLimitLogin,
    resetLoginAttempt,
    rateLimitRegister
};
