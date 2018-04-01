var express = require('express');
var router = express.Router();

router.get('/', (req,res) =>{
    res.render('landlord/views/index');
});

router.get('/rooms', (req,res) =>{
    res.render('landlord/views/rooms');
});

router.get('/verify', (req, res) =>{
    res.render('landlord/views/verify');
});

router.post('/addroom', (req, res) =>{
    console.log('wala pa mare\n')
    console.log(req.body);
});

router.post('/editroom', (req, res) =>{
    console.log('wala pa mare\n')
    console.log(req.body);
    res.send(true);
});

exports.landlord = router;