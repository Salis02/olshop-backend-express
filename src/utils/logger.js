const morgan = require('morgan');

// Log format: METHOD /url status - response-time ms
const format = ':method :url :status :res[content-length] - :response-time ms';

module.exports = morgan(format);
