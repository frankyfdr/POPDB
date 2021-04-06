const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mysql = require('mysql');
const delay = require('delay');
const f = require("../index.js")

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database:"stonks"
  });

//getEarnings();
async function getEarnings()
{
   console.log("iniziate..")
        var sql = "select symbol from sym where symbol not in (select sym from events)"
        
       await con.query(sql,async function(err,result){
             

        for(let idx = 0; idx < result.length;idx++)
        {
            await delay(3000);
           
               if(result)
               {
                await  axios.get("https://query2.finance.yahoo.com/v10/finance/quoteSummary/"+result[idx].symbol+"?formatted=true&crumb=pIcl6kmUskJ&lang=en-GB&region=GB&modules=calendarEvents")
                .then((resp)=>{

                    resp = resp.data.quoteSummary.result[0];
                   
                   let StartDate =null;
                   let endDate = null;
                   let exDiv =null;
                   let Div =null;

                   if(resp.calendarEvents.earnings.earningsDate[0])
                   StartDate =resp.calendarEvents.earnings.earningsDate[0].raw

                   if(resp.calendarEvents.earnings.earningsDate[1])
                   endDate =resp.calendarEvents.earnings.earningsDate[1].raw

                   if(resp.calendarEvents.exDividendDate)
                   exDiv =resp.calendarEvents.exDividendDate.raw

                   if(resp.calendarEvents.dividendDate)
                    Div =resp.calendarEvents.dividendDate.raw
                   
                    var sql2 = "insert into events (sym,start_earningDate,end_earningDate,earningsUP,Ex_DividendDate,dividendDate) Values ('"+result[idx].symbol+"','"+StartDate+"','"+endDate+"',"+false+",'"+exDiv+"','"+Div+"')";
                    con.query(sql2)
                    console.log("done: "+result[idx].symbol)
                    
                })
                }else
                    console.log("mysql query error")
              
            }
             
            
        })
    
}
//checkEarnings();

function checkEarnings()
{
    console.log("checking...")
    var days =5
    var now = new Date()  
    var start = Math.round(now.getTime() / 1000)
    var end  = Math.round(now.getTime() / 1000)-days*100000
    var sql = "select * from events where start_earningDate < "+start +" and start_earningDate > "+end+" and earningsUP = false"
    con.query(sql,function(err,result){
        if(result)
        {
            result.map(async(item,i)=>{
                await delay(3000);
                /* ---------------------console view -------------------------*/
                process.stdout.write("\u001b[2J\u001b[0;0H");
                console.log((((i+1) * 100) / result.length).toFixed(2)+"%")
                 console.log(i+" - "+item.sym)
                /* ------------------------------------ -------------------------*/
                f.populate(item.sym)
            })
        }
    })
}

runEverySym();
function runEverySym(){
    
    let sql = "select symbol from sym where symbol not in ( select sym from statistic)"
    con.query(sql, async function(err,result){
        console.log("Getting shares outstanding")
        for(let idx = 0; idx < result.length;idx++)
        {
            await delay(1500);
            process.stdout.write("\u001b[2J\u001b[0;0H");
            console.log((((idx+1) * 100) / result.length).toFixed(2)+"%")
            console.log(idx+" - "+result[idx].symbol)
           await getSharesOutstanding(result[idx].symbol)
        }
    })
}



function getSharesOutstanding(sym){

   
    var url = "https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/"+sym+"?lang=en-GB&region=GB&symbol="+sym+"&padTimeSeries=true&type=annualShareIssued&merge=false&period1=493590046&period2=1612014480"
    axios.get(url).then(async data=>{
        data = data.data.timeseries.result[0];

        data.annualShareIssued.map((item,idx)=>{

            let sql = "insert into statistic (sym,date,timestamp,periodType,raw,fmt,code) Values ('"+sym+"','"+item.asOfDate+"',"+data.timestamp[idx]+",'"+item.periodType+"',"+item.reportedValue.raw+",'"+item.reportedValue.fmt+"','annualShareIssued');"
            con.query(sql)

        })
    })
}