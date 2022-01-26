const express = require('express');
const fs = require('fs')
const app = express();                  
const datagather = require('./datagather')
const SMA = require('technicalindicators').SMA

const calculateCorrelation = require("calculate-correlation");

// given 4 points: (2,3), (5,3), (4,6) and (1,7)
const x = [2, 5, 4, 1];
const y = [3, 3, 6, 7];

const correlation = calculateCorrelation(x, y);

console.log(correlation); // logs -0.442807443
console.log(typeof correlation); // logs number

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

const SaveChartdata = () => datagather.chartdata(30).then((res)=>{
    writeJsonFile('chartdata.json',res);
})

const readData = ()=> {
    var json = fs.readFileSync('chartdata.json');
    return JSON.parse(json) ;
}
const string2int = (array) =>{
    var count = 0 ;
    for ( var i in array ){
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

const pearsonCorr = () =>{
    var jsondata = readData()
    const x = [2, 5, 4, 1];
const y = [3, 3, 6, 7];
const correlation = calculateCorrelation(x, y);
console.log(correlation); // logs -0.442807443
console.log(typeof correlation); // logs number
}

