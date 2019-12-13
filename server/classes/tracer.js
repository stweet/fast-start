const Tracer = function(app) {

    app.use(function(req, res, next) {
        console.log(`${req.method} :: ${req.path}`);
        next();
    });
};

module.exports = {
    Tracer,
};