// 云函数入口文件
const cloud = require('wx-server-sdk')

const TcbRouter = require('tcb-router');

const rp = require('request-promise')

const BASE_URL = 'http://musicapi.xiecheng.live'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event});

  app.router('playlist',async(ctx, next) => {
  //访问数据库，找到playlist集合，从event.start开始，到event.count的数据进行排序
  //排序方式是，排序字段createTime，逆序
  //ctx.body 用来接收返回值，返回给小程序端
  ctx.body =  await cloud.database().collection('playlist')
  .skip(event.start).limit(event.count)
  .orderBy('createTime','desc')
  .get()
  .then(res => {
    return res;
  })
  })

  app.router('musiclist', async(ctx, next) => {
    ctx.body = await rp(BASE_URL +  '/playlist/detail?id=' + parseInt(event.playlistId)).then(res => {
      return JSON.parse(res);
    })
  })
  app.router('musicUrl', async(ctx ,next) => {
    ctx.body = await rp(BASE_URL + `/song/url?id=${event.musicId}`).then(res => {
      return res;
    })
  })

  app.router('lyric',async(ctx, next) => {
    ctx.body = await rp(BASE_URL + `/lyric?id=${event.musicId}`).then(res => {
      return res
    })
  })

  return app.serve();
  
}