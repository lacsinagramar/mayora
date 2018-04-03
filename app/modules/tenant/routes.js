var express = require('express');
var router = express.Router();
var middleware = require('../auth/middlewares/auth');
var db = require('../../lib/database')();

router.get('/', middleware.isTenant, middleware.isVerifiedTenant, (req, res) =>{
    if(req.query.location){
        console.log('may location')
        var queryString = `SELECT * FROM tbl_rooms WHERE booStatus = 0 AND strLocation LIKE '%${req.query.location}%'`;
        
            db.query(queryString, (err, results, fields) =>{
                if(err) return console.log(err);

                return res.render('tenant/views/index', {user: req.session.user, rooms: results})
            });
    }
    else{
        console.log('wala location')
        db.query('SELECT * FROM tbl_rooms WHERE booStatus = 0', (err, results, fields) =>{
            if(err) return console.log(err)

            return res.render('tenant/views/index', {user: req.session.user, rooms: results});
        });
    }
});

router.post('/queryroompics', (req, res) =>{
    var queryString = `SELECT * FROM tbl_rooms_picture WHERE intRoomID = ?`

    db.query(queryString,[req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        res.send(results)
    });
});

router.post('/requestrent', (req, res) =>{
    var queryString = `INSERT INTO tbl_inspection (intRoomID, strTenantID) VALUES (?,?)`;
    var queryString2 = `UPDATE tbl_rooms SET booStatus = 2 WHERE intRoomID = ?`;
    var queryString3 = `SELECT strLandlordID FROM tbl_rooms WHERE intRoomID =${req.body.id}`;
    var queryString4 = `INSERT INTO tbl_landlord_notifications (strLandlordID, strNotifDesc) VALUES(?,"R - Tenant ${req.session.user.strTenantId} has requested to rent on your Room ${req.body.id}")`;

    db.query(queryString,[req.body.id, req.session.user.strTenantId], (err, results, fields) =>{
        if(err) return console.log(err)

        console.log("INSERTED REQUEST");
        console.log(results.insertId);
        return query2(results.insertId);
    });

    function query2(y){
        db.query(queryString2,[req.body.id], (err, results, fields) =>{
            if(err) return console.log(err)
    
            console.log("UPDATED ROOM STATUS");
            return query3(y);
        });
    }

    function query3(y){
        db.query(queryString3, (err, results, fields) =>{
            if(err) return console.log(err)
    
            console.log("SELECTED LANDLORD ID");
            return query4(results[0].strLandlordID,y);
        });
    }

    function query4(x,y){
        db.query(`INSERT INTO tbl_landlord_notifications (strLandlordID, strNotifDesc) VALUES(?,"R - Tenant ${req.session.user.strTenantId} has requested to rent on your Room ${req.body.id} with the code ${y}")`, [x], (err, results, fields) =>{
            if(err) return console.log(err)
    
            console.log("NOTIFIED LANDLORD");
            return res.send(true);
        });
    }
});

router.post('/determinenotif', (req, res) =>{
    db.query('SELECT * FROM tbl_tenant_notifications WHERE intNotifID = ?', [req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        console.log(results[0].strNotifDesc[0]);
        var notifType = []
        notifType = results[0].strNotifDesc.split(' ');

        if(notifType[0] == 'A') return countInvoice(req.body.id,notifType[10]);
    });

    function countInvoice(x,y){
        db.query('SELECT COUNT(strInvoiceID) AS bilang FROM tbl_invoice',(err, results, fields) =>{
            if(err) return console.log(err)

            return generateInvoice(x,y,results[0].bilang);
        });
    }

    function generateInvoice(notifID,reqCode,invoiceCount){
        var invoiceId = Date.now()+'-'+invoiceCount;
        db.query('INSERT INTO tbl_invoice(strInvoiceID, intRequestID) VALUES (?,?)',[invoiceId,reqCode], (err, results,fields) =>{
            if(err) return console.log(err)

            console.log('INSERTED INVOICE');
            return updateNotif(notifID,invoiceId);
        });
    }

    function updateNotif(x,y){
        db.query('UPDATE tbl_tenant_notifications SET booStatus = 1 WHERE intNotifID = ?', [x], (err, results, fields) =>{
            if(err) return console.log(err)

            console.log('UPDATED TENANT NOTIF');
            return res.send({url: `/tenant/invoice?id=${y}`, invoiceID: y})
        });
    }
});

router.get('/invoice', middleware.isTenant, middleware.isVerifiedTenant, (req, res) =>{
    if(req.query.id){
        console.log(req.query.id)
        var queryString = `SELECT tbl_rooms.intRoomID, tbl_rooms.strLocation, tbl_rooms.dblMonthlyFee, tbl_rooms.strDownPaymentRule, tbl_invoice.strInvoiceID,
        tbl_landlord_accounts.strLandlordID, tbl_landlord_accounts.strContactNumber, tbl_landlord_accounts.strFirstName, tbl_landlord_accounts.strMiddleName, tbl_landlord_accounts.strLastName
        FROM tbl_invoice JOIN tbl_inspection ON tbl_invoice.intRequestID = tbl_inspection.intInspectionID
        JOIN tbl_rooms ON tbl_inspection.intRoomID = tbl_rooms.intRoomID
        JOIN tbl_landlord_accounts ON tbl_rooms.strLandlordID = tbl_landlord_accounts.strLandlordID
        WHERE tbl_invoice.strInvoiceID = '${req.query.id}' AND tbl_inspection.strTenantID = ${req.session.user.strTenantId}`;
        db.query(queryString, (err, results, fields) =>{
            if(results.length === 0) return res.redirect('/tenant/searchinvoice?notfound');

            console.log(results[0]);
            res.render('tenant/views/invoice', {invoiceDetail: results[0], user:req.session.user})
        });
    }else res.redirect('/tenant/searchinvoice');
});

exports.tenant = router;