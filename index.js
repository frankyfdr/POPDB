const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mysql = require('mysql');
require("./controlers/everyday.js")
const delay = require('delay');
const fs = require("fs");
var PORT = process.env.PORT || 3001;

//iniciando app
const app = express();
app.use(cors());
app.use(express.json());
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database:"stonks"
  });

//addData()
//checkEarnings();

app.all('/pop/:sym/:tkn', function (req, res,next) {
    if(req.params.tkn == "true")
    try{
        var upsql = "select symbol from sym where symbol NOT in (select sym from data)  ";

        con.query(upsql,function(err,result){
            try{
        if(err) throw err
       
        for(let idx = 0; idx < result.length;idx++)
        {
            console.log(idx+" - "+result[idx].symbol)
            populate(result[idx].symbol)
        }
            
        

    }catch(err){}
        })


    }catch(err)
    {
        console.log(err)
    }
    finally
    {
        res.send("done")
    }
     else
      return 502;
});
function checkEarnings()
{
    console.log("checking...")
    var days =5
    var now = new Date()  
    var start = Math.round(now.getTime() / 1000)
    var end  = Math.round(now.getTime() / 1000)-days*100000
    var sql = "select * from events where start_earningDate < "+start +" and start_earningDate > "+end+" and earningsUP = false "
    con.query(sql,async function(err,result){
        if(result)
        {
            console.log("result: " +result.length)
            for(let idx = 0; idx < result.length;idx++)
            {
                await delay(1*1000);
                process.stdout.write("\u001b[2J\u001b[0;0H");
                console.log((((idx+1) * 100) / result.length).toFixed(2)+"%")
                console.log(idx+" - "+result[idx].sym)
                await Promise.resolve(populate(result[idx].sym))

                if(idx+1 == result.length)
                console.log("Finished!.")

                
            }
        }
    })
    
}

async function addData(sql)
{
    var upsql = "select symbol from sym";

   await con.query(upsql,async function(err,result){
    
    if(err) throw err
    console.log("result: " +result.length)
    for(let idx = 0; idx < result.length;idx++)
    {
        await delay(7*1000);
       console.log((((idx+1) * 100) / result.length).toFixed(2)+"%")
       console.log(idx+" - "+result[idx].symbol)
       fullquery = await populate(result[idx].symbol)

        if(idx+1 == result.length)
        console.log("Finished!.")

        
    }
  
    })
    
}


