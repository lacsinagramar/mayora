var express = require('express');
var loginRouter = express.Router();
var logoutRouter = express.Router();
var db = require('../../lib/database')();

loginRouter.post('/', (req, res) =>{
    var queryString = 'SELECT * FROM tbl_tenant_accounts WHERE strUsername = ?';
    var queryString2 = 'SELECT * FROM tbl_landlord_accounts WHERE strUsername = ?'

    function query1(){
        db.query(queryString,[req.body.strUsername], (err, results, fields) =>{
            if(err) return console.log(err)

            console.log(results);
            if(results.length === 0) return query2();

            var user = results[0];

            if(user.strPassword !== req.body.strPassword) return res.send(false);

            delete user.strPassword;

            req.session.user = user;

            console.log(req.session);
            var url = {url: '/tenant'};
            var queryStringNotif = `SELECT * FROM tbl_tenant_notifications WHERE strTenantId = '${req.session.user.strTenantId}'`;
            return queryNotif(url, queryStringNotif);
        });
    }

    function query2(){
        db.query(queryString2, [req.body.strUsername], (err, results, fields) =>{
            if(err) return console.log(err);

            if(results.length === 0) return res.send(false)

            var user = results[0];
            
            if(user.strPassword !== req.body.strPassword) return res.send(false);

            delete user.strPassword;

            req.session.user = user;

            var url = {url: '/landlord'};
            var queryStringNotif = `SELECT * FROM tbl_landlord_notifications WHERE strLandlordID = '${req.session.user.strLandlordID}'`;
            return queryNotif(url, queryStringNotif)
        });
    }

    function queryNotif(x, y){
        db.query(y,(err, results, fields) =>{
            if(err) return console.log(err);

            req.session.user.notif = results;

            return res.send(x);
        });
    }

    query1();
});

logoutRouter.get('/', (req, res) => {
    req.session.destroy(err => {
        if (err) throw err;
        res.redirect('/index');
    });
});

exports.login = loginRouter;
exports.logout = logoutRouter;