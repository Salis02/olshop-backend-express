const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client = null;
let initialized = false;

const initClient = () => {
    if (!client) {
        client = new Client({
            authStrategy: new LocalAuth({
                clientId: "whatsapp-session-1",
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
    }

    if (!initialized) {
        initialized = true;

        client.on('qr', qr => {
            console.log("SCAN QR:");
            qrcode.generate(qr, { small: true });
        });

        client.on('ready', () => console.log("WhatsApp Ready!"));
        client.on('authenticated', () => console.log("WhatsApp Authenticated"));
        client.on('auth_failure', err => console.log("Auth Failure", err));
        client.on('disconnected', () => console.log("WhatsApp Disconnected"));

        client.initialize();
    }

    return client;
};

const getClient = () => client;

const clearClient = async () => {
    try {
        if (client) {
            await client.destroy(); // kill puppeteer cleanly
        }
    } catch (err) {
        console.log("Client destroy error:", err.message);
    }

    client = null;
    initialized = false;
};

module.exports = { initClient, getClient, clearClient };
