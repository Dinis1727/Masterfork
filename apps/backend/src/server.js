const { startServer } = require('./app');

const port = Number.parseInt(process.env.PORT || '3001', 10);
startServer(port);
