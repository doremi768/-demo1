// 云函数入口文件
const cloud = require('wx-server-sdk')

const TcbRouter = require('tcb-router')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})

  app.use(async (ctx, next) => {
    ctx.data = {};
    ctx.data.openId = event.userInfo.openId;
    await next();
  })
  //一个中间件，表示只用于music这个路由
  app.router('music', async(ctx, next)=>{
    ctx.data.musicName = ''
  }, async (ctx, next)=>{
    ctx.data.musicType = ''
  })

  //将服务返回
  return app.serve()
}