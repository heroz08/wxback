const {documentPath:baseDocumentPath} = require('./config')
const path = require('path')
const sqlite3 = require('sqlite3')
const md5 = require('js-md5')



async function contactSql(contactSqlPath, size=10, num=1) {
    const db = new sqlite3.Database(contactSqlPath, sqlite3.OPEN_READONLY, function(err){
        if(err) console.log(err)
    })
    const eachDb = new Promise((resolve, reject) => {
        // 查找朋友的信息
        db.all(`select *,lower(quote(dbContactRemark)) as crmark from Friend where type > 6 and type != 256 limit ${size} offset ${size* (num-1)};`,(err, rows) => {
            if(err) reject(err);
            const friends = {};
            const len = rows.length;
            for(let i = 0; i< len; i++) {
                const row = rows[i]
                if(!row.dbContactChatRoom) {
                    const nameMd5 = md5(row.userName)
                    const pos1 = row.dbContactHeadImage.indexOf('http://wx.qlogo.cn/');
                    const end = row.dbContactHeadImage.indexOf('132');
                    const headImgUlr = row.dbContactHeadImage.slice(pos1,end).toString()
                    friends[nameMd5] = { // 朋友的微信号头像以及name信息 改过名字的为多个
                        wechatId: row.userName,
                        headImgUlr,
                        nameInfo: format162str(row.crmark.slice(2, -1))
                    }
                }

            }
            resolve(friends)
        })
    })
    const DbSum = new Promise((resolve, reject) => {
        db.all(`select *,lower(quote(dbContactRemark)) as crmark from Friend where type > 6 and type != 256;`,(err, rows) => {
            if(err) reject(err)
            const len = rows.length;
            resolve(len)
        })
    })
    const friends = await eachDb // 根据分页查找的数据
    const sum = await DbSum // 总条数
    return {
        friends, sum
    }
}


function format162str(s){
    const output = Buffer.from(s, 'hex');
    const temp =  output.toString('utf8');
    return temp
}


const init = async (currentAccount, size, num) => {
    // 联系人sql path
    const contactSqlPath = path.join(baseDocumentPath,currentAccount,'/DB/WCDB_Contact.sqlite')
    return await contactSql(contactSqlPath,size, num)
}

module.exports = init

