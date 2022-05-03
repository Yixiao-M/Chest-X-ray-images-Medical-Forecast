var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET feedback page. */
router.get('/', function (req, res, next) {
  res.render('feedback');
});


/* GET thanks page. */
router.post('/thanks', function (req, res, next) {
  var reference = req.body.reference;
  var label = req.body.label;
  data = ReadToFile(reference, label);
  next()
}, (req, res, next) => {
  res.render('thanks');
}) ;

function ReadToFile(filename, label) {
  fs.readFile(`./chest_X-ray_predictor/Temp/${filename}.csv`, "utf8", function (err, data) {
      var list = new Array();
      if (err) {
          console.log(err.stack);
          return;
      }
      ConvertToList(data, function (list) {
          // console.log(list[0][10]);
          list[0][10] = label;
          saveDataAsCSV(list[0], filename)
      })
  });
}

function ConvertToList(data, callBack) {
  data = data.toString();
  var list = new Array();
  var rows = new Array();
  rows = data.split("\r\n");
  for (var i = 0; i < rows.length; i++) {
      list.push(rows[i].split(","));
  }
  callBack(list);
}

function saveDataAsCSV(data, filename) {
  var csvContent = '\ufeff' 
  for (var i = 0; i < data.length; i++) {
    csvContent += data[i];
    if (i != data.length-1) {
      csvContent += ',';
    }

    fs.writeFile(`./chest_X-ray_predictor/Temp/${filename}.csv`, csvContent, function(err){
      if (err) console.log(err, '---->csv<---')
    })
  }
}
module.exports = router;



