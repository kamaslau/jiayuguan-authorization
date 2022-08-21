// local
import * as mysql from './mysql'

// 关系型数据库引擎；默认MySQL
export const RDBs = { mysql }
export const RDB = RDBs[process.env.RDB_ENGINE ?? 'mysql'] // 默认使用MySQL数据库
