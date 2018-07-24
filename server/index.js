const path = require('path')
const routes = require('./routes')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.set('views', path.join(__dirname, './views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, '../public')))

routes.init(app)

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('error', {
        message: err.message
    })
})

app.listen(process.env.PORT || 8000, err => {
    if (err) console.log(err.message)
    else console.log('Run localhost')
})