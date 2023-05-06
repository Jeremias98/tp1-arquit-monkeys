import express from 'express';
import errorHandler from './middlewares/errorHandler.js';
import { GetMetar, GetSpaceNews, GetUselessFact, GetSpaceNewsRedis, GetUselessFactRedis, GetMetarRedis } from './controllers/index.js';

const app = express();

const port = 3000;

app.get('/', (_, res) => res.send('Hello World!'));

app.get('/ping', (_, res) => res.send('ping'));

app.get('/metar', GetMetar);

app.get('/space_news', GetSpaceNews);

app.get('/fact', GetUselessFact);

app.get('/redis/metar', GetMetarRedis);

app.get('/redis/space_news', GetSpaceNewsRedis);

app.get('/redis/fact', GetUselessFactRedis);

app.use(errorHandler);

app.listen(port, () => console.log(`Express app running on port ${port}!`));