function saveInDoc(sql)
{
    fs.appendFile('query.txt', sql+"\r\n", function (err) {
        if (err) throw err;
      });
}

 async function populate(sym)
{
   

    
    let date = Date.now().toString()
    date = date.substring(0,date.length - 3)
    
    url3 = "https://query2.finance.yahoo.com/v10/finance/quoteSummary/"+sym+"?formatted=true&crumb=pIcl6kmUskJ&lang=en-GB&region=GB&modules=pageViews%2CpageViews%2CassetProfile%2CsecFilings%2CincomeStatementHistory%2CcalendarEvents%2CcashflowStatementHistory%2CbalanceSheetHistory%2CincomeStatementHistoryQuarterly%2CcashflowStatementHistoryQuarterly%2Cprice%2CbalanceSheetHistoryQuarterly"    
   url2 = "https://query2.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/"+sym+"?lang=en-US&region=US&symbol="+sym+"&padTimeSeries=true&type=annualTreasurySharesNumber%2CtrailingTreasurySharesNumber%2CannualPreferredSharesNumber%2CtrailingPreferredSharesNumber%2CannualOrdinarySharesNumber%2CtrailingOrdinarySharesNumber%2CannualShareIssued%2CtrailingShareIssued%2CannualNetDebt%2CtrailingNetDebt%2CannualTotalDebt%2CtrailingTotalDebt%2CannualTangibleBookValue%2CtrailingTangibleBookValue%2CannualInvestedCapital%2CtrailingInvestedCapital%2CannualWorkingCapital%2CtrailingWorkingCapital%2CannualNetTangibleAssets%2CtrailingNetTangibleAssets%2CannualCapitalLeaseObligations%2CtrailingCapitalLeaseObligations%2CannualCommonStockEquity%2CtrailingCommonStockEquity%2CannualPreferredStockEquity%2CtrailingPreferredStockEquity%2CannualTotalCapitalization%2CtrailingTotalCapitalization%2CannualTotalEquityGrossMinorityInterest%2CtrailingTotalEquityGrossMinorityInterest%2CannualMinorityInterest%2CtrailingMinorityInterest%2CannualStockholdersEquity%2CtrailingStockholdersEquity%2CannualOtherEquityInterest%2CtrailingOtherEquityInterest%2CannualGainsLossesNotAffectingRetainedEarnings%2CtrailingGainsLossesNotAffectingRetainedEarnings%2CannualOtherEquityAdjustments%2CtrailingOtherEquityAdjustments%2CannualFixedAssetsRevaluationReserve%2CtrailingFixedAssetsRevaluationReserve%2CannualForeignCurrencyTranslationAdjustments%2CtrailingForeignCurrencyTranslationAdjustments%2CannualMinimumPensionLiabilities%2CtrailingMinimumPensionLiabilities%2CannualUnrealizedGainLoss%2CtrailingUnrealizedGainLoss%2CannualTreasuryStock%2CtrailingTreasuryStock%2CannualRetainedEarnings%2CtrailingRetainedEarnings%2CannualAdditionalPaidInCapital%2CtrailingAdditionalPaidInCapital%2CannualCapitalStock%2CtrailingCapitalStock%2CannualOtherCapitalStock%2CtrailingOtherCapitalStock%2CannualCommonStock%2CtrailingCommonStock%2CannualPreferredStock%2CtrailingPreferredStock%2CannualTotalPartnershipCapital%2CtrailingTotalPartnershipCapital%2CannualGeneralPartnershipCapital%2CtrailingGeneralPartnershipCapital%2CannualLimitedPartnershipCapital%2CtrailingLimitedPartnershipCapital%2CannualTotalLiabilitiesNetMinorityInterest%2CtrailingTotalLiabilitiesNetMinorityInterest%2CannualTotalNonCurrentLiabilitiesNetMinorityInterest%2CtrailingTotalNonCurrentLiabilitiesNetMinorityInterest%2CannualOtherNonCurrentLiabilities%2CtrailingOtherNonCurrentLiabilities%2CannualLiabilitiesHeldforSaleNonCurrent%2CtrailingLiabilitiesHeldforSaleNonCurrent%2CannualRestrictedCommonStock%2CtrailingRestrictedCommonStock%2CannualPreferredSecuritiesOutsideStockEquity%2CtrailingPreferredSecuritiesOutsideStockEquity%2CannualDerivativeProductLiabilities%2CtrailingDerivativeProductLiabilities%2CannualEmployeeBenefits%2CtrailingEmployeeBenefits%2CannualNonCurrentPensionAndOtherPostretirementBenefitPlans%2CtrailingNonCurrentPensionAndOtherPostretirementBenefitPlans%2CannualNonCurrentAccruedExpenses%2CtrailingNonCurrentAccruedExpenses%2CannualDuetoRelatedPartiesNonCurrent%2CtrailingDuetoRelatedPartiesNonCurrent%2CannualTradeandOtherPayablesNonCurrent%2CtrailingTradeandOtherPayablesNonCurrent%2CannualNonCurrentDeferredLiabilities%2CtrailingNonCurrentDeferredLiabilities%2CannualNonCurrentDeferredRevenue%2CtrailingNonCurrentDeferredRevenue%2CannualNonCurrentDeferredTaxesLiabilities%2CtrailingNonCurrentDeferredTaxesLiabilities%2CannualLongTermDebtAndCapitalLeaseObligation%2CtrailingLongTermDebtAndCapitalLeaseObligation%2CannualLongTermCapitalLeaseObligation%2CtrailingLongTermCapitalLeaseObligation%2CannualLongTermDebt%2CtrailingLongTermDebt%2CannualLongTermProvisions%2CtrailingLongTermProvisions%2CannualCurrentLiabilities%2CtrailingCurrentLiabilities%2CannualOtherCurrentLiabilities%2CtrailingOtherCurrentLiabilities%2CannualCurrentDeferredLiabilities%2CtrailingCurrentDeferredLiabilities%2CannualCurrentDeferredRevenue%2CtrailingCurrentDeferredRevenue%2CannualCurrentDeferredTaxesLiabilities%2CtrailingCurrentDeferredTaxesLiabilities%2CannualCurrentDebtAndCapitalLeaseObligation%2CtrailingCurrentDebtAndCapitalLeaseObligation%2CannualCurrentCapitalLeaseObligation%2CtrailingCurrentCapitalLeaseObligation%2CannualCurrentDebt%2CtrailingCurrentDebt%2CannualOtherCurrentBorrowings%2CtrailingOtherCurrentBorrowings%2CannualLineOfCredit%2CtrailingLineOfCredit%2CannualCommercialPaper%2CtrailingCommercialPaper%2CannualCurrentNotesPayable%2CtrailingCurrentNotesPayable%2CannualPensionandOtherPostRetirementBenefitPlansCurrent%2CtrailingPensionandOtherPostRetirementBenefitPlansCurrent%2CannualCurrentProvisions%2CtrailingCurrentProvisions%2CannualPayablesAndAccruedExpenses%2CtrailingPayablesAndAccruedExpenses%2CannualCurrentAccruedExpenses%2CtrailingCurrentAccruedExpenses%2CannualInterestPayable%2CtrailingInterestPayable%2CannualPayables%2CtrailingPayables%2CannualOtherPayable%2CtrailingOtherPayable%2CannualDuetoRelatedPartiesCurrent%2CtrailingDuetoRelatedPartiesCurrent%2CannualDividendsPayable%2CtrailingDividendsPayable%2CannualTotalTaxPayable%2CtrailingTotalTaxPayable%2CannualIncomeTaxPayable%2CtrailingIncomeTaxPayable%2CannualAccountsPayable%2CtrailingAccountsPayable%2CannualTotalAssets%2CtrailingTotalAssets%2CannualTotalNonCurrentAssets%2CtrailingTotalNonCurrentAssets%2CannualOtherNonCurrentAssets%2CtrailingOtherNonCurrentAssets%2CannualDefinedPensionBenefit%2CtrailingDefinedPensionBenefit%2CannualNonCurrentPrepaidAssets%2CtrailingNonCurrentPrepaidAssets%2CannualNonCurrentDeferredAssets%2CtrailingNonCurrentDeferredAssets%2CannualNonCurrentDeferredTaxesAssets%2CtrailingNonCurrentDeferredTaxesAssets%2CannualDuefromRelatedPartiesNonCurrent%2CtrailingDuefromRelatedPartiesNonCurrent%2CannualNonCurrentNoteReceivables%2CtrailingNonCurrentNoteReceivables%2CannualNonCurrentAccountsReceivable%2CtrailingNonCurrentAccountsReceivable%2CannualFinancialAssets%2CtrailingFinancialAssets%2CannualInvestmentsAndAdvances%2CtrailingInvestmentsAndAdvances%2CannualOtherInvestments%2CtrailingOtherInvestments%2CannualInvestmentinFinancialAssets%2CtrailingInvestmentinFinancialAssets%2CannualHeldToMaturitySecurities%2CtrailingHeldToMaturitySecurities%2CannualAvailableForSaleSecurities%2CtrailingAvailableForSaleSecurities%2CannualFinancialAssetsDesignatedasFairValueThroughProfitorLossTotal%2CtrailingFinancialAssetsDesignatedasFairValueThroughProfitorLossTotal%2CannualTradingSecurities%2CtrailingTradingSecurities%2CannualLongTermEquityInvestment%2CtrailingLongTermEquityInvestment%2CannualInvestmentsinJointVenturesatCost%2CtrailingInvestmentsinJointVenturesatCost%2CannualInvestmentsInOtherVenturesUnderEquityMethod%2CtrailingInvestmentsInOtherVenturesUnderEquityMethod%2CannualInvestmentsinAssociatesatCost%2CtrailingInvestmentsinAssociatesatCost%2CannualInvestmentsinSubsidiariesatCost%2CtrailingInvestmentsinSubsidiariesatCost%2CannualInvestmentProperties%2CtrailingInvestmentProperties%2CannualGoodwillAndOtherIntangibleAssets%2CtrailingGoodwillAndOtherIntangibleAssets%2CannualOtherIntangibleAssets%2CtrailingOtherIntangibleAssets%2CannualGoodwill%2CtrailingGoodwill%2CannualNetPPE%2CtrailingNetPPE%2CannualAccumulatedDepreciation%2CtrailingAccumulatedDepreciation%2CannualGrossPPE%2CtrailingGrossPPE%2CannualLeases%2CtrailingLeases%2CannualConstructionInProgress%2CtrailingConstructionInProgress%2CannualOtherProperties%2CtrailingOtherProperties%2CannualMachineryFurnitureEquipment%2CtrailingMachineryFurnitureEquipment%2CannualBuildingsAndImprovements%2CtrailingBuildingsAndImprovements%2CannualLandAndImprovements%2CtrailingLandAndImprovements%2CannualProperties%2CtrailingProperties%2CannualCurrentAssets%2CtrailingCurrentAssets%2CannualOtherCurrentAssets%2CtrailingOtherCurrentAssets%2CannualHedgingAssetsCurrent%2CtrailingHedgingAssetsCurrent%2CannualAssetsHeldForSaleCurrent%2CtrailingAssetsHeldForSaleCurrent%2CannualCurrentDeferredAssets%2CtrailingCurrentDeferredAssets%2CannualCurrentDeferredTaxesAssets%2CtrailingCurrentDeferredTaxesAssets%2CannualRestrictedCash%2CtrailingRestrictedCash%2CannualPrepaidAssets%2CtrailingPrepaidAssets%2CannualInventory%2CtrailingInventory%2CannualInventoriesAdjustmentsAllowances%2CtrailingInventoriesAdjustmentsAllowances%2CannualOtherInventories%2CtrailingOtherInventories%2CannualFinishedGoods%2CtrailingFinishedGoods%2CannualWorkInProcess%2CtrailingWorkInProcess%2CannualRawMaterials%2CtrailingRawMaterials%2CannualReceivables%2CtrailingReceivables%2CannualReceivablesAdjustmentsAllowances%2CtrailingReceivablesAdjustmentsAllowances%2CannualOtherReceivables%2CtrailingOtherReceivables%2CannualDuefromRelatedPartiesCurrent%2CtrailingDuefromRelatedPartiesCurrent%2CannualTaxesReceivable%2CtrailingTaxesReceivable%2CannualAccruedInterestReceivable%2CtrailingAccruedInterestReceivable%2CannualNotesReceivable%2CtrailingNotesReceivable%2CannualLoansReceivable%2CtrailingLoansReceivable%2CannualAccountsReceivable%2CtrailingAccountsReceivable%2CannualAllowanceForDoubtfulAccountsReceivable%2CtrailingAllowanceForDoubtfulAccountsReceivable%2CannualGrossAccountsReceivable%2CtrailingGrossAccountsReceivable%2CannualCashCashEquivalentsAndShortTermInvestments%2CtrailingCashCashEquivalentsAndShortTermInvestments%2CannualOtherShortTermInvestments%2CtrailingOtherShortTermInvestments%2CannualCashAndCashEquivalents%2CtrailingCashAndCashEquivalents%2CannualCashEquivalents%2CtrailingCashEquivalents%2CannualCashFinancial%2CtrailingCashFinancial%2CannualTotalLiabilitiesNetMinorityInterest%2CtrailingCostOfRevenue%2CannualCashDividendsPaid%2CtrailingCashDividendsPaid%2CtrailingInvestingCashFlow%2CannualInvestingCashFlow%2CannualNetIncome%2CannualEbitda&merge=false&period1=493590046&period2="+date
    url ="https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/"+sym+"?lang=en-GB&region=GB&symbol="+sym+"&padTimeSeries=true&type=annualTotalLiabilitiesNetMinorityInterest%2CtrailingCostOfRevenue%2CannualCashDividendsPaid%2CtrailingCashDividendsPaid%2CtrailingInvestingCashFlow%2CannualInvestingCashFlow%2CannualNetIncome%2CannualEbitda&merge=false&period1=493590046&period2=1612014480"
    await  axios.get(url3).then(async data=>{

    try{
        
        if(data.data.quoteSummary.result[0])
        await getdataQuarterly(data.data.quoteSummary.result[0],sym)
        await getdataAnnual(data.data.quoteSummary.result[0],sym)
        }catch(err){
            console.log("error:"+ sym+ "MESSAGE: "+err)
        }
  
   })
  
   
}


 async function getSym()
{
   
    console.log("start..")
    try{
    //url = "https://query2.finance.yahoo.com/v1/finance/lookup?formatted=true&lang=en-US&query="+letter+"&type=all&count=2000&start=0";
   url = "https://query2.finance.yahoo.com/v1/finance/screener/public/saved?formatted=true&lang=en-US&region=US&start=3200&count=250&scrId=58290e58-e0f9-49b3-a6db-ec2162291ff3"
    axios.get(url).then(data =>{
        data =data.data.finance.result[0].quotes;
        data.map(async (item)=>{
            await delay(3000);
            try{
                  
                var upsql = "select * from sym where symbol = '"+item.symbol+"'";
                await con.query(upsql,function(err,result){
                   
               if(result == false) 
               {
                var sql = "insert into sym (symbol,industryName,exchange,quoteType,shortName) values ('"+item.symbol+"','"+item.industryName+"','"+item.exchange+"','"+item.quoteType+"',\""+item.longName+"\");";
                //sql+= "insert into events () values"
                con.query(sql);
                console.log("Done: "+item.symbol)
                }
                
                })

                
    
            }catch(err)
            {
                console.log(err)
            }
        
        })
    })
    

        }catch(err)
        {
            console.log(err)
        }
        finally{
        }
}

