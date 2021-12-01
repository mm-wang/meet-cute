const tj = require("@mapbox/togeojson");
const fs = require('fs');
const DOMParser = require('xmldom').DOMParser;
const dotenv = require('dotenv');

dotenv.config({
    path: ".env"
});

function ParseFeeds() {
    this.kmlParser = new DOMParser();

    this.parseAndConvertKMLFiles = function(filename, dir) {
        const dataLoc = process.env.DATA_LOC || "./data";

        try {
            let kml = this.kmlParser.parseFromString(fs.readFileSync(dataLoc + filename, 'utf8'));
            let converted = tj.kml(kml);
    
            let parsed = converted.features.reduce((prev, cur, i) => {
                let data = {
                    coordinates: cur && cur.geometry && cur.geometry.coordinates,
                    properties: cur.properties,
                    dir: dir,
                };
                prev = prev.concat(data);
                return prev;
            }, [])
            return parsed;
        } catch {
            return [];
        }

    }

    this.normalizeGoogleGeo = (history) => {
        let all = history[0];
        let normalized = all.coordinates.map((pair, i)  => {
            return {
                coordinates: pair,
                timestamp: all.properties && all.properties.coordTimes[i],
                milliseconds: Date.parse(all.properties && all.properties.coordTimes[i]),
                source: "Google",
                directory: all.dir
            }
        });
        return normalized;
    }

    this.normalizeFoursquareGeo = (checkins) => {
        let normalized = checkins.map((checkin) => {
            return {
                coordinates: checkin.coordinates,
                timestamp: checkin.properties && checkin.properties.timestamp,
                milliseconds: Date.parse(checkin.properties && checkin.properties.timestamp),
                place: {
                    name: checkin.properties.name,
                    address: checkin.properties.address
                },
                source: "4Sq",
                directory: checkin.dir
            };
        });
        return normalized;
    }

    this.parseAndNormalizeGoogleHistoryJSON = function (filename) {
        let json = JSON.parse(fs.readFileSync(process.env.DATA_LOC + filename, 'utf8'));

        let normalized = json.locations.map((loc) => {
            return {
                coordinates: [loc.longitudeE7, loc.latitudeE7],
                timestamp: new Date(+loc.timestampMs).toISOString(),
                milliseconds: loc.timestampMs,
                source: "Google"
            }
        });
        return normalized;
    }
}

module.exports = ParseFeeds;
