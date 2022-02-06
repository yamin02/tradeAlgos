const express = require('express');
const fs = require('fs')
const app = express();                  
const datagather = require('./datagather')
const SMA = require('technicalindicators').SMA
const utils = require('./utils.js');
const allstockMA = require('./allStockMA')

const calculateCorrelation = require("calculate-correlation");


app.listen(process.env.PORT||3000,()=>{
    console.log("Serving at Port 3000");
});



const SaveChartdata = (rangeDays,allintrument, stockname) => 
    datagather.chartdata(rangeDays,allintrument,stockname).then((res)=>{
    utils.writeJsonFile('chartdata.json',res);
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

const SMA_calc = () =>{
    var jsondata = readData()
    const value  = SMA.calculate({period : jsondata["ROBI"].length , values : string2int(jsondata["ROBI"])}) 
    console.log(value);
}

var json = {};
var count = 1 ;
const calcMA = () =>{
for (var i of allStockNamekArray.slice(250,399)){
    datagather.chartdata(365,false,i).then((res)=>{
        count = count +1 ;
        //  Find MA of the stock here  and push in allsotckjson
        var name = Object.keys(res)[0]
        var sm50  = SMA.calculate({ period : 50 , values : string2int(res[name].slice(-50))})[0].toFixed(2);
        var sm200  = SMA.calculate({ period : 200 , values : string2int(res[name].slice(-200))})[0].toFixed(2);
        var calc = ((sm50 - sm200)*100 / sm200).toFixed(2)  
        // console.log({name, sm50 , sm200})
        json = {name , sm50 , sm200 , calc} ;
        const fs = require('fs');
        fs.appendFileSync('message.txt', JSON.stringify(json) + ',\n');
    })
  }
}

// setTimeout(calcMA,10*1000)

// console.table(allstockMA);

var html = ''
for(var i of allstockMA){
    var tdata =`<tr><td>${i.name}</td><td>${i.sm50}</td><td>${i.sm200}</td><td class='td-calc'>${i.calc}</td></tr>`  ;
    html = html + tdata ;
}



app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <head>    
        <script src="http://code.jquery.com/jquery-latest.min.js"></script>
        <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.11.4/css/jquery.dataTables.css">
        <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.11.4/js/jquery.dataTables.js"></script>

    </head>
    <body>
        <table>  
        <thead>
        <tr>
            <th>Name</th>
            <th>Sm50</th>
            <th>Sm200</th>
            <th>Calc</th>
         </tr>
        </thead> 
        <tbody>
            ${html}
        </tbody>
        
        </table>

        <style>
        table {
            font-family: arial, sans-serif;
            border-collapse: collapse;
            width: 100%;
          }
          
          td, th {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
          }
          
          tr:nth-child(even) {
            background-color: #dddddd;
          }
        </style>
        <script>
        $(document).ready( function () {
            $('table').DataTable();
        } );
        </script>
        </body>
    </html>`);
})
  