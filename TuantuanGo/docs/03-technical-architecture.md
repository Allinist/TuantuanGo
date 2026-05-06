# 技术架构设计

## 1. 平台选择

首发平台为微信小程序。

推荐架构：

- 前端：微信小程序原生或 Taro/uni-app。
- 服务端：Node.js/NestJS、Java/Spring Boot 或 Go 均可。
- 数据库：MySQL 或 PostgreSQL。
- 缓存与锁：Redis，用于库存锁、订单幂等、热点数据。
- 对象存储：腾讯云 COS 或其他 S3 兼容存储，用于商品图、支付截图、收款二维码。
- 云函数方案：若首期团队较小，可使用微信云开发快速起步。

若希望后续扩展复杂订单、广告、支付、风控，建议使用独立服务端，而不是完全依赖云开发。

## 2. 系统模块

### 2.1 小程序前端

模块：

- 主页 tab 容器。
- 市场首页。
- 分类和搜索。
- 团详情。
- 商品选择。
- 购物车。
- 确认订单和支付截图上传。
- 我的订单。
- 订单物流追踪。
- 合并发货申请。
- 转单申请和接收确认。
- 团长评分与评价。
- 团长工作台。
- 团长开团表单。
- 团长批量商品上架。
- 团长销售组合配置。
- 团长订单审核。
- 团长发货管理。
- 黑名单管理。

主页 tab 容器负责底部导航、登录态入口和角色入口分发：

- tab 顺序固定为：市场、购物车、订单、设置。
- “购物车”和“订单”之间放置中间加号按钮。
- 中间加号不参与 tab 选中态，点击后根据用户角色跳转。
- 买家或未授权团长用户：跳转至团长身份申请/说明页。
- 已授权团长用户：跳转至团长开团表单，支持继续上架商品和配置团规则。
- tab 页面之间应保留各自滚动位置；加号跳转返回后应回到原 tab。

### 2.2 服务端 API

模块：

- 用户与微信登录。
- 团管理。
- 商品管理。
- 销售规则管理。
- 销售组合管理。
- 购物车管理。
- 订单管理。
- 库存管理。
- 物流管理。
- 合并发货管理。
- 转单管理。
- 评价与评分管理。
- 内容审核。
- 黑名单管理。
- 文件上传。
- 广告配置。
- 付费免广告。

### 2.3 后台管理

首期可不做独立后台，但建议预留管理接口。

后台能力：

- 分类管理。
- 违规团下架。
- 用户封禁。
- 广告位配置。
- 投诉处理。
- 评价审核复核。
- 黑名单申诉处理。
- 数据统计。

## 3. 推荐目录结构

如果使用小程序原生 + Node.js 服务端，建议：

```text
TuantuanGo/
  docs/
  miniprogram/
    pages/
      tabs/
        market/
        cart/
        orders/
        settings/
      market/
      group-detail/
      product-select/
      cart/
      order-confirm/
      my-orders/
      order-logistics/
      shipment-merge/
      order-transfer/
      leader-review/
      leader-apply/
      leader-dashboard/
      leader-group-edit/
      leader-product-bulk-edit/
      leader-sale-combinations/
      leader-order-review/
      leader-shipping/
      blacklist/
    components/
    services/
    stores/
    utils/
  server/
    src/
      modules/
        auth/
        users/
        groups/
        products/
        sale-rules/
        sale-combinations/
        carts/
        orders/
        inventory/
        shipments/
        transfers/
        reviews/
        moderation/
        blacklists/
        uploads/
        ads/
      common/
      config/
    migrations/
    tests/
```

## 4. API 设计草案

### 4.1 市场

```http
GET /api/market/groups
```

查询参数：

- keyword
- categoryId
- saleRuleType
- groupType
- status
- minPrice
- maxPrice
- freeShipping
- page
- pageSize

### 4.2 团详情

```http
GET /api/groups/:groupId
```

返回团基础信息、团长信息、销售规则摘要、商品入口、收款二维码展示信息。

### 4.3 商品选择

```http
GET /api/groups/:groupId/products
```

查询参数：

- saleRuleId
- productRole：main、bundle、normal

### 4.4 团长商品批量上架与销售组合

```http
POST /api/leader/groups/:groupId/products/bulk
GET /api/leader/groups/:groupId/products
POST /api/leader/groups/:groupId/sale-combinations/generate
PATCH /api/leader/sale-combinations/:combinationId
POST /api/leader/sale-combinations/:combinationId/publish
```

批量上架接口接收 N 款商品及其库存，服务端应校验商品必填字段、库存数量、同款编号库存数量和图片资源归属。

销售组合生成接口根据商品模式生成组合草稿：

- package_direct：打包直出组合。
- bundle_main：捆出主商品组合。
- bundle_item：被捆商品池。
- group_buy：直接团购组合。
- direct：普通直出商品。
- optional：普通自选商品池。

