import express from 'express';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { decode } from 'metar-decoder';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
const port = 3000;

const parser = new XMLParser();

app.get('/', (_, res) => res.send('Hello World!'));

app.get('/ping', (_, res) => res.send('ping'));

app.get('/metar', async (req, res, next) => {
    try {
        const { station } = req.query;
        
        const response = await axios.get(`https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${station}&hoursBeforeNow=1`);
        const parsed = parser.parse(response.data);
        res.send(decode(parsed.response.data.METAR.raw_text));
    } catch(error) {
        error.endpoint = '/metar';
        next(error);
    }
});

app.get('/space_news', (_, res) => res.send('space_news'));

app.get('/fact', (_, res) => res.send('fact'));

app.use(errorHandler);

app.listen(port, () => console.log(`Express app running on port ${port}!`));