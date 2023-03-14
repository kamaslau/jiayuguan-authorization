// External
import 'dotenv/config' // 载入.env环境配置文件
import Koa from 'koa'
import Router from '@koa/router'

// Local
import { initDB, consoleInit, consoleStart, briefLog } from './utils'
import auth from './libs/auth' // 权限

// 输出程序初始化信息
// console.log('process.env: ', process.env)
consoleInit()

const isDev = process.env.NODE_ENV !== 'production'

// 创建Koa.js实例
const app = new Koa()

  // 挂载数据库引擎（若有）
  ; (async (): Promise<void> => {
    // 关系型数据库
    process.env.RDB_ENGINE && (app.context.db = await initDB('RDB'))
  })()

// 简易日志
app.use(briefLog)

// 兜底错误处理
app.on('error', (error, ctx): void => {
  console.error('server error: ', error)

  ctx.status = error.code ?? 501
  ctx.body = { content: error.message }
})

/**
 * RESTful
 */
const router = new Router()
router.post('/', (ctx, next) => {
  // TODO Implement actural logics
  ctx.status = 200
  ctx.body = { data: 'Ready to auth', figureURL: 'https://http.cat/200' }
})
app
  .use(router.routes())
  .use(router.allowedMethods())

// 兜底路由
app.use(async (ctx, next) => {
  ctx.status = 200
  ctx.body = { data: 'Hello, World!', figureURL: 'https://http.cat/200' }
})

// 启动服务
const serverPort = process.env.PORT ?? 3000
app.listen(serverPort);
// 输出业务启动信息
consoleStart()
