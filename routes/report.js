const { RSA_NO_PADDING } = require('constants');
var express = require('express');
var router = express.Router();
var fs = require('fs')

/* GET report. (test)*/
router.get('/', function(req, res, next) {
  fs.readFile('./1.json', function(err, json) {
    if(err){
      res.send(err);
    } else {
      var data = JSON.parse(json);
      res.render('report', { Covid: data["Covid-19"], 
        Normal: data.Normal,
        Pneumonia: data.Pneumonia,
        Tuberculosis: data.Tuberculosis,
        reference: -1});
    }

  })
  // res.render('report', { data1: 1, data2: 2 });
});

module.exports = router;
