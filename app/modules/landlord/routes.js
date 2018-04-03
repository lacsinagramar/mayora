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

router.post('/determineNotif', (req, res) =>{
    db.query('SELECT * FROM tbl_landlord_notifications WHERE intNotifID = ?', [req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        console.log(results[0].strNotifDesc[0]);
        var notifType = []
        notifType = results[0].strNotifDesc.split(' ');

        if(notifType[0] == 'R') return res.send({notifID: req.body.id, tenantID: notifType[3], reqCode: notifType[15]});
        else if(notifType[0] == 'P') return res.send({url: 'landlord/contract'});
    });
});

router.post('/notifytenant', (req, res) =>{
    var queryString1 = `INSERT INTO tbl_tenant_notifications (intNotifID, strTenantId, strNotifDesc) VALUES (?, ?, 'A - Landlord ${req.session.user.strLandlordID} has accepted your request with code ${req.body.reqCode} . Open this to generate invoice')`;
    var queryString2 = `UPDATE tbl_landlord_notifications SET booStatus = 1 WHERE intNotifID = ?`;

    db.query(queryString1, [req.body.notifId, req.body.tenantId], (err, results, fields) =>{
        if(err) return console.log(err);

        console.log('INSERTED TENANT NOTIF');
        return nextQuery();
    });

    function nextQuery(){
        db.query(queryString2, [req.body.notifId], (err, results, fields) =>{
            if(err) return console.log(err);

            console.log('DONE LANDLORD NOTIF');

            return res.send({url: '/landlord/rooms'});
        })
    }
});

// router.get('/contract')

router.get('/ewanko', (req, res) =>{
    console.log(req.session.user);
    var queryString1 = `SELECT * FROM tbl_landlord_notifications WHERE intNotifID = ${req.session.notifID}`;
    var queryString2 = `SELECT * FROM tbl_landlord_accounts WHERE strLandlordID = '${req.session.user.strLandlordID}'`;
    var queryString3 = `SELECT * FROM tbl_tenant_accounts WHERE strTenantId = ?`;
    var queryString4 = `SELECT * FROM tbl_rooms WHERE intRoomID = ?`;

    db.query(queryString1, (err, results, fields) =>{
        if(err) return console.log(err)

        var split = [];
        split = results[0].strNotifDesc.split(' ');
        console.log(split);

        return query2(split);
    });

    //Landlord Details
    function query2(x){
        db.query(queryString2, (err, results, fields) =>{
            if(err) return console.log(err)

            return query3(x,results[0]);
        });
    }

    //Tenant Details
    function query3(x, y){
        db.query(queryString3,[x[1]], (err, results, fields) =>{
            if(err) return console.log(err);

            return query4(x,y,results[0]);
        });
    }

    //Room Details
    function query4(notifSplit, landlordDetails, tenantDetails){
        db.query(queryString4,[notifSplit[9]], (err, results, fields) =>{
            if(err) return console.log(err)

            return res.render('landlord/views/contract', {landlord: landlordDetails, tenant:tenantDetails, room: results[0]});
        });
    }
});

exports.landlord = router;