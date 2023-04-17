import express from 'express';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
const port = 3000;

app.get('/', (_, res) => res.send('Hello World!'));

app.get('/ping', (_, res) => res.send('ping'));

app.get('/metar', (req, res, _next) => {
    const { station } = req.query;
    // TODO: make a HTTP request to NOAA's API
    res.send(station);
});

app.get('/space_news', (_, res) => res.send('space_news'));

app.get('/fact', (_, res) => res.send('fact'));

app.use(errorHandler);

app.listen(port, () => console.log(`Express app running on port ${port}!`));