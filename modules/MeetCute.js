const chalk = require("chalk");
const fs = require('fs');

const ParseFeeds = require("./ParseFeeds");
const CompareHistory = require("./CompareHistory");

function MeetCute() {
    this.parseFeeds = new ParseFeeds();
    this.compareHistory = new CompareHistory();

    this.init = () => {
        console.log(chalk.magenta('Beginning generation of feeds'));
        console.time(chalk.bgMagenta("Feed generation"));

        let first = this.generate(process.env.FIRST || "a");
        let second = this.generate(process.env.SECOND || "b");

        console.log(chalk.magenta('Finished generation of feeds'));
        console.timeEnd(chalk.bgMagenta("Feed generation"));
        console.log("Number of locations from first directory: ", first.length);
        console.log("Number of locations from second directory: ", second.length);

        let matches = this.match(first, second);
        this.writeToFile(matches);
    }

    this.generate = (dir) => {
        console.log(chalk.green("Loading files from: ", dir));

        let checkinFilename = process.env.FOURSQUARE_FILENAME || "checkins.kml";
        let locHistoryFilename = process.env.GOOGLE_FILENAME || "location_history.kml";
        
        console.log("Checkins: ", "/" + dir + "/" + checkinFilename);
        console.log("Location history: ", "/" + dir + "/" + locHistoryFilename);

        let checkins = this.parseFeeds.parseAndConvertKMLFiles("/" + dir + "/" + checkinFilename, dir);
        let loc_history = this.parseFeeds.parseAndConvertKMLFiles("/" + dir + "/" + locHistoryFilename, dir);

        let normalized = this.parseFeeds
            .normalizeFoursquareGeo(checkins)
            .concat(this.parseFeeds.normalizeGoogleGeo(loc_history));
        let sorted = normalized.sort((a, b) => b.milliseconds - a.milliseconds);

        return sorted;
    }

    this.match = (first, second) => {
        console.log(chalk.green("Comparing locations"));

        let matched = this.compareHistory.compare(first, second);
        if (matched.length > 0) {
            console.log(chalk.bgBlackBright("Total number matched: ", matched.length));
        }
        return matched;
    }

    this.writeToFile = (matches) => {
        let dir = process.env.MATCH_LOC || "./matches";
        let filename = process.env.MATCH_FILENAME || "matches.json";
        fs.writeFileSync(dir + "/" + filename, JSON.stringify(matches), { encoding: "utf8" });
    }
}

module.exports = MeetCute;
