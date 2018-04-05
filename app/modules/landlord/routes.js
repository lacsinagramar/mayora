var express = require('express');
var router = express.Router();
var middleware = require('../auth/middlewares/auth');
var db = require('../../lib/database')();
var moment = require('moment');
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
    var queryString = `SELECT tbl_room_tenant.intRoomID, tbl_room_tenant.datDateRented FROM tbl_room_tenant
    JOIN tbl_rooms ON tbl_room_tenant.intRoomID = tbl_rooms.intRoomID
    WHERE tbl_rooms.strLandlordID = ?`;

    db.query(queryString,[req.session.user.strLandlordID], (err, results, fields) =>{
        if(err) return console.log(err)

        res.render('landlord/views/index', {user: req.session.user, resultsForPug: results});
    });
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

router.get('/contract', middleware.isVerifiedLandlord, (req, res) =>{
    var queryString = `SELECT tbl_room_tenant.intRoomID
    FROM tbl_room_tenant JOIN tbl_rooms ON tbl_room_tenant.intRoomID = tbl_rooms.intRoomID
    WHERE tbl_rooms.strLandlordID = '${req.session.user.strLandlordID}' AND tbl_room_tenant.booContract = 1`;

    db.query(queryString,(err, results, fields) =>{
        if(err) return console.log(err)

        res.render('landlord/views/invoiceContract', {user: req.session.user, resultsForPug: results});
    });
});

router.post('/generatecontract', (req, res) =>{
    var queryString = `SELECT
    tbl_rooms.intRoomID, tbl_rooms.strLocation, tbl_rooms.dblMonthlyFee, tbl_rooms.booCR, tbl_rooms.booKitchen, tbl_rooms.booGarage, tbl_rooms.booOwnMeter, tbl_rooms.intBedrooms, tbl_rooms.intPaxCapacity,
    tbl_tenant_accounts.strTenantId, tbl_tenant_accounts.strFirstName AS tenantFirstName, tbl_tenant_accounts.strMiddleName AS tenantMiddleName, tbl_tenant_accounts.strLastName AS tenantLastName, tbl_tenant_accounts.strAddress  AS tenantAddress,
    tbl_landlord_accounts.strLandlordID, tbl_landlord_accounts.strFirstName AS landlordFirstName, tbl_landlord_accounts.strMiddleName AS landlordMiddleName, tbl_landlord_accounts.strLastName AS landlordLastName, tbl_landlord_accounts.strAddress AS landlordAddress, tbl_landlord_accounts.jsonContract,
    tbl_invoice.strInvoiceID
    FROM tbl_invoice
    JOIN tbl_inspection ON tbl_invoice.intRequestID = tbl_inspection.intInspectionID
    JOIN tbl_tenant_accounts ON tbl_inspection.strTenantID = tbl_tenant_accounts.strTenantId
    JOIN tbl_rooms ON tbl_inspection.intRoomID = tbl_rooms.intRoomID
    JOIN tbl_landlord_accounts ON tbl_rooms.strLandlordID = tbl_landlord_accounts.strLandlordID
    WHERE tbl_invoice.strInvoiceID = ? AND tbl_landlord_accounts.strLandlordID = ? AND tbl_invoice.booStatus = 0` 

    db.query(queryString,[req.body.invoiceNumber, req.session.user.strLandlordID], (err, results, fields) =>{
        if(err) return console.log(err)
        if(!results[0]) return res.redirect('/landlord/contract')

        var contractRules = JSON.parse(results[0].jsonContract);
        //{"penalty", "minimumDuration"}

        var dayNow = moment().format('Do');
        var monthNow = moment().format('MMMM');
        var yearNow = moment().format('YYYY');
        var dateNow = moment().format('DD MMMM YYYY');
        var endContractDate = moment(dateNow).add(contractRules.minimumDuration, 'M');
        endContractDate = moment(endContractDate).format('DD MMMM YYYY');
        var billingRule = {};
        if(results[0].booOwnMeter == 1){
            billingRule.rule = 'Water and Electric Bill from Manila Water and Meralco shall be given by the LESSOR to the LESSEE as soon as the LESSOR received the bills';
        }
        else{
            billingRule.rule = 'Water and Electricity consumptions shall be based on the sub-meter readings corresponding to the room occupied.';
        }
        var roomDetails = {}
        if(results[0].booKitchen == 1){
            roomDetails.kitchen = 'WITH OWN KITCHEN';
        }
        else{
            roomDetails.kitchen = 'WITHOUT KITCHEN';
        }

        if(results[0].booCR == 1){
            roomDetails.CR = 'WITH OWN COMFORT ROOM';
        }
        else{
            roomDetails.CR = 'WITHOUT COMFORT ROOM';
        }

        if(results[0].booGarage == 1){
            roomDetails.garage = 'WITH OWN GARAGE';
        }
        else{
            roomDetails.garage = 'WITHOUT GARAGE';
        }
        var dateToday = {day: dayNow, month:monthNow, year: yearNow, startRent:dateNow, endRent: endContractDate}
        console.log(results[0])
        res.render('landlord/views/contract', {contract: results[0], dateToday: dateToday, bill: billingRule, room: roomDetails});
    });
});// req.body.invoiceNumber and req.session.user.strLandlordID

router.post('/contractsigned', (req, res) =>{
    var ngayon = moment(req.body.date).format('YYYY-MM-DD');
    db.query(`INSERT INTO tbl_room_tenant (intRoomID, strTenantID, booContract, datDateRented) VALUES(?,?,1,?)`, [req.body.room,req.body.tenant,ngayon], (err, results, fields) =>{
        if(err) return console.log(err)

        return nextQuery();
    });

    function nextQuery(){
        db.query('UPDATE tbl_rooms SET booStatus = 1 WHERE intRoomID = ?', [req.body.room], (err, results, fields) =>{
            if(err) return console.log(err)

            return nextNextQuery();
        });
    }

    function nextNextQuery(){
        db.query('UPDATE tbl_invoice SET booStatus = 1 WHERE strInvoiceID = ?', [req.body.invoice], (err, results, fields) =>{
            if(err) return console.log(err)

            return res.send(true);
        });
    }
});

router.get('/billing', middleware.isVerifiedLandlord, (req, res) =>{
    var queryString = `SELECT tbl_rooms.dblMonthlyFee, tbl_room_tenant.datDateRented, tbl_rooms.intRoomID FROM tbl_rooms
    JOIN tbl_room_tenant ON tbl_rooms.intRoomID = tbl_room_tenant.intRoomID
    WHERE tbl_rooms.strLandlordID = '${req.session.user.strLandlordID}' AND tbl_rooms.booOwnMeter = 0 AND tbl_rooms.booStatus = 1`;

    db.query(queryString, (err, results, fields) =>{
        if(err) return console.log(err)

        for(var x=0;x<results.length;x++){
            results[x].datDateRented = moment(results[x]).format('MM-DD-YYYY');
            
        }

        console.log(results);
        return res.render('landlord/views/billing', {user: req.session.user, resultsForPug:results, loop:results.length});
    });
});

exports.landlord = router;