var express = require('express');
var router = express.Router();

router.get('/', (req,res) =>{
    res.render('landlord/views/index');
});

router.get('/rooms', (req,res) =>{
    res.render('landlord/views/rooms');
});

exports.landlord = router;