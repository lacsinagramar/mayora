var express = require('express');
var router = express.Router();
var middleware = require('../auth/middlewares/auth');

router.get('/', middleware.hasUser, (req, res) =>{
    res.render('home/views/index');
});

exports.index = router;