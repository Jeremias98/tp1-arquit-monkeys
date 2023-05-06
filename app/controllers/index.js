import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { decode } from 'metar-decoder';
import https from 'https'

const parser = new XMLParser();
const httpsAgent =  new https.Agent({
    rejectUnauthorized: false // Needed for Mac OS
});

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
