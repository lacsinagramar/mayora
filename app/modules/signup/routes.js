var express = require('express');
var router = express.Router();
router.get('/', (req, res) => {
    if (typeof process.env.ENABLE_DATABASE !== 'undefined' && process.env.ENABLE_DATABASE === 'false') {
        return render([]);
    }
    var db = require('../../lib/database')();
    db.query('SELECT * FROM users', function (err, results, fields) {
        if (err) return res.send(err);
        render(results);
    });

    function render(users) {
        res.render('signup/views/index', { users: users });
    }
});

router.get('/tenant', (req, res) =>{
    res.render('signup/views/tenant');
});
router.post('/tenant', (req, res) =>{
    console.log('wala pa sis')
});

router.get('/landlord', (req, res) =>{
    res.render('signup/views/landlord');
});
exports.signup = router;