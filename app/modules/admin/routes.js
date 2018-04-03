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

router.get('/tenants', middleware.isAdmin, (req, res) =>{
    var queryString = `SELECT strTenantId, booStatus FROM tbl_tenant_accounts WHERE booStatus = 0`;
    db.query(queryString, (err, results, fields) =>{
        if(err) return console.log(err)

        return res.render('admin/views/tenant', {resultsForPug: results});
    });
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

router.post('/verifypayment', (req, res) =>{
    var queryString = `UPDATE tbl_landlord_account_payment SET booStatus = 1 WHERE intAccountPaymentID = ?`;

    db.query(queryString, [req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        return nextQuery();
    });

    function nextQuery(){
        db.query('SELECT strLandlordID FROM tbl_landlord_account_payment WHERE intAccountPaymentID = ?', [req.body.id], (err, results, fields) =>{
            if(err) return console.log(err);

            console.log(results[0]);
            return res.send(results[0]);
        });
    }
});

router.post('/rejectpayment', (req, res) =>{
    var queryString = `UPDATE tbl_landlord_account_payment SET booStatus = 2 WHERE intAccountPaymentID = ?`;

    db.query(queryString, [req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        console.log(results);

        return res.send(true);
    });
});

router.post('/verifylandlord', (req, res) =>{
    var queryString = `UPDATE tbl_landlord_accounts SET booStatus = 3 WHERE strLandlordID = ?`;

    db.query(queryString, [req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        console.log(results);
        console.log('//FIELDS\n'+fields);

        return res.send(true);
    });
});

router.post('/rejectlandlord', (req, res) =>{
    var queryString = `UPDATE tbl_landlord_accounts SET booStatus = 2 WHERE strLandlordID = ?`;

    db.query(queryString, [req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        console.log(results);
        console.log('//FIELDS\n'+fields);

        return res.send(true);
    });
});

router.post('/querytenantId', (req, res) =>{
    db.query('SELECT strValidID FROM tbl_tenant_accounts WHERE strTenantId = ?',[req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        res.send(results[0]);
    });
});

router.post('/verifytenant', (req, res) =>{
    var queryString = `UPDATE tbl_tenant_accounts SET booStatus = 1 WHERE strTenantId = ?`;

    db.query(queryString, [req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        console.log(results);
        console.log('//FIELDS\n'+fields);

        return res.send(true);
    });
});

router.post('/rejecttenant', (req, res) =>{
    var queryString = `UPDATE tbl_tenant_accounts SET booStatus = 2 WHERE strTenantId = ?`;

    db.query(queryString, [req.body.id], (err, results, fields) =>{
        if(err) return console.log(err)

        console.log(results);
        console.log('//FIELDS\n'+fields);

        return res.send(true);
    });
});

exports.admin = router;