const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressWs = require('express-ws');
const express = require('express');
const routes = require('./routes');
const path = require('path');

const { EventDispatcher } = require('./classes/dispatcher');
const { Tracer } = require('./classes/tracer');

// system initialization
const app = express();
const ews = expressWs(app);

// system configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../public')));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.set('app-config', {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 8000,
});

app.set('dispatcher', new EventDispatcher(app));
app.set('tracer', new Tracer(app));

// initialization application routes
routes.init(app);

// initialization system routes
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
    });
});

// run web server
const { host, port } = app.get('app-config');

app.listen(port, host, err => {
    if (err) console.log(err);
    else console.log(`Listen server http://${host}:${port}`);
});