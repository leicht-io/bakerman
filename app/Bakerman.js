const prepare = require("./@core/legacy/steps/build/prepare");
const copy = require("./@core/legacy/steps/build/copy");
const path = require("path");
const assets = require("./@core/legacy/steps/build/assets");
const typescript = require("./@core/legacy/steps/build/typescript");
const styles = require("./@core/legacy/steps/build/styles");
const minifyHtml = require("./@core/legacy/steps/build/minify_html");
const minifyImages = require("./@core/legacy/steps/build/minify_images");
const Pipeline = require("./@core/legacy/pipeline");
const Environment = require('./@core/Environment');
const Server = require('./@core/Server');
const Log = require('./@core/Log/Log');
const gaze = require("gaze");

let firstRun = true;

class Bakerman {
    run() {
        if (Environment.getMode() === "PROD") {
            this.buildProd();
        } else {
            this.buildDevAndWatch();
        }
    }

    buildDevAndWatch() {
        this.build();
        this.watch();
    }

    buildProd() {
        this.build();
    }

    build() {
        const baseDir = process.cwd();
        const mode = Environment.getMode();

        new Pipeline()
            .withStep(prepare(baseDir, mode, firstRun))
            .withStep(copy(baseDir, mode, firstRun))
            .withStep(minifyImages(baseDir, mode, firstRun))
            .withStep(typescript(baseDir, mode, firstRun))
            .withStep(styles(baseDir, mode, firstRun))
            .withStep(assets(baseDir, mode, firstRun))
            .withStep(minifyHtml(baseDir, mode, firstRun))
            .run();

        if (firstRun) {
            new Server().serve();
        }

        firstRun = false;
    }

    watch() {
        Log.info("watching files");
        //TODO: get path from config
        const configPath = path.resolve(process.cwd(), "src");

        gaze([configPath + "/**/*"], (err, watcher) => {
            if (err) {
                l.error(err);

                process.exit(-1);
            }

            watcher.on('all', (event, filepath) => {
                l.info(filepath + ' was ' + event);
                this.build();
            });
        });
    }

}

module.exports = Bakerman;