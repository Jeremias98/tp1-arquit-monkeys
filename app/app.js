import express from 'express';
import errorHandler from './middlewares/errorHandler.js';
import { GetMetar, GetSpaceNews, GetUselessFact, GetSpaceNewsRedis, GetUselessFactRedis, GetMetarRedis, GetPing } from './controllers/index.js';
import rateLimiter from './middlewares/rateLimiter.js';

const app = express();

const port = 3000;

app.get('/', (_, res) => res.send('Hello World!'));

app.get('/ping', GetPing);

app.get('/metar', GetMetar);

app.get('/space_news', GetSpaceNews);

app.get('/fact', GetUselessFact);

app.get('/redis/metar', GetMetarRedis);

app.get('/redis/space_news', GetSpaceNewsRedis);

app.get('/redis/fact', GetUselessFactRedis);

app.use(rateLimiter); // All the endpoints bellow will have rate limiter applied

app.get('/rate-limiter/ping', GetPing);

app.get('/rate-limiter/metar', GetMetar);

app.get('/rate-limiter/space_news', GetSpaceNews);

app.get('/rate-limiter/fact', GetUselessFact);

app.use(errorHandler);

app.listen(port, () => console.log(`Express app running on port ${port}!`));
