const chalk = require("chalk");

function CompareHistory() {
    this.compare = (a, b) => {
        let longer = (a.length > b.length) ? a : b;
        let shorter = (a.length > b.length) ? b : a;

        const hour = 60 * 60 * 60;
        const last = process.env.BEFORE_DATE || Date.now();

        // Filter for before the last date
        let beforeShort = shorter.filter((loc) => {
            return loc.milliseconds < last;
        });
        let beforeLong = longer.filter((loc) => {
            return loc.milliseconds < last;
        });

        // Find matches
        let matched = beforeShort.reduce((prev, loc, i) => {
            let earliest = loc.milliseconds - hour;
            let latest = loc.milliseconds + hour;

            let spread = +process.env.SPREAD || 0.0015;

            let matches = beforeLong
                .filter((loc) => {
                    return (loc.milliseconds >= earliest && loc.milliseconds <= latest);
                })
                .reduce((prev, cur) => {
                    if (loc.coordinates[0] >= cur.coordinates[0] - spread &&
                        loc.coordinates[0] <= cur.coordinates[0] + spread &&
                        loc.coordinates[1] >= cur.coordinates[1] - spread &&
                        loc.coordinates[1] <= cur.coordinates[1] + spread) {
                            loc.link = "https://google.com/maps/place/" + loc.coordinates[1] + "," + loc.coordinates[0]
                            cur.link = "https://google.com/maps/place/" + cur.coordinates[1] + "," + cur.coordinates[0]
                            prev = prev.concat(cur);
                        }
                        return prev;
                }, []);

            if (matches.length > 0) {
                console.log(chalk.black.bgWhite("/-------MATCH FOUND-----/"));
                console.log(chalk.bgBlackBright("Source Location"));
                console.log(loc);
                console.log(chalk.bgBlackBright("Matching Locations"));
                console.log(matches);
                console.log("\n");
                prev = prev.concat({
                    source: loc,
                    matches: matches
                });
            }
            return prev;
        }, []);

        return matched;
    }
}

module.exports = CompareHistory;
