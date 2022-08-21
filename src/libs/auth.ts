/**
 * 权限中间件
 *
 * 核验传入的token（若有）
 * 获取相应用户信息并写入ctx.state的user键
 */
import jwt from 'jsonwebtoken'
import { coverPassword } from '../utils'

type Token = String

interface Payload {
  userId: number
}

/**
 * 寻找
 */
const find = (req): Token => {
  // 从请求头中获取authorization头
  const auth_in_header = req.get('authorization')
  // console.log('auth_in_header: ', auth_in_header)

  if (!auth_in_header) return ''

  // 从header中获取jwt，源格式为“Bearer jwt内容”
  const token = auth_in_header.split(' ')[1] ?? ''

  return token
}

/**
 * 验证
 */
const verify = (token: Token, ctx): Payload => {
  // console.log('verify: ', token)

  // 尝试解析并验证JWT
  let payload
  try {
    payload = jwt.verify(token, process.env.TOKEN_KEY_PRIVATE)
  } catch (error) {
    console.log(error)
    ctx.throw(500, 'Not authenticated: failed verifing token')
  }

  // 若JWT无效
  if (!payload) ctx.throw(401, 'Not authenticated: invalid token')

  // console.log(payload)
  return payload
}

/**
 * 签发
 * @param payload
 */
const issue = (payload) => {
  // console.log('issue: ', payload)

  const validPeriod: number = +(process.env.TOKEN_EXPIRES ?? 3600) // 有效时长
  const expiresAt = Math.round(Date.now() / 1000) + validPeriod // 过期时间
  console.log(validPeriod, expiresAt)

  let token: Token = ''
  try {
    token = jwt.sign(payload, process.env.TOKEN_KEY_PRIVATE, {
      expiresIn: validPeriod
    })
  } catch (error) {
    console.error(error)
    throw new Error('token签发失败')
  }

  // console.log(result)
  return { token, expiresAt }
}

const main = async (ctx, next) => {
  // 查找请求头中的token
  const token = find(ctx.request)
  // console.log(`token: ${token}`)
  if (!token) return await next()

  // 验签
  const payload = verify(token, ctx)
  // console.log('payload: ', payload)

  // 获取用户数据
  let user
  try {
    user = await ctx.db.user.findUnique({
      where: {
        id: payload.userId
      }
    }).then(data => {
      data.password = coverPassword(data.password)
      return data
    })
  } catch (error) {
    ctx.throw(401, '用户不存在')
  }

  if (!user?.id) {
    ctx.throw(401, '用户不存在')
  }

  // 将用户数据写入全局状态
  // console.log('authed user: ', user)
  ctx.state.user = user

  await next()
}

export { issue }

export default main
