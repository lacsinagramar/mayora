var express = require('express');
var router = express.Router();
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

router.get('/', (req, res) => {
    res.render('signup/views/index');
});

router.get('/tenant', (req, res) =>{
    db.query('SELECT COUNT(strTenantId) AS BILANG FROM tbl_tenant_accounts', (err, results, fields) =>{
        if(err) return console.log(err);

        console.log(results[0])
        res.render('signup/views/tenant',{bilang: results[0]});
    });
});
router.post('/tenant', upload.single('validId'), (req, res) =>{
    console.log(req.file);
    console.log('ANUNA SIS\n');
    console.log(req.body);
    var pathImage = '/uploads/'+req.file.filename;
    var queryString = `INSERT INTO tbl_tenant_accounts VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    req.body.tenantId = 'T-'+req.body.tenantId
    db.query(queryString,[req.body.tenantId, req.body.firstName,req.body.middleName,req.body.lastName,pathImage, req.body.contactNumber, req.body.email, req.body.username, req.body.password, req.body.address, 0], (err, results, fields) =>{
        if(err) return console.log(err);

        console.log('INSERTED TENANT')
        res.redirect('/index');
    });
});

router.get('/landlord', (req, res) =>{
    db.query('SELECT COUNT(strLandlordID) AS BILANG FROM tbl_landlord_accounts', (err, results, fields) =>{
        if(err) return console.log(err);

        console.log(results[0])
        res.render('signup/views/landlord',{bilang: results[0]});
    });
});
var landlordUpload = upload.fields([{name:'validIdLandlord', maxCount:1}, {name:'birPermit', maxCount:1}, {name:'landTitle', maxCount:1}])
router.post('/landlord',landlordUpload, (req, res) =>{
    console.log(req.files);
    console.log('ANUNA SIS\n');
    console.log(req.body);

    var pathId = '/uploads/'+req.files.validIdLandlord[0].filename;
    var pathBir = '/uploads/'+req.files.birPermit[0].filename;
    var pathLandTitle = '/uploads/'+req.files.landTitle[0].filename;
    req.body.landlordId = 'L-'+req.body.landlordId;
    var queryString = `INSERT INTO tbl_landlord_accounts VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    var jsonContract = {penalty: req.body.penalty, minimumDuration: req.body.minimumDuration};
    jsonContract = JSON.stringify(jsonContract);

    db.query(queryString, [req.body.landlordId, req.body.firstName, req.body.middleName, req.body.lastName, pathId, pathBir, pathLandTitle, req.body.address, req.body.username, 0, req.body.emailAddress, req.body.password, jsonContract, req.body.contactNumber, req.body.plan ], (err, results, fields) =>{
        if(err) return console.log(err);

        console.log('INSERTED LANDLORD');
        res.redirect('/index');
    });
});
exports.signup = router;