组合发布时必须校验组合库存不超过组合内商品可售库存，并写入组合和组合明细。

### 4.5 购物车

```http
GET /api/carts/current?groupId=:groupId
POST /api/carts/items
PATCH /api/carts/items/:itemId
DELETE /api/carts/items/:itemId
```

### 4.6 下单

```http
POST /api/orders
```

服务端必须完成：

- 校验购物车归属。
- 校验销售规则。
- 校验销售组合。
- 校验库存。
- 使用事务锁定库存。
- 扣减 available_stock。
- 增加 reserved_stock。
- 创建订单和订单明细。

### 4.7 上传支付截图

```http
POST /api/orders/:orderId/payment-proof
```

上传成功后订单进入 pending_review。

### 4.8 团长审核

```http
POST /api/leader/orders/:orderId/approve
POST /api/leader/orders/:orderId/reject
```

通过时将 reserved_stock 转为 sold_stock。驳回时释放库存。

### 4.9 物流与合并发货

```http
GET /api/orders/:orderId/logistics
POST /api/leader/orders/:orderId/shipment
POST /api/shipment-merges
GET /api/shipment-merges/:mergeId
POST /api/leader/shipment-merges/:mergeId/approve
POST /api/leader/shipment-merges/:mergeId/reject
POST /api/leader/shipment-merges/:mergeId/shipment
```

物流信息支持单订单发货和合并发货。合并发货通过后，关联订单共享合并发货记录和物流轨迹。

### 4.10 转单

```http
POST /api/orders/:orderId/transfers
POST /api/order-transfers/:transferId/accept
POST /api/order-transfers/:transferId/reject
GET /api/orders/:orderId/transfers
```

转单接口必须校验订单状态、接收人黑名单状态和订单归属，不覆盖原始买家历史。

### 4.11 评价、内容审核与黑名单

```http
POST /api/orders/:orderId/review
GET /api/leaders/:leaderId/reviews
POST /api/leader/reviews/:reviewId/reply
GET /api/leaders/:leaderId/rating-summary
POST /api/moderation/content
GET /api/leader/blacklists
POST /api/leader/blacklists
DELETE /api/leader/blacklists/:blacklistId
```

评价提交前必须校验购买关系和订单状态。评价文本、图片、团长回复进入内容审核，审核通过后才公开展示。

## 5. 库存并发设计

库存是高风险模块，必须由服务端事务控制。

建议方案：

- 每次下单开启数据库事务。
- 查询商品库存时使用行级锁。
- 校验所有商品库存是否满足。
- 若订单指定同款商品编号，应同时锁定对应编号库存。
- 若订单来自销售组合，应展开组合明细后锁定每个实际商品库存。
- 全部满足才写入订单和库存流水。
- 任一商品不足则回滚事务并返回不足列表。

伪代码：

```text
begin transaction
  cart_items = get cart items
  required_items = expand sale rules from cart_items
  required_items = expand sale combinations from cart_items
  sorted_items = greedy_sort(required_items)
  locked_products = select products for update
  locked_product_units = select product units for update when item codes are selected
  if any available_stock < required_quantity:
    rollback
    return insufficient_items
  if any selected unit is sold or reserved:
    rollback
    return unavailable_unit_codes
  if any sale combination stock is insufficient:
    rollback
    return insufficient_combination
  update product stocks
  update product unit statuses
  update sale combination stock snapshots
  create order
  create order items
  create inventory logs
commit
```

## 6. 文件上传

文件类型：

- 商品图片。
- 团长收款二维码。
- 买家支付截图。
- 评价图片。

建议限制：

- 图片格式：jpg、jpeg、png、webp。
- 单图大小：建议不超过 5 MB。
- 支付截图保留原图，另生成压缩预览图。
- 私密图片不要公开访问，应通过带权限的临时 URL 访问。

## 7. 广告与付费架构预留

广告表应支持：

- 广告位。
- 展示平台。
- 图片/视频素材。
- 跳转链接。
- 开始和结束时间。
- 展示频控。

免广告权益应支持：

- 用户权益开始时间。
- 用户权益结束时间。
- 权益来源：购买、活动、管理员赠送。

前端展示广告前调用：

```http
GET /api/ads/placements?scene=market_feed
GET /api/users/me/ad-entitlement
```

若用户拥有有效免广告权益，则不展示广告。

## 8. 安全与风控

建议首期加入：

- 微信登录态校验。
- 团长接口鉴权。
- 文件上传类型校验。
- 支付截图访问权限校验。
- 订单状态机校验。
- 物流单号归属校验。
- 评价购买资格校验。
- 黑名单下单和转单限制。
- 违禁内容审核。
- 操作日志。
- 简单限流，防止刷接口。

后续可加入：

- 投诉举报。
- 团长评级。
- 黑名单。
- 敏感词审核。
- 图片内容审核。
