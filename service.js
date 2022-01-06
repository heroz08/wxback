const koa = require('koa')
const router = require('koa-router')
const getAccountList = require("./getAccountList");
const getChatList = require("./getChatList");
const getDetail = require('./getChatDetail')
const app = new koa()
const _ = router()



_.get('/getAccountList', async(ctx) => {
    ctx.body = {
        data: getAccountList(),
        message: null,
        code : 200
    }
})

_.get('/getChartList', async(ctx) => {
    const {account, size, num} = ctx.query;
    if(account) {
        // const accountList = getAccountList()
        // const currentAccount = accountList.find(item => item.accountMd5 === account)
        const friends  = await getChatList(account, size, num)
        ctx.body = {
            data: friends,
            code: 200,
            message: null
        }
    }
})

_.get('/getDetail', async ctx => {
    const { friendId, account ,size, num} = ctx.query;
    if(friendId) {
        const result = await getDetail(account, friendId, size, num)
        if(result) ctx.body = {
            data: result,
            code: 200,
            message: null
        }
    }
})




app.use(_.routes())
app.listen(8989)