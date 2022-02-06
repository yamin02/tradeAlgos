const express = require('express');
const fs = require('fs')
const app = express();                  
const datagather = require('./datagather')
const SMA = require('technicalindicators').SMA
const utils = require("./utils")

var allStockNamekArray =  Object.keys(JSON.parse(fs.readFileSync('allstock.json')))

// /////////////////////
// Unfinished doest work

const SaveChartdata = (rangeDays,allintrument, stockname) => 
    datagather.chartdata(rangeDays,allintrument,stockname).then((res)=>{
    utils.writeJsonFile(`./eachstockdata/${stockname}.json` ,res);
})

SaveChartdata(300,false,"GP");

for ( var i of allStockNamekArray){
    SaveChartdata(300,false,i);
}
