const home = require('./all/home')

module.exports.init = app => {
    app.get("/", home(app))
}