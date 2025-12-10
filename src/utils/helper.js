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

module.exports = {
    normalizeImage
}