function insertIndicator(data,category)
{
    data.map(item =>{
        let type = item.meta.type;
        let sql ="insert into indicator (type,category) Values('"+type+"','"+category+"')";
        con.query(sql, function (err, result) {
            if (err) throw err;
    })
    })
}





function incomeStatment(data,id,type)
{
    
    data.map((item)=>{
        if(item.meta.type == type)
        {
            let sym = item.meta.symbol;
            var idx = 0;
            
            if(item[type])
            item[type].map((item2)=>{
              
                try{
                    
                let timestamp = item.timestamp[idx];
                let date = item2.asOfDate;
                let raw = item2.reportedValue.raw;
                let currencyCode = item2.currencyCode;
                let fmt = item2.reportedValue.fmt;
                let periodType = item2.periodType;
                
                var upsql = "select * from income_statement where indicator = "+id+" and sym='"+sym+"' and timestamp = "+timestamp+"; ";
                con.query(upsql, function (err, result) {
                    if (err) throw err;
                    
                    
                    if(result == false)
                    {
                        
                        var sql = "insert into income_statement (sym,date,raw,indicator,currencyCode,fmt,periodType,timestamp) values ('"+sym+"','"+date+"','"+raw+"',"+id+",'"+currencyCode+"','"+fmt+"','"+periodType+"',"+timestamp+");"
                        con.query(sql);
                    }      
                })
                idx++;
                }catch(err)
                {}
            })
           
        }
    })
   
}

function annualNetIncome(data)
{

var sql = "select type from indicator where id=13";
con.query(sql, function (err, result) {
  if (err) throw err;
    data.map((item)=>{
        if(item.meta.type == result[0].type)
        {
            let sym = item.meta.symbol;
            var idx = 0;
            item[result[0].type].map((item2)=>{
                let timestamp = item.timestamp[idx];

                let date = item2.asOfDate;
                let raw = item2.reportedValue.raw;
                let currencyCode = item2.currencyCode;
                let fmt = item2.reportedValue.fmt;
                let periodType = item2.periodType;
                var sql = "insert into income_statement (sym,date,raw,indicator,currencyCode,fmt,periodType,timestamp) values ('"+sym+"','"+date+"','"+raw+"',13,'"+currencyCode+"','"+fmt+"','"+periodType+"',"+timestamp+");"
                con.query(sql);
                idx++;
            })
           
        }
    })
    
})
}

 async function getdataAnnual(data,sym)
{
    if(data.incomeStatementHistory.incomeStatementHistory == "")
    {
        var sql = "insert into data (sym,date,timestamp,raw,fmt,code,category) values ('"+sym+"',null,null,null,null,null,null);"
       
        await con.query(sql, function (err, result) {
            if (err) throw err;
            })
            console.log("no data: " +sym)
    } 
    else
    {
    await data.cashflowStatementHistory.cashflowStatements.map( async (item)=>{
        try{
                let date = item.endDate.fmt;
                let timestamp =item.endDate.raw;
                let keys = Object.keys(item);
               
              await  keys.map( async code => {
                    
                    var upsql = "select * from data where code = '"+code+"' and sym ='"+sym+"' and timestamp ="+timestamp+" and periodType = '12M'";
                    await  con.query(upsql,async function(err,result){

                   
                   if(result == false) 
                   {
                

                        var sql = "insert into data (sym,date,timestamp,raw,fmt,periodType,code,category) values ('"+sym+"','"+date+"',"+timestamp+",'"+item[code].raw+"','12M','"+item[code].fmt+"','"+code+"','cashflowStatementHistory');";
                         await con.query(sql)
                       

                    }
                   
                    })
                })
                 
                
                
            }
            catch(err)
            {
                console.log("erro")
                console.log(err)
            }
    })
    await data.incomeStatementHistory.incomeStatementHistory.map((item)=>{
        try{
                let date = item.endDate.fmt;
                let timestamp =item.endDate.raw;
                let keys = Object.keys(item);
                
                keys.map(code => {
                    
                    
                    var upsql = "select * from data where code = '"+code+"' and sym ='"+sym+"' and timestamp ="+timestamp+" and periodType = '12M'";
                    con.query(upsql,async function(err,result){

                   
                   if(result == false) 
                   {
                    
                    var sql = "insert into data (sym,date,timestamp,raw,fmt,periodType,code,category) values ('"+sym+"','"+date+"',"+timestamp+",'"+item[code].raw+"','"+item[code].fmt+"','12M','"+code+"','incomeStatementHistory');";
                   await con.query(sql);
                    }
                   
                    })
                })
                
            }
            catch(err)
            {
                console.log(err)
            }
    })
    await data.balanceSheetHistory.balanceSheetStatements.map((item)=>{
        try{
                let date = item.endDate.fmt;
                let timestamp =item.endDate.raw;
                let keys = Object.keys(item);
                
                keys.map(code => {
                    
                    var upsql = "select * from data where code = '"+code+"' and sym ='"+sym+"' and timestamp ="+timestamp+" and periodType = '12M'";
                    con.query(upsql,async function(err,result){
                   
                   if(result == false) 
                   {
                       
                        var sql = "insert into data (sym,date,timestamp,raw,fmt,periodType,code,category) values ('"+sym+"','"+date+"',"+timestamp+",'"+item[code].raw+"','"+item[code].fmt+"','12M','"+code+"','balanceSheetHistory');";
                       
                        await con.query(sql);
                    }
                   
                    })
                })
                  
                
            }
            catch(err)
            {
                console.log(err)
            }
    })

    
    }
    
  
}

