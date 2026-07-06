require('express-async-errors');
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');


// Registers the notification event pipeline listeners once, at boot.
require('./events/handlers');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', routes);

app.use((req, res) => res.status(404).json({ error: { message: 'Not found' } }));
app.use(errorHandler);

module.exports = app;
