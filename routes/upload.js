var express = require('express');
var router = express.Router();
var multer = require("multer");
var fs = require('fs')
var exec = require('child_process').exec;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, './chest_X-ray_predictor/Temp');
    },
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        // rename
        cb(null, Date.now()+'.'+fileFormat[fileFormat.length-1])
    }
})

var upload = multer({ storage: storage });

router.post('/', upload.array('image', 40), function (req, res, next) {
    // console.log(req.files);
    // res.send(req.files[0].filename);
    // res.send(req.body);
    data = req.body;
    filename = req.files[0].filename
    saveDataAsCSV(req.body, filename)
    next()
}, (req, res, next) => {

    // get prediction from model
    filename = req.files[0].filename
    var fileFormat = (req.files[0].filename).split(".");
    exec(`python ./chest_X-ray_predictor/predictor.py ${fileFormat[0]}`, function (error, stdout, stderr) {
        if(error){
            console.error('error: ' + error);
        } else {
            next()
        }
        
    })
}, (req, res, next) => {
    filename = req.files[0].filename
    var fileFormat = (req.files[0].filename).split(".");
    // read the json generate by model
    fs.readFile(`./chest_X-ray_predictor/Temp/${fileFormat[0]}.json`, function(err, json) {
        if(err){
          res.send(err);
        } else {
          var data = JSON.parse(json);
          var reference = -1;

          if(req.body.agree == 1) {
            reference = fileFormat[0];
          };

        //   console.log(reference)

          res.render('report', { Covid: data["Covid-19"], 
            Normal: data.Normal,
            Pneumonia: data.Pneumonia,
            Tuberculosis: data.Tuberculosis,
            reference: reference});
        }
    })
})


function saveDataAsCSV(data,filename) {
    // title
    var csvContent = '\ufefffilename,';
    csvContent += 'label,';
    csvContent += 'fever,';
    csvContent += 'cough,';
    csvContent += 'fatigue,';
    csvContent += 'sputum,';
    csvContent += 'dyspnea,';
    csvContent += 'hemoptysis,';
    csvContent += 'chest_pain,';
    csvContent += 'weight_loss,';
    csvContent += 'agree\n'
    
    //content
    csvContent += filename + ',';
    csvContent += '-1,'
    csvContent += data.fever + ',';
    csvContent += data.cough + ',';
    csvContent += data.fatigue + ',';
    csvContent += data.sputum + ',';
    csvContent += data.dyspnea + ',';
    csvContent += data.hemoptysis + ',';
    csvContent += data.chest_pain + ',';
    csvContent += data.weight_loss + ',';
    if(data.agree) {
        csvContent += '1\n'
    } else {
        csvContent += '-1\n'
    }

    // get the name of the file
    var fileFormat = filename.split(".");

    fs.writeFile(`./chest_X-ray_predictor/Temp/${fileFormat[0]}.csv`, csvContent, function(err){
        if (err) console.log(err, '---->csv<---')
      })
}
module.exports = router;
