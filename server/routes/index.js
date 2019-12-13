const home = require('./all/home');
const socket = require('./all/socket');

module.exports.init = app => {

    app.get("/", home(app));
    app.ws("/", socket(app));
}