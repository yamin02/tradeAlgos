
const jsdom = require("jsdom");
const {JSDOM} = jsdom ;
const axios = require('axios')
const utils = require('./utils')
const fs = require("fs")



const chartdata =  async (rangeDays,allintrument, stockname) =>  {
    const stonkname = allintrument? "All%20Instrument" : stockname ;
    const date = utils.dateformat(rangeDays) ; 
   // console.log(`https://www.dsebd.org/day_end_archive.php?startDate=${date.startday}&endDate=${date.today}&inst=All%20Instrument&archive=data`)
    const response = await axios({
        url : `https://www.dse.com.bd/day_end_archive.php?startDate=${date.startday}&endDate=${date.today}&inst=${stonkname}&archive=data` ,
        method : 'GET',
    }); 
    const dom2 = new JSDOM(response.data)
    var stontable0 =dom2.window.document.getElementsByClassName("table table-bordered background-white shares-table fixedHeader");
    var i = 0 ;
    var ltp = [] ;
    var jsonall = {} ;
    var stock = stontable0[0].children[1].children[0].children[2].lastElementChild.href.split('name=')[1] ;
    // console.log(stontable0[0].children[1].children.length)
    while(stontable0[0].children[1].children[i]){
    var stock0 = stontable0[0].children[1].children[i].children[2].lastElementChild.href.split('name=')[1]
        if(i == stontable0[0].children[1].children.length-1){
            ltp.push((stontable0[0].children[1].children[i].children[3].textContent).replace(/,/g,''));
            jsonall[`${stock}`] = ltp.reverse() ;
        }
        if(stock0 === stock){
                ltp.push((stontable0[0].children[1].children[i].children[3].textContent).replace(/,/g,''));
                i = i+1 ;
        }else{
                jsonall[`${stock}`] = ltp.reverse() ;
                ltp = [] ;
                stock = stontable0[0].children[1].children[i].children[2].lastElementChild.href.split('name=')[1]
        }
    }
    // fs.writeFileSync(path.resolve(__dirname, 'chartdata.json'), JSON.stringify(jsonall,null,2));
    console.log('Successfully got the chart data');
    return jsonall
}
module.exports.chartdata = chartdata



const dataDse = async (charttrue) =>  {
    if(charttrue){
        var chartdat = await chartdata();
    }
    var url = `https://www.dse.com.bd/latest_share_price_scroll_l.php?timestamp=${new Date().getSeconds()*(Math.floor(Math.random()*100))}`
    const response = await axios({
            url : url ,
            method : 'GET',
    }); 
    console.log(url);
    const dom = new JSDOM(response.data) ;
    const stontable =dom.window.document.getElementsByClassName("table table-bordered background-white shares-table fixedHeader");
    const marketstatus = dom.window.document.getElementsByClassName('time col-md-4 col-sm-3 col-xs-6 pull-right')[0].textContent;
    // console.log(`marketstatus : ${marketstatus}`);
    var length = stontable[0].children.length ;
    var arr = [];
    for (var i = 1 ; i <= length-1 ; i++){
        // console.log(price) ;
        var change = ((stontable[0].children[i].children[0].children[7].textContent*100)/(stontable[0].children[i].children[0].children[6].textContent).replace(/,/g, '')).toFixed(2)
        change = (change=="NaN") ? 0 : change;
        var name = stontable[0].children[i].children[0].children[1].children[0].getAttribute('href').split('=')[1]  ; 
        var json = 
        {
            // _id :  i,
            name : name , 
            ltp :    stontable[0].children[i].children[0].children[2].textContent ,
            high :   stontable[0].children[i].children[0].children[3].textContent ,
            low :    stontable[0].children[i].children[0].children[4].textContent,
            closep : stontable[0].children[i].children[0].children[5].textContent ,
            ycp :    stontable[0].children[i].children[0].children[6].textContent ,
            change : stontable[0].children[i].children[0].children[7].textContent ,
            changeP : change,
            trade :  stontable[0].children[i].children[0].children[8].textContent ,
            value :  stontable[0].children[i].children[0].children[9].textContent ,
            volume : stontable[0].children[i].children[0].children[10].textContent ,
            // last60 : chartdat[name]
        }
        if(charttrue){
            json['last60'] = chartdat[name];
        }
        // jsonAll[`${json.name}`] = json;
        arr.push(json)
    }
    console.log(arr)
    return {'arr':arr , 'marketStatus':marketstatus} 
  }
// dataDse();
module.exports.dataDse = dataDse ;




const dsex =  async () =>  {
    const response = await axios({
        url : `https://www.dse.com.bd/index.php?timestamp=${new Date().getSeconds()*(Math.floor(Math.random()*100))}` ,
        method : 'GET',
    }); 

    const dom = new JSDOM(response.data);
    var table = dom.window.document.getElementsByClassName('midrow');
    var jsondsex = {
        'marketStatus': dom.window.document.getElementsByClassName('time col-md-4 col-sm-3 col-xs-6 pull-right')[0].textContent ,
        'dsex' :        parseFloat(table[0].children[1].textContent),
        'dsexChange' :  parseFloat(table[0].children[2].textContent) ,
        'dsexChangeP' :  parseFloat(table[0].children[3].textContent.split("%")[0]) ,

        'ds30' :        parseFloat(table[1].children[1].textContent),
        'ds30Change' :  parseFloat(table[1].children[2].textContent),
        'ds30ChangeP' : parseFloat(table[1].children[3].textContent.split("%")[0]) ,

        'totaltrade' :  parseFloat(table[4].children[0].textContent),
        'totalvolume' :  parseFloat(table[4].children[1].textContent),
        'totalvalue' : parseFloat(table[4].children[2].textContent), 

        'issueAdvance' : parseInt(table[6].children[0].textContent), 
        'issueDecline' : parseInt(table[6].children[1].textContent), 
        'issueUnchange' : parseInt(table[6].children[2].textContent), 
    } ;
   // console.log(jsondsex);
    //const p = await dsexModel.dsexmodel.insertMany(jsondsex)
    return jsondsex
}
//dsex();
module.exports.dsex = dsex



