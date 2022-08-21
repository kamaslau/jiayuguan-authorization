/**
 * PrismaClient
 *
 * https://www.prisma.io/docs
 * https://www.prisma.io/docs/concepts/components/prisma-client/crud
 * https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting
 */
import { PrismaClient } from '@prisma/client' // ORM for RDBs

let dbClient

// 建立连接
const connect = async (): Promise<any> => {
  try {
    dbClient = new PrismaClient()
  } catch (error) {
    console.error(error)
    dbClient = null
  }

  // console.log('mysql engine initiated')
  return dbClient
}

// 断开连接
const disconnect = async (): Promise<void> => {
  try {
    await dbClient.$disconnect()
  } catch (error) {
    console.error(error)
  }
}

/**
  * 基础模型类
  */

/**
  * 默认分页参数
  */
const defaultLimit = 30
const defaultOffset = 0

// 默认可排序字段
const defaultSorter = { time_created: 'desc' }

/**
  * 生成排序规则
  *
  * 根据传入的ctx.query.sorter参数结合可排序字段生成，或使用默认可排序字段
  *
  * @param sorterInput {time_created:"desc", ...}
  * @param allowedSorter
  * @returns
  */
const composeSorter = (
  sorterInput: any,
  allowedSorter: string[] = []
): any => {
  // console.log('composeSorter: ', sorterInput, allowedSorter)
  const result = {}

  // 可排序字段名
  const allowedSorters = allowedSorter ?? Object.keys(defaultSorter)
  // console.log('allowedSorters:', allowedSorters)

  // 生成最终排序规则
  const sorters = Object.keys(sorterInput)
  if (sorters.length > 0) {
    // 使用传入的排序规则进行排序
    // console.log('compose custom sorter')

    sorters.forEach(item => {
      allowedSorters.includes(item) && (result[item] = sorterInput[item])
    })
  } else {
    // 使用默认的排序规则进行排序
    // console.log('compose default sorter')

    Object.keys(defaultSorter).forEach(item => {
      result[item] = defaultSorter[item]
    })
  }

  // console.log('result: ', result)
  return result ?? {}
}

/**
 * 生成筛选规则
 *
 * https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#filter-conditions-and-operators
 *
 * @param filterInput {nickname:"abc", ...}
 * @param allowedFilter
 * @returns
 */
const composeFilter = (
  filterInput: any,
  allowedFilter: any
): any => {
  // console.log('composeFilter: ', filterInput, allowedFilter)

  const result = {}

  Object.keys(allowedFilter)?.forEach(item => {
    result[item] = filterInput[item] ? allowedFilter[item](filterInput[item]) : undefined
  })

  // console.log('result: ', result)
  return result
}

/**
 * 解析数值型筛选器
 *
 * @param value "操作符|参照值"，例如"gte|1653340079100"
 * @param value number|date
 * @returns
 */
const composeFilterNumeric = (value: string, type: string = 'number'): any => {
  // console.log('composeFilterNumeric: ', value, type)

  // 解析传入的筛选器值为操作符、参照值
  const op = value.split('|')[0]
  let needle: string|Date = value.split('|')[1]
  switch (type) {
    case 'date':
      needle = new Date(parseInt(needle))
      break

    default:
      break
  }
  // console.log('got params: ', op, needle)

  return op === 'equal' ? needle : { [op]: needle }
}

class BasicModel {
  constructor (
    modelName,
    ctx,
    limit = defaultLimit,
    offset = defaultOffset
  ) {
    this.modelName = modelName
    this.ctx = ctx
    this.limit = limit
    this.offset = offset
  }

  modelName: string = ''
  ctx: any = null
  limit: number
  offset: number

  /**
    * Get Count
    *
    * https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#count
    */
  count = async (filter = undefined): Promise<number> => {
    console.log('BasicModel.count: ', filter)

    let result = 0

    result = await this.ctx.db[this.modelName].count({
      where: filter
    })

    //  console.log('count result: ', result)
    return result
  }

