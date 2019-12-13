
module.exports = app => {
    const config = app.get('app-config');
    return (req, res) => res.render('index', { config });
}