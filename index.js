const getAccountList = require('./getAccountList')
const getChatList = require('./getChatList')
const {documentPath:baseDocumentPath} = require('./config')
// const path = require('path')
// const sqlite3 = require('sqlite3')
// const md5 = require('js-md5')
// const format = require('./format')

const tempAccount = 'c42292087ed64184cd90b0ec6c57a0b5'

const accountList = getAccountList()
const currentAccount = accountList.find(item => item.accountMd5 === tempAccount)

const {friends,formatSumRows } = getChatList(currentAccount)