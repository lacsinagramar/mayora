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
    db.query(`SELECT * FROM tbl_rooms WHERE strLandlordID = ?`,[req.session.user.strLandlordID], (err, results, fields) =>{
        if(err) return console.log(err);

        console.log(results);
        res.render('landlord/views/rooms', {user: req.session.user, roomsForPug: results});
    });
});

router.get('/verify', middleware.isNotVerifiedLandlord, (req, res) =>{
    console.log(req.query);
    res.render('landlord/views/verify', {user: req.session.user, reqQuery: req.query});
});

router.post('/addroom', upload.single('picture'), (req, res) =>{
    console.log(req.file);
    console.log('wala pa mare\n')
    console.log(req.body);

    var pathPicture = '/uploads/'+req.file.filename;
    var queryString1 = `INSERT INTO tbl_rooms (strLandlordID, strLocation, dblMonthlyFee, intPaxCapacity, booCR, booKitchen, booGarage, intBedrooms, strDownPaymentRule, booOwnMeter)
    VALUES(?,?,?,?,?,?,?,?,?,?)`;
    var queryString2 = `INSERT INTO tbl_rooms_picture (intRoomID, strPicture, strPictureDesc) VALUES(?,?,?)`;

    db.query(queryString1,[req.session.user.strLandlordID, req.body.location, req.body.monthlyRent, req.body.personCapacity, req.body.CR, req.body.kitchen, req.body.garage, req.body.numberOfBedrooms, req.body.downPayment, req.body.meter], (err, results, fields) =>{
        if(err) return console.log(err)

        console.log(results);
        console.log('INSERTED ROOM')
        return nextQuery(results.insertId);
    });

    function nextQuery(x){
        db.query(queryString2,[x,pathPicture,req.body.pictureDesc], (err, results, fields) =>{
            if(err) return console.log(err);

            console.log('INSERTED PICTURE')
            return res.redirect('/landlord/rooms');
        });
    }
});

router.post('/editroom', (req, res) =>{
    console.log(req.body);

    var queryString = `UPDATE tbl_rooms
    SET strLocation = ?, dblMonthlyFee = ?, intPaxCapacity = ?, booCR = ?, booKitchen = ?, booGarage = ?, intBedrooms = ?, strDownPaymentRule = ?, booOwnMeter = ?
    WHERE intRoomID = ?`;

    db.query(queryString, [req.body.location, req.body.monthlyRent, req.body.personCapacity, req.body.CR, req.body.kitchen, req.body.garage, req.body.numberOfBedrooms, req.body.downPayment, req.body.meter, req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        console.log('UPDATED ROOM');
        return res.send(true);
    });
});

router.post('/uploadslip', upload.single('depositSlip'), (req, res) =>{
    console.log(req.file)
    var pathDepSlip = '/uploads/'+req.file.filename;
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

router.post('/addroompic', upload.single('picture'), (req, res) =>{
    console.log(req.file)
    console.log(req.body);
    var pathPicture = '/uploads/'+req.file.filename;

    var queryString = `INSERT INTO tbl_rooms_picture (intRoomID, strPicture, strPictureDesc) VALUES(?,?,?)`;
    db.query(queryString,[req.body.roomID, pathPicture, req.body.pictureDesc], (err, results, fields) =>{
        if(err) return console.log(err)

        console.log('INSERTED NEW PICTURE');
        return res.redirect('/landlord/rooms');
    });
});

router.post('/queryroompic', (req, res) =>{
    var queryString1 = `SELECT * FROM tbl_rooms WHERE intRoomID = ?`;
    var queryString2 = `SELECT * FROM tbl_rooms_picture WHERE intRoomID = ?`;

    db.query(queryString1,[req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        return nextQuery(results[0]);
    });

    function nextQuery(x){
        db.query(queryString2, [req.body.id], (err, results, fields) =>{
            if(err) return console.log(err)

            x.pictureGallery = results;
            x.count = results.length;
            console.log(x);

            return res.send(x);
        });
    }
});

router.post('/savenotifID', (req, res) =>{
    req.session.notifID = req.body.id;
    res.send(true);
});

router.get('/contract', (req, res) =>{
    res.render('landlord/views/contract');
});

exports.landlord = router;