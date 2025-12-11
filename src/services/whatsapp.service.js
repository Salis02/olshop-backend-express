const fs = require('fs');
const path = require('path');
const { initClient, getClient, clearClient } = require('../utils/whatsappclient');

const sendMessage = async (number, message) => {
    let client = getClient();

    if (!client) {
        client = initClient();
    }

    const formatted = number.includes("@c.us")
        ? number
        : `${number}@c.us`;

    return await client.sendMessage(formatted, message);
};

const logout = async () => {
    const client = getClient();

    if (!client) {
        throw new Error("Client is not initialized");
    }

    await client.logout();
    await clearClient();

    return { message: "WhatsApp has been logged out successfully" };
};

const reset = async () => {
    const client = getClient();

    if (client) {
        await client.logout();
        await clearClient();
    }

    const dirsToDelete = [
        path.join(process.cwd(), '.wwebjs_auth'),
        path.join(process.cwd(), '.wwebjs_cache'),
        path.join(process.cwd(), 'session')
    ];

    dirsToDelete.forEach(dir => {
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    return { message: "Session reset. QR will regenerate on next startup." };
};

module.exports = { sendMessage, logout, reset };
