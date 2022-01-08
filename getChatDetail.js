const {documentPath:baseDocumentPath} = require('./config')
const path = require('path')
const sqlite3 = require('sqlite3')
const moment = require('moment')
const format = require('./format')
const getAccountList = require("./getAccountList");

async function mmSql(tempAccount, friendId) {
    const accountList = getAccountList()
    const currentAccount = accountList.find(item => item.accountMd5 === tempAccount)
    const len = currentAccount.messageDb.length;
    for(let i = 0; i< len; i++ ){
        const dbName = currentAccount.messageDb[i];
        const dbPath = path.join(baseDocumentPath,tempAccount,'/DB',dbName)
        var db = new sqlite3.Database(dbPath,sqlite3.OPEN_READONLY,function (error) {
            if (error){
                console.log("Database error:",error);
            }
        });
        const mm = new Promise((resolve, reject) => {
            db.all("select * from SQLITE_MASTER where type = 'table' and name like 'Chat/_%' ESCAPE '/' ;",function (error,rows){
                if(error) reject(error);
                resolve({dbName, rows})
            })
        })
        const rowsInfo = await mm;
        const result = getResultByFriendId(rowsInfo,friendId)
        if(result) {
            return result
        }
    }
    return null;
}

function getResultByFriendId(rowsInfo, id) {
    const {dbName, rows} = rowsInfo
    const len = rows.length;
    for(let i = 0; i< len; i++ ){
        const row = rows[i]
        const {name} = row;
        if(name.includes(id)) {
            return {dbName,name}
        }
    }
    return null;
}

async function getDataBySql(tempAccount, friendId, size, num){
    const result = await mmSql(tempAccount, friendId)
    if(result) {
        const { dbName, name} = result;
        const filePath = path.join(baseDocumentPath, tempAccount, '/DB',dbName)
       return await openDB(filePath,name, tempAccount,friendId,size, num)
    }
    return null;
}

async function openDB(filePath,name,tempAccount,friendId, size=10, num=1){
    const db = new sqlite3.Database(filePath,sqlite3.OPEN_READONLY,function (error) {
        if (error){
            console.log("Database error:",error);
        }
    });

    const sql = "SELECT * FROM "+name+" order by CreateTime asc limit "+size+" offset " + (size) * (num-1);
    const runSql = new Promise((resolve, reject) => {
        db.all(sql, (err, rows) => {
            if(err) reject(err);
            const arr = []
            for(let i in rows) {
                const {CreateTime, MesLocalID,Message,Type, Des} = rows[i]
                const time = moment(CreateTime * 1000).format('YYYY-MM-DD-HH:mm:ss')
                const formatMessage = format(tempAccount, friendId,Message, Type, MesLocalID, time, Des)
                arr.push({
                    time, formatMessage
                })
            }
            resolve(arr)
        })
    })
    return await runSql
}

module.exports = getDataBySql
