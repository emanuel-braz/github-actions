class Logger {
    constructor(verbose, core) {
        this.verbose = verbose;
        this.core = core;
    }

    log(message) {
        if (this.verbose) {
            console.log(message);
        } else {
            this.core.debug(message);
        }
    }
}

module.exports = { Logger };