async function getdataQuarterly(data,sym)
{
   var fullquery = "";
    if(data.incomeStatementHistory.incomeStatementHistory == "")
    {
        var sql = "insert into data (sym,date,timestamp,raw,fmt,code,category) values ('"+sym+"',null,null,null,null,null,null);"
       
        await con.query(sql, function (err, result) {
            if (err) throw err;
            })
            console.log("no data: " +sym)
    } 
    else
    {
    await data.cashflowStatementHistoryQuarterly.cashflowStatements.map( async (item)=>{
        try{
                let date = item.endDate.fmt;
                let timestamp =item.endDate.raw;
                let keys = Object.keys(item);
               
              
              await  keys.map( async code => {
                    
                    var upsql = "select * from data where code = '"+code+"' and sym ='"+sym+"' and timestamp ="+timestamp+" and periodType = '3M'";
                    await  con.query(upsql,async function(err,result){

                   
                   if(result == false) 
                   {
                        var sql = "insert into data (sym,date,timestamp,raw,fmt,periodType,code,category) values ('"+sym+"','"+date+"',"+timestamp+",'"+item[code].raw+"','"+item[code].fmt+"','3M','"+code+"','cashflowStatementHistory');";
                         await con.query(sql)
                       

                    }
                   
                    })
                })
                 
                
                
            }
            catch(err)
            {
                console.log("erro")
                console.log(err)
            }
    })
    await data.incomeStatementHistoryQuarterly.incomeStatementHistory.map((item)=>{
        try{
                let date = item.endDate.fmt;
                let timestamp =item.endDate.raw;
                let keys = Object.keys(item);
                
                keys.map(code => {
                    
                    
                    var upsql = "select * from data where code = '"+code+"' and sym ='"+sym+"' and timestamp ="+timestamp+" and periodType = '3M'";
                    con.query(upsql,async function(err,result){

                   
                   if(result == false) 
                   {
                    
                    var sql = "insert into data (sym,date,timestamp,raw,fmt,periodType,code,category) values ('"+sym+"','"+date+"',"+timestamp+",'"+item[code].raw+"','"+item[code].fmt+"','3M','"+code+"','incomeStatementHistory');";
                   await con.query(sql);
                    }
                   
                    })
                })
                
            }
            catch(err)
            {
                console.log(err)
            }
    })
    await data.balanceSheetHistoryQuarterly.balanceSheetStatements.map((item)=>{
        try{
                let date = item.endDate.fmt;
                let timestamp =item.endDate.raw;
                let keys = Object.keys(item);
                
                keys.map(code => {
                    
                    var upsql = "select * from data where code = '"+code+"' and sym ='"+sym+"' and timestamp ="+timestamp+" periodType = '3M'";
                    con.query(upsql,async function(err,result){

                   
                   if(result == false) 
                   {
                        
                        var sql = "insert into data (sym,date,timestamp,raw,fmt,periodType,code,category) values ('"+sym+"','"+date+"',"+timestamp+",'"+item[code].raw+"','"+item[code].fmt+"','3M','"+code+"','balanceSheetHistory');";
                        await con.query(sql);
                    }
                   
                    })
                })
                  
                
            }
            catch(err)
            {
                console.log(err)
            }
    })

    
    }
    
  
}

console.log("Server running on port: ", PORT);
app.listen(PORT);