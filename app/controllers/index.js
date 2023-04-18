import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { decode } from 'metar-decoder';

const parser = new XMLParser();

export const GetMetar = async (req, res, next) => {
    try {
        const { station } = req.query;
        
        const response = await axios.get(`https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${station}&hoursBeforeNow=1`);
        const parsed = parser.parse(response.data);
        const rawMETAR = parsed.response.data.METAR;
        const decoded =  Array.isArray(rawMETAR) ? rawMETAR.map(metar => decode(metar.raw_text)) : [decode(rawMETAR.raw_text)];
        res.send(decoded);
    } catch(error) {
        error.endpoint = req.originalUrl;
        next(error);
    }
}

export const GetSpaceNews = async (req, res, next) => {
    try {
        const response = await axios.get(`https://api.spaceflightnewsapi.net/v3/articles?_limit=5`);
        res.send(response.data);
    } catch(error) {
        error.endpoint = req.originalUrl;
        next(error);
    }
}
