const express = require('express');
const fs = require('fs')
const app = express();                  
const datagather = require('./datagather')
const SMA = require('technicalindicators').SMA

const calculateCorrelation = require("calculate-correlation");

app.get('/', function(req, res) {
    res.send("Life is a pera");
});

app.listen(process.env.PORT||3000,()=>{
    console.log("Serving at Port 3000");
});

function writeJsonFile(file, data) {
    let jsonData = JSON.stringify(data);
    fs.writeFileSync(file, jsonData);
}

const SaveChartdata = (rangeDays,allintrument, stockname) => 
    datagather.chartdata(rangeDays,allintrument,stockname).then((res)=>{
    writeJsonFile('chartdata.json',res);
})


const readData = (filename)=> {
    var json = fs.readFileSync('chartdata.json');
    return string2int(JSON.parse(json)) ;
}
const string2int = (array) =>{
    var count = 0 ;
    for ( var i of array ){
        array[count] = parseFloat(i);
        count = count + 1 ; 
    }
    return array ;
}

// getchartdata();
const SMA_calc = () =>{
    var jsondata = readData()
    const value  = SMA.calculate({period : jsondata["ROBI"].length , values : string2int(jsondata["ROBI"])}) 
    console.log(value);
}

// /////////////////////////////////////////////////////////////////
// Pearson correlation 
const pearsonCorr = () =>{
    var jsondata = readData()
    const x = string2int(jsondata["ILFSL"]);
    const y = string2int(jsondata["FASFIN"]);
    console.log({x,y})
const correlation = calculateCorrelation(x, y);
console.log(correlation); // logs -0.442807443
console.log(typeof correlation); // logs number
}

var allStockNamekArray =  Object.keys(JSON.parse(fs.readFileSync('allstock.json')))



// /////////////////////////////////////////////////////
//  MA 50 vs 200 ( find which stocks having the crossover)