const updatedb = async () => {
    const dsexData = await dsex();
    await model.dsexmodel.findByIdAndUpdate("60fe8fad7b839516b664f296",dsexData) ;
    const dsedata =  await dataDse(false) ;
    for ( var i of dsedata['arr'] ){
        const p = await model.stockmodel.updateOne({ "name": `${i.name}` }, {  $set: i  });
    }
    return dsedata['marketStatus']
}
//updatedb();
module.exports.updatedb = updatedb ;


const addDB = async () => {
    const dsedata =  await dataDse(true) ;
    await model.stockmodel.insertMany(dsedata['arr']);
    console.log('Added to the DB ')
}
// addDB();

const finalupdate = async() =>{
    const dsedata =  await dataDse(true) ;
    for ( var i of dsedata['arr'] ){
        await model.stockmodel.updateOne({ "name": `${i.name}` }, {  $set: i  });
    }
    console.log('Success updated at 4:30pm.Ready for tomorrow');
}
module.exports.finalupdate = finalupdate ;



const getfundamental = async () =>{
    const stockname = await model.stockmodel.find({_id:{ $in : [ 41, 55 ] } },{name:1,_id:0}).sort({name:1});
    var fundamentals = []
    for(var i of stockname){
        try{
            console.log(i.name)
            const response = await axios({
                    url : `https://www.dsebd.org/displayCompany.php?name=${i.name}` ,
                method : 'GET',
            }); 
            const dom = new JSDOM(response.data);
            var table = dom.window.document.querySelectorAll('.table')[8].querySelectorAll('.shrink');
            var length = table.length
            if(length<2){continue;};
            var json = {
                _id : i.name,
                '2019_eps':  parseFloat(table[length-2].children[4].textContent) ,
                '2020_eps' : parseFloat(table[length-1].children[4].textContent),
                '2019_nav' : parseFloat(table[length-2].children[4].textContent),
                '2020_nav':  parseFloat(table[length-1].children[4].textContent) ,
                '2019_profit' : parseFloat(table[length-2].children[4].textContent),
                '2020_profit' : parseFloat(table[length-1].children[4].textContent),
                'totalstocks' : parseInt(dom.window.document.querySelectorAll('.alt')[5].children[1].textContent.replace(/,/g,"")),
                'currentprice' : parseFloat(dom.window.document.querySelectorAll('#company td')[0].textContent.replace(/,/g,""))
            } ;
            var ROE = (json['2020_profit']*1000000*100/(json['2020_nav']*json['totalstocks'])).toFixed(2).replace(/NaN/g,0);
            var EarnGrowth = ((json['2020_eps']/json['2019_eps']-1)*100).toFixed(2).replace(/NaN/g,0) ;
            var PE = (json['currentprice'] / json['2020_eps']).toFixed(2).replace(/NaN/g,0).replace(/-/g,"100") ;
            var sector = dom.window.document.getElementsByClassName('alt')[5].children[3].textContent

            console.log(json)
            // fundamentals.push(
            var p = {
                _id : i.name,
                ROE :  ROE ,
                EarnGrowth : EarnGrowth ,
                PE: PE ,
                Sector : sector 
            }
            // fs.appendFile('data.txt', "\n" + JSON.stringify(p)+",",(err)=>{
            //     console.log("written in file ");
            //     if(err) throw err ; 
            // })
             console.log(p)
        }catch(err){
            console.log("There something wrong");
        }
    }
// await model.analysis1.insertMany(fundamentals);

}
module.exports.getfundamental = getfundamental ;
// getfundamental();


//const data = require('./others/data.js')
const getfundamental_A = () =>{
    var funda = data.fundamental
    const criteria = ["PE","ROE","EarnGrowth"];
    for( var qo of criteria){
        funda.sort((a,b)=>{
            var ape = parseFloat(a[qo]) ;
            var bpe = parseFloat(b[qo]) ;
            if( qo =="PE"){
                ape =  (ape == 0 ) ? 10000 : ape ;
                bpe =  (bpe == 0 ) ? 10000 : bpe ;
                return ape < bpe ? 1 : ( ape > bpe ? -1 : 0)
            }
            else{
                return ape > bpe ? 1 : ( ape<bpe ? -1 : 0)
            }
        })
        var count = 1 ; 
        for(var i of funda){
            i[`${qo}_point`] = count ; 
            count++ ;
            if(qo == "EarnGrowth") { i["totalpoint"]=   i.PE_point +  i.ROE_point + i.EarnGrowth_point  }
        }
    }
    funda.sort((a,b)=>{
        var ape = a["totalpoint"];
        var bpe = b["totalpoint"] ;
        return ape < bpe ? 1 : ( ape>bpe ? -1 : 0)
    })
    for(var i of funda){
        if(i.Sector === "Engineering"){
            fs.appendFileSync('engineer.txt',i["_id"]+'\t \t'+ i["PE_point"]+'\t \t'+i["totalpoint"]+'\n')
        }
        // fs.appendFileSync('finallist.txt',i["_id"]+'\n')
    }
    fs.writeFile('data3.txt', JSON.stringify(funda),(err)=>{
        console.log("written in file ");
        if(err) throw err ; 
    })
}
//getfundamental_A();


