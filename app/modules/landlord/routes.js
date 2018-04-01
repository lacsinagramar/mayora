var express = require('express');
var router = express.Router();
var middleware = require('../auth/middlewares/auth');
var db = require('../../lib/database')();
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+'.jpg')
    }
  })
var upload = multer({ storage: storage})

router.get('/', middleware.isVerifiedLandlord, (req,res) =>{
    res.render('landlord/views/index', {user: req.session.user});
});

router.get('/rooms', middleware.isVerifiedLandlord, (req,res) =>{
    res.render('landlord/views/rooms', {user: req.session.user});
});

router.get('/verify', middleware.isLandlord, (req, res) =>{
    console.log(req.query);
    res.render('landlord/views/verify', {user: req.session.user, reqQuery: req.query});
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

router.post('/uploadslip', upload.single('depositSlip'), (req, res) =>{
    console.log(req.file)
    var pathDepSlip = '/uploads/'+req.file.filename
    var queryString = `INSERT INTO tbl_landlord_account_payment(strLandlordID, strDepositSlip) VALUES(?,?)`;

    db.query(queryString,[req.session.user.strLandlordID,pathDepSlip], (err, results, fields) =>{
        if(err) return console.log(err)

        return nextQuery();
    });

    function nextQuery(){
        db.query('UPDATE tbl_landlord_accounts SET booStatus = ? WHERE strLandlordID = ?',[1, req.session.user.strLandlordID], (err, results, fields) =>{
            if(err) return console.log(err)

            res.redirect('/landlord/verify?success');
        });
    }
});

exports.landlord = router;