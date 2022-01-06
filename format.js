const path = require('path')
const fs = require('fs')
const {webAssectPath, documentPath} = require('./config')
function format(tempAccount, name,Message, Type, MesLocalID,time ){
    const message = {}
    message.result = Message;
    console.log(Type, typeof Type, Message)
    switch (Type) {
        case 1:// 文字消息
            message.result = Message;
            message.type = "文字消息";
            break;
        case 3:// 图片消息
            message.result = processImage(MesLocalID, time, tempAccount, name);
            message.type = "图片消息";
            break;
        case 34:// 语音消息
            message.result = processAudio(MesLocalID, time, tempAccount, name);
            message.type = "语音消息";
            break;
        case 42:// 名片
            message.type = "名片";
            break;
        case 43:// 视频消息
        case 62:// 小视频消息
            message.result = processVideo(MesLocalID, time, tempAccount, name);
            message.type = "视频消息";
            break;
        case 47:// 动画表情
            message.type = "动画表情";
            break;
        case 48:// 位置
            message.type = "位置";
            break;
        case 49:// 分享链接
            message.type = "分享链接";
            break;
        case 50:// 语音、视频电话
            message.type = "语音、视频电话";
            break;
        case 64:// 语音聊天
            //TODO:增加对这个内容的解析
            message.type = "语音聊天";
            break;
        case 10000:
            //TODO:这个应该是撤回消息
            message.type = "系统消息";
            break;
        default:
            message.type = "其他类型消息";
    }
    return message
}

function processImage(MesLocalID, time, tempAccount, name){
    const obj = {}
    const sourcePath = path.join(documentPath, tempAccount,'Img',name,MesLocalID+ '.pic')
    const targetPath = path.join(webAssectPath, 'Img',time+'.jpg' )
    if (fs.existsSync(sourcePath)) {
        try {
            fs.copyFileSync(sourcePath, targetPath)
            obj.contentPath = targetPath;
        }catch (e) {
            console.log(e,1)
        }
    } else {
        return "[图片不存在]";
    }

    return obj
}

function processVideo (MesLocalID, time, tempAccount, name) {
    const thsourcePath = path.join(documentPath, tempAccount,'Video',name,MesLocalID + '.video_thum')
    const thtargetPath = path.join(webAssectPath, 'Video',time+ '.jpg' )
    const sourcePath = path.join(documentPath, tempAccount,'Video',name,MesLocalID +'.mp4')
    const targetPath = path.join(webAssectPath, 'Video',time+'.mp4' )
    const obj = {
        thumPath: null,
        contentPath: null
    }
    if (fs.existsSync(thsourcePath)) {
        try {
            fs.copyFileSync(thsourcePath, thtargetPath)
            obj.thumPath = thtargetPath
        }catch (e) {
            console.log(e,3)
        }
    } else {
        return  "[视频缩略图不存在]";
    }

    if (fs.existsSync(sourcePath)) {
        try {
            fs.copyFileSync(sourcePath, targetPath)
            obj.contentPath = targetPath
        }catch (e) {
            console.log(e,3,3)
        }
    } else {
        return "[视频不存在]";
    }
    return obj;
}

function processAudio(MesLocalID, time, tempAccount, name){
    const obj = {}
    const command = "sh " + './lib/silk-v3-decoder' + "/converter.sh " + documentPath + '/'+tempAccount + '/Audio/' + name+"/" +MesLocalID + ".aud mp3"
    console.log(command,1)
    const stdOut = require('child_process').execSync(command, {// child_process会调用sh命令，pc会调用cmd.exe命令
        encoding: "utf8"
    });
    if (stdOut.indexOf("[OK]") > 0) { // 存在OK,即转换成功
        const newPath = path.join(documentPath, tempAccount, 'Audio',name, MesLocalID+'.mp3')
        const targetPath = path.join(webAssectPath, 'Audio',time+'.mp3' )
        if (fs.existsSync(newPath)) {
            try {
                fs.copyFileSync(newPath, targetPath)
                obj.contentPath = targetPath
            }catch (e) {
                console.log(e,4)
            }
        } else {
            return "[视频不存在]";
        }
    }
    return obj;
}

module.exports = format