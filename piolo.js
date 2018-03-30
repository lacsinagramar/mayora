router.get('/main/:accno', flog, messCount, (req,res) => {
    function queryOne(x){
      switch (req.valid) {
        case 1:
          res.render('welcome/views/invalid/adm-restrict');
          break;
        case 2:
        case 3:
        db.query(`SELECT * FROM tbluser WHERE tbluser.intAccNo=?`, [x], (err,results,fields)=>{
          if(err) return console.log(err);
        console.log(results);
        queryTwo(results,x);
      });
      break;
      }
    }
    
    function queryTwo(resultsOne,paramsMo){
      switch (req.valid) {
        case 1:
          res.render('welcome/views/invalid/adm-restrict');
          break;
        case 2:
        case 3:
      db.query(`JOIN tblservicetag on tblservice.intServTag = tblservicetag.intServTagID WHERE tbluser.IntAccNo = ?`, [paramsMo], (err, results, fields) =>{
        res.render('profile/views/main', {thisUserTab: req.user, messCount: req.messCount[0].count, SelUserTab: resultsOne, resultsTwoForPug: results});
        if(err) return console.log(err);
        console.log(resultsTwo);
      });
      break;
    }
  }
  queryOne(req.params.accno);
});