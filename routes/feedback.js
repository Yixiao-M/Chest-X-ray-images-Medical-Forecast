var express = require('express');
var router = express.Router();

/* GET feedback page. */
router.get('/', function(req, res, next) {
  res.render('feedback');
});


/* GET thanks page. */
router.get('/thanks', function(req, res, next) {
  res.render('thanks');
});


module.exports = router;