  /**
    * Get List
    *
    * https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#findmany
    */
  findMany = async (
    filter: object | undefined = undefined,
    sorter: object | undefined = undefined,
    skip: number = this.offset,
    take: number = this.limit
  ): Promise<object[]> => {
    console.log('BasicModel.findMany: ', filter, sorter, skip, take)

    let result = []

    result = await this.ctx.db[this.modelName].findMany({
      where: filter,
      orderBy: sorter,
      skip,
      take
    })

    //  console.log('findMany result: ', result)
    return result
  }

  /**
    * Get Sole - By Unique Index
    *
    * 根据ID、unique键查找 https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#findunique
    */
  findUnique = async (name: string, value: string): Promise<null | object> => {
    console.log('BasicModel.findUnique: ', name, value)

    let result = null

    result = await this.ctx.db[this.modelName].findUnique({
      where: { [name]: +value }
    })

    //  console.log('findUnique result: ', result)
    return result
  }

  /**
    * Get Sole - Pick First Matched
    *
    * 根据满足条件的首项 https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#findfirst
    */
  findFirst = async (name: string, value: string): Promise<null | object> => {
    console.log('BasicModel.findFirst: ', name, value)

    let result = null

    result = await this.ctx.db[this.modelName].findFirst({
      where: { [name]: value }
    })

    //  console.log('findFirst result: ', result)
    return result
  }

  /**
    * Create One
    *
    * https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#create
    */
  create = async (data: object): Promise<null | object> => {
    console.log('BasicModel.create: ', data)

    let result = null

    try {
      result = await this.ctx.db[this.modelName].create({ data })
    } catch (error) {
      console.error(error)
    }

    //  console.log('create result: ', result)
    return result
  }

  /**
    * Create Many
    *
    * https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#createmany
    */
  createMany = async (data: any[]): Promise<null | { count: number }> => {
    console.log('BasicModel.createMany: ')

    let result = null

    try {
      result = await this.ctx.db[this.modelName].createMany(
        {
          data
        }
      )
    } catch (error) {
      console.error(error)
    }

    //  console.log('createMany result: ', result)
    return result
  }

  /**
    * Update one
    *
    * https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#update
    */
  update = async (
    data: object,
    filter: object | undefined = undefined
  ): Promise<null | object> => {
    console.log('BasicModel.update: ', data, filter)

    let result = null

    try {
      result = await this.ctx.db[this.modelName].update({
        where: filter,
        data
      })
    } catch (error) {
      console.error(error)
    }

    //  console.log('update result: ', result)
    return result
  }

  /**
    * Update Many
    *
    * https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#updatemany
    */
  updateMany = async (
    data: any[],
    filter: object | undefined = undefined
  ): Promise<null | { count: number }> => {
    console.log('BasicModel.updateMany: ', data, filter)

    let result = null

    try {
      result = await this.ctx.db[this.modelName].updateMany(
        {
          where: filter,
          data
        }
      )
    } catch (error) {
      console.error(error)
    }

    //  console.log('updateMany result: ', result)
    return result
  }

  /**
    * Delete One
    *
    * 删除行为仅标记数据项为已删除状态，不进行逻辑/物理删除
    *
    * https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#deletemany
    */
  delete = async (
    filter: object | undefined = undefined
  ): Promise<null | object> => {
    console.log('BasicModel.delete: ', filter)

    let result = null

    try {
      result = await this.ctx.db[this.modelName].delete({
        where: filter
      })
    } catch (error) {
      console.error(error)
    }

    //  console.log('delete result: ', result)
    return result
  }

  /**
    * Delete Many
    *
    * 删除行为仅标记数据项为已删除状态，不进行逻辑/物理删除
    *
    * https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#deletemany
    */
  deleteMany = async (
    filter: object | undefined = undefined
  ): Promise<null | { count: number }> => {
    console.log('BasicModel.deleteMany: ', filter)

    let result = null

    try {
      result = await this.ctx.db[this.modelName].deleteMany({
        where: filter
      })
    } catch (error) {
      console.error(error)
    }

    //  console.log('deleteMany result: ', result)
    return result
  }
}

export {
  connect,
  disconnect,
  defaultLimit,
  defaultOffset,
  defaultSorter,
  composeSorter,
  composeFilter,
  composeFilterNumeric,
  BasicModel
}
