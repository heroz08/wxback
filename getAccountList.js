const fs = require('fs');
const path = require('path');
const {documentPath:baseDocumentPath} = require('./config')

// readAccount()
module.exports = function readAccount(){ // 根据md5找到账户文件夹和对应的sql文件
    const accountList = []
    const dirList = fs.readdirSync(baseDocumentPath)
    const len = dirList.length;
    if(len) {
        for(let i=0; i< len; i++ ){
            if(dirList[i].length == 32 && dirList[i]!="00000000000000000000000000000000") {
                const obj = {}
                const messageDb = []

                obj.accountMd5 = dirList[i]
                const dbPath = path.join(baseDocumentPath, dirList[i],'/DB')
                const dbList = fs.readdirSync(dbPath)
                const le = dbList.length;
                for(let j = 0; j< le;j++) {
                    const file = dbList[j]
                    if(file && file.includes('message') && file.slice(-7) === '.sqlite'){
                        messageDb.push(file)
                    }
                }
                obj.messageDb = messageDb
                accountList.push(obj)
            }
        }
    } else {
        console.log('read error')
    }
    return accountList;
}




