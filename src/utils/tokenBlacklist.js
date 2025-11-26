const tokenBlacklist = new Set();

const blackListToken = (token) => {
    tokenBlacklist.add(token)
}

const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token)
}

module.exports = {
    blackListToken,
    isTokenBlacklisted
}