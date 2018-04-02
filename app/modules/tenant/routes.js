var express = require('express');
var router = express.Router();
var middleware = require('../auth/middlewares/auth');
var db = require('../../lib/database')();

router.get('/', middleware.isTenant, (req, res) =>{
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
    var queryString4 = `INSERT INTO tbl_landlord_notifications (strLandlordID, strNotifDesc) VALUES(?,"Tenant ${req.session.user.strTenantId} has requested to rent on your Room ${req.body.id}")`;

    db.query(queryString,[req.body.id, req.session.user.strTenantId], (err, results, fields) =>{
        if(err) return console.log(err)

        console.log("INSERTED REQUEST");
        return query2();
    });

    function query2(){
        db.query(queryString2,[req.body.id], (err, results, fields) =>{
            if(err) return console.log(err)
    
            console.log("UPDATED ROOM STATUS");
            return query3();
        });
    }

    function query3(){
        db.query(queryString3, (err, results, fields) =>{
            if(err) return console.log(err)
    
            console.log("SELECTED LANDLORD ID");
            return query4(results[0].strLandlordID);
        });
    }

    function query4(x){
        db.query(queryString4,[x], (err, results, fields) =>{
            if(err) return console.log(err)
    
            console.log("NOTIFIED LANDLORD");
            return res.send(true);
        });
    }
});

exports.tenant = router;