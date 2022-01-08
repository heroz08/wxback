const koa = require('koa')
const path = require('path')
const router = require('koa-router')
const static = require('koa-static')


// 静态资源目录对于相对入口文件index.js的路径
const staticPath = './assets'

const getAccountList = require("./getAccountList");
const getChatList = require("./getChatList");
const getDetail = require('./getChatDetail')
const app = new koa()
const _ = router()

app.use(static(
  path.join(__dirname,  staticPath)
))

_.get('/getAccountList', async(ctx) => {
    ctx.body = {
        data: getAccountList(),
        message: null,
        code : 200
    }
})

_.get('/getChartList', async(ctx) => {
    const {account, size, num, weChatId} = ctx.query;
    if(account) {
        // const accountList = getAccountList()
        // const currentAccount = accountList.find(item => item.accountMd5 === account)
        let {friends, sum}  = await getChatList(account, size, num)
        if(weChatId) {
            const temp = {}
            const filterKeys = Object.keys(friends).filter(key => {
                const item = friends[key]
                const { wechatId } = item;
                return wechatId === weChatId || wechatId.includes(weChatId)
            })
            filterKeys.forEach(key => {
                temp[key] = friends[key]
            })
            friends = temp;
            sum = friends.length;
        }
        ctx.body = {
            data: {friends, sum},
            code: 200,
            message: null
        }
    }
})


_.get('/getDetail', async ctx => {

    const { friendId, account ,size, num} = ctx.query;
    if(friendId) {
        const result = await getDetail(account, friendId, size, num)
        ctx.body = {
            data: result,
            code: 200,
            message: null
        }
    } else {
        ctx.body = {
            data: null,
            code: 0,
            message: 'error'
        }
    }

})




app.use(_.routes())
app.listen(8989,() => {
    console.log('service start :8989')
})
