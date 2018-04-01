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
            return res.send({url: '/tenant'})
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

            return res.send({url: '/landlord'})
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