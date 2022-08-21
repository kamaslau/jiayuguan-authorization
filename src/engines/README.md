# README.md

此目录下，存放基于不同数据库引擎的业务查询实现，并通过 `[引擎名称]/index.ts` 文件作为模块/服务端点。

例如，对于 mysql/mariadb/pg 等关系型数据库的增删改查，应放入 mysql/mariadb/pg 目录下，并在 `mysql/index.ts` 文件中 export 出足敷使用的业务属性/端口，包括但不限于 `modelName`（模型/表名称）、`pkName`（即主键 ID 名称）、`allowedSorters`（可用排序项的键名）、`queries`（GraphQL Query 声明）、`mutations`（GraphQL Mutation 声明）等。

从模块角度观察，各目录下的 index.ts 文件所暴露的接口应当在出入参角度下为幂等的。

初步规划需具备基础可用性的引擎：

- 图数据库
  - DGraph
- 关系型数据库
  - MySQL
- 文档型数据库
  - MongoDB

时序型数据库暂不考虑。
