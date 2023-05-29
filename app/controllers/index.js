import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { decode } from 'metar-decoder';
import https from 'https';
import {createClient} from "redis";
import {StatsD} from 'hot-shots'

// Redis Client
const redisClient = createClient({url: 'redis://redis:6379'});

await redisClient.connect();
console.log("Redis client connected")

// StatsD Client

function runMetrics() {
    const statsDClient = new StatsD({
      host: 'graphite',
      port: 8125,
      protocol: 'udp',
      prefix: 'custom.metrics.',
      errorHandler: function (error) {
        console.log("Socket errors caught here: ", error);
      },

    });

    const startTime = new Date();


    // Send metrics
    statsDClient.timing('users2.timers', 42);
    statsDClient.timing('users2.timer', 42);
    statsDClient.timing('timers.users2', 42);
    statsDClient.timing('timer.users2', 42);

    statsDClient.timer('users9.timers', 42);
    statsDClient.timer('users9.timer', 42);
    statsDClient.timer('timers.users9', 42);
    statsDClient.timer('timer.users9', 42);

    statsDClient.timing('users2.timers', 80);
    statsDClient.timing('users2.timer', 80);
    statsDClient.timing('timers.users2', 80);
    statsDClient.timing('timer.users2', 80);

    statsDClient.timer('users9.timers', 80);
    statsDClient.timer('users9.timer', 80);
    statsDClient.timer('timers.users9', 80);
    statsDClient.timer('timer.users9', 80);
    statsDClient.increment('users4.count');

        // Timing: sends a timing command with the specified milliseconds
        statsDClient.timing('users8.timer', 42);
        statsDClient.timing('users8.timer', 42);

        // Timing: also accepts a Date object of which the difference is calculated
        statsDClient.timing('users7.timer', new Date());


    // Calculate the elapsed time
    const endTime = new Date();
    const elapsedMs = endTime - startTime;

    // Send the elapsed time as a Timer metric
    statsDClient.timing('users5', elapsedMs);

    statsDClient.timer('user3', 42);

    statsDClient.gauge('gagues.users1', 100);

    console.log("Metrics sent");

    // Close the StatsD client after sending metrics
    statsDClient.close();

    // Other controller logic...
    // ...
}

const parser = new XMLParser();
const httpsAgent =  new https.Agent({
    rejectUnauthorized: false // Needed for Mac OS
});

export const GetPing = (req, res, next) => {
    runMetrics();

    try {
        res.send('ping');
    } catch(error) {
        error.endpoint = req.originalUrl;
        next(error);
    }
}


export const GetMetar = async (req, res, next) => {
    runMetrics();

    try {
        const { station } = req.query;

        const response = await axios.get(
            `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${station}&hoursBeforeNow=1`,
            {httpsAgent}
        );

        const parsed = parser.parse(response.data);
        const rawMETAR = parsed.response.data.METAR;
        const decoded =  Array.isArray(rawMETAR) ? rawMETAR.map(metar => decode(metar.raw_text)) : [decode(rawMETAR.raw_text)];
        res.send(decoded);
    } catch(error) {
        error.endpoint = req.originalUrl;
        error.message = `Aviationweather's API is not available. Please try again later.`;
        next(error);
    }
}

export const GetSpaceNews = async (req, res, next) => {
    runMetrics();

    try {
        const response = await axios.get(
            'https://api.spaceflightnewsapi.net/v3/articles?_limit=5&_sort=publishedAt:desc',
            {httpsAgent}
        );
        if (!response.data || !response.data.length) throw Error('There are no space news');
        const titles = response.data.map(data => data.title);
        res.send(titles);
    } catch(error) {
        error.endpoint = req.originalUrl;
        next(error);
    }
}

export const GetUselessFact = async (req, res, next) => {
    runMetrics();

    try {
        const response = await axios.get(
            'https://uselessfacts.jsph.pl/api/v2/facts/random',
            {httpsAgent}
        );
        res.send(response.data);
    } catch(error) {
        error.endpoint = req.originalUrl;
        next(error);
    }
}

export const GetMetarRedis = async (req, res, next) => {
    const { station } = req.query;

    try {
        let metarRes;

        // Check the cache
        const metarResString = await redisClient.get("metar_" + station);
        if (metarResString !== null) {
            metarRes = JSON.parse(metarResString);
        } else {
            // Populate the cache
            const response = await axios.get(
                `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${station}&hoursBeforeNow=1`,
                {httpsAgent}
            );
            const parsed = parser.parse(response.data);
            const rawMETAR = parsed.response.data.METAR;
            metarRes =  Array.isArray(rawMETAR) ? rawMETAR.map(metar => decode(metar.raw_text)) : [decode(rawMETAR.raw_text)];

            await redisClient.set("metar_" + station, JSON.stringify(metarRes), {
                EX:30// Time-to-live
            })
        }
        res.send(metarRes);
    } catch(error) {
        error.endpoint = req.originalUrl;
        next(error);
    }
}

// Lazy caching
export const GetSpaceNewsRedis = async (req, res, next) => {
    try {
        let titles;
        // Check the cache
        const titlesString = await redisClient.get("space_news");
       // Populate the cache
        if (titlesString !== null) {
            titles = JSON.parse(titlesString);
        } else {
            const response = await axios.get(
                'https://api.spaceflightnewsapi.net/v3/articles?_limit=5&_sort=publishedAt:desc',
                {httpsAgent}
            );
            if (!response.data || !response.data.length) throw Error('There are no space news');
                titles = response.data.map(data => data.title);

            await redisClient.set('space_news', JSON.stringify(titles), {
                EX:30 // Time-to-live in seconds
            })
        }

        res.send(titles);
    } catch(error) {
        error.endpoint = req.originalUrl;
        next(error);
    }
}

export const GetUselessFactRedis = async (req, res, next) => {
    try {
        let uselessFact;

        const uselessFactString = await redisClient.get("useless_fact");
       // Populate the cache
       if (uselessFactString !== null) {
            uselessFact = JSON.parse(uselessFactString);
        } else {
            const response = axios.get(
                'https://uselessfacts.jsph.pl/api/v2/facts/random',
                {httpsAgent}
            );
            uselessFact = response.data;
            await redisClient.set('useless_fact', JSON.stringify(uselessFact), {
                EX:5 // Guardate este valor por X cantidad de tiempo en el cache de redis
            })
        }
        res.send(uselessFact);
    } catch(error) {
        error.endpoint = req.originalUrl;
        next(error);
    }
}

