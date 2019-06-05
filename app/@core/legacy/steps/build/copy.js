const l = require("../../utils/log").withContext("copy");
const getBuildVars = require("../../utils/get-build-vars");
const ncp = require('ncp').ncp;
const path = require("path");

/**
 * @param {string} baseDir
 * @returns {{run: () => Promise }}
 */
module.exports = function run(baseDir, mode, firstRun) {
    return {
        run() {
            return new Promise((resolve, reject) => {
                if (mode === "DEV" && !firstRun) {
                    resolve();
                }

                ncp.limit = 16;
                const filter = /^(.(?!.*\.ts$|.*\.scss$|core|styles|app))*$/;
                const config = getBuildVars().copy;

                const source = path.resolve(baseDir, config.source);
                const target = path.resolve(baseDir, config.distribution);

                l.info("Starting copy process");
                l.info(`Source: ${source}`);
                l.info(`Target: ${target}`);

                ncp(source, target, {filter: filter}, function (err) {
                    if (err) {
                        reject(err);
                    }

                    resolve("Successfully renamed file");
                });
            });
        }
    };
};