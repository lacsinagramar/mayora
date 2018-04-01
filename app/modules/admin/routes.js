var express = require('express');
var router = express.Router();
var middleware = require('../auth/middlewares/auth');
var db = require('../../lib/database')();

router.get('/', middleware.hasUser, (req, res) =>{
    res.render('admin/views/login', req.query);
});

router.get('/index', middleware.isAdmin, (req, res) =>{
    var queryString = `SELECT strLandlordID, booStatus FROM tbl_landlord_accounts WHERE booStatus = 1`;
    db.query(queryString, (err, results, fields) =>{
        if(err) return console.log(err);

        return res.render('admin/views/index', {resultsForPug: results});
    });
});

router.post('/login', (req, res) =>{
    var user;
    if(req.body.username == 'admin' && req.body.password == 'admin'){
        user = {usernameAdmin:'admin'};
        req.session.user = user;
        return res.redirect('/admin/index');
    }
    else return res.redirect('/admin?incorrect')
});

//AJAX

router.post('/queryId', (req, res) =>{
    db.query('SELECT strValidID FROM tbl_landlord_accounts WHERE strLandlordID = ?',[req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        res.send(results[0]);
    });
});

router.post('/queryBir', (req, res) =>{
    db.query('SELECT strBIRPermit FROM tbl_landlord_accounts WHERE strLandlordID = ?',[req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        res.send(results[0]);
    });
});

router.post('/queryland', (req, res) =>{
    db.query('SELECT strLandTitle FROM tbl_landlord_accounts WHERE strLandlordID = ?',[req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        res.send(results[0]);
    });
});

router.post('/querypayments', (req, res) =>{
    var queryString = `SELECT tbl_landlord_accounts.strLandlordID, tbl_landlord_account_payment.intAccountPaymentID, tbl_landlord_account_payment.strLandlordID, tbl_landlord_account_payment.strDepositSlip, tbl_landlord_account_payment.booStatus
    FROM tbl_landlord_accounts JOIN tbl_landlord_account_payment ON tbl_landlord_accounts.strLandlordID = tbl_landlord_account_payment.strLandlordID 
    WHERE tbl_landlord_account_payment.booStatus = 0 AND tbl_landlord_accounts.strLandlordID = ?`;
    db.query(queryString,[req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        res.send(results);
    });
});

exports.admin = router;