const normalizeImage = (product, baseUrl) => {
    if (!product.images) return product;

    return {
        ...product,
        images: product.images.map(img => {
            const norm = img.path.replace(/\\/g, '/');
            return {
                ...img,
                path: norm,
                url: `${baseUrl}/${norm}`
            };
        })
    };
};

const serializeMessage = (msg) => {
    return {
        message_id: msg.id._serialized,
        from: msg.from,
        to: msg.to,
        body: msg.body,
        timestamp: msg.timestamp,
        ack: msg.ack // 0 sent, 1 delivered to server, 2 delivered to phone, 3 read
    }
}

const waitUntilReady = async (client) => {
    if (client.info && client.info.wid) return true;

    return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("WhatsApp is not ready")), 15000);

        client.once("ready", () => {
            clearTimeout(timeout);
            resolve(true);
        });
    });
};


module.exports = {
    normalizeImage,
    serializeMessage,
    waitUntilReady
}