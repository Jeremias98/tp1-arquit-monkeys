import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { decode } from 'metar-decoder';

const parser = new XMLParser();

export const GetMetar = async (req, res, next) => {
    try {
        const { station } = req.query;
        
        const response = await axios.get(`https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${station}&hoursBeforeNow=1`);
        const parsed = parser.parse(response.data);

        res.send(decode(parsed.response.data.METAR.raw_text));
    } catch(error) {
        error.endpoint = req.originalUrl;
        next(error);
    }
}