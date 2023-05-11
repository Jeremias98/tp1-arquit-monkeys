import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { decode } from 'metar-decoder';
import https from 'https';
import {createClient} from "redis";

const redisClient = createClient({url: 'redis://redis:6379'});

await redisClient.connect();
console.log("Redis client connected")

const parser = new XMLParser();
const httpsAgent =  new https.Agent({
    rejectUnauthorized: false // Needed for Mac OS
});

export const GetPing = (req, res, next) => {
    try {
        res.send('ping');
    } catch(error) {
        error.endpoint = req.originalUrl;
        next(error);
    }
}

export const GetMetar = async (req, res, next) => {
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
