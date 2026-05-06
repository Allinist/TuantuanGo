# 数据模型草案

以下模型用于指导首期开发，字段可根据实际技术栈调整。

## 1. users

用户表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| openid | varchar | 微信 openid |
| unionid | varchar | 微信 unionid，可为空 |
| nickname | varchar | 昵称 |
| avatar_url | varchar | 头像 |
| role_flags | int | 角色标记，买家/团长/管理员 |
| ad_free_until | datetime | 免广告到期时间 |
| status | varchar | normal、blocked |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 2. categories

分类表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| name | varchar | 分类名，如出谷子/文创 |
| parent_id | bigint | 父分类 |
| sort_order | int | 排序 |
| status | varchar | enabled、disabled |

## 3. groups

团表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| leader_id | bigint | 团长用户 ID |
| category_id | bigint | 分类 ID |
| title | varchar | 团标题 |
| description | text | 团简介 |
| group_type | varchar | single、multi |
| status | varchar | draft、active、departed、closed、completed、cancelled |
| cover_image_url | varchar | 封面图 |
| payment_qr_url | varchar | 团长收款二维码 |
| auto_depart | boolean | 是否自动发车 |
| departed_at | datetime | 发车时间 |
| closed_at | datetime | 截团时间 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 4. group_departure_conditions

多人拼团发车条件表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| group_id | bigint | 团 ID |
| condition_type | varchar | required_product_confirmed、min_amount、min_buyers |
| product_id | bigint | 指定必须确认的商品，可为空 |
| required_quantity | int | 要求数量 |
| required_amount | decimal | 要求金额 |
| status | varchar | active、disabled |

## 5. sale_rules

销售规则表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| group_id | bigint | 团 ID |
| rule_type | varchar | direct、bundle、optional |
| name | varchar | 规则名称 |
| shipping_mode | varchar | free、fixed、threshold |
| shipping_fee | decimal | 邮费 |
| free_shipping_threshold | decimal | 包邮门槛 |
| packing_fee | decimal | 打包费 |
| material_fee | decimal | 物料费 |
| tip_fee | decimal | 小费 |
| status | varchar | active、disabled |

rule_type 后续建议扩展：

- package_direct：打包直出。
- bundle_main：捆出主商品。
- bundle_item：被捆商品。
- group_buy：直接团购。
- direct：普通直出。
- optional：普通自选。

## 6. product_import_batches

批量上架批次表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| group_id | bigint | 团 ID |
| leader_id | bigint | 团长 ID |
| source | varchar | manual、template_import |
| product_count | int | 商品数量 |
| status | varchar | draft、validated、published、failed |
| validation_errors | json | 校验错误 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 7. bundle_rules

捆出规则表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| sale_rule_id | bigint | 销售规则 ID |
| main_product_id | bigint | 主商品 ID |
| bundle_mode | varchar | min_amount、fixed_items |
| required_bundle_amount | decimal | 指定捆金额 |
| status | varchar | active、disabled |

## 8. bundle_rule_items

固定捆物品或可选被捆商品表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| bundle_rule_id | bigint | 捆出规则 ID |
| product_id | bigint | 被捆商品 ID |
| item_type | varchar | selectable、fixed |
| fixed_quantity | int | 固定数量 |
| sort_order | int | 排序 |

## 9. products

商品表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| group_id | bigint | 团 ID |
| sale_rule_id | bigint | 销售规则 ID |
| import_batch_id | bigint | 批量上架批次 ID，可为空 |
| product_mode | varchar | package_direct、bundle_main、bundle_item、group_buy、direct、optional |
| name | varchar | 商品名称 |
| description | text | 简介 |
| price | decimal | 定价 |
| image_url | varchar | 主图 |
| unit_label_mode | varchar | none、optional、required |
| available_stock | int | 可售库存 |
| reserved_stock | int | 待审核占用库存 |
| sold_stock | int | 已售库存 |
| status | varchar | active、inactive、sold_out |
| sort_order | int | 排序 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 10. product_units

同款商品编号库存表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| product_id | bigint | 商品 ID |
| unit_code | varchar | 编号标记，如 A1、B2、瑕疵 03 |
| description | text | 编号说明，可为空 |
| image_url | varchar | 编号对应图片，可为空 |
| status | varchar | available、reserved、sold、disabled |
| reserved_order_id | bigint | 预占订单 ID，可为空 |
| sold_order_id | bigint | 售出订单 ID，可为空 |
| sort_order | int | 排序 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 11. sale_combinations

销售组合表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| group_id | bigint | 团 ID |
| sale_rule_id | bigint | 销售规则 ID |
| combination_type | varchar | package_direct、bundle、group_buy、direct、optional |
| title | varchar | 组合标题 |
| description | text | 组合说明 |
| price | decimal | 组合价格，可为空 |
| display_stock | int | 展示库存 |
| reserved_stock | int | 组合预占库存 |
| sold_stock | int | 组合售出库存 |
| min_purchase_qty | int | 最小购买数量 |
| max_purchase_qty | int | 最大购买数量 |
| status | varchar | draft、active、inactive、sold_out |
| sort_order | int | 排序 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 12. sale_combination_items

销售组合明细表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| combination_id | bigint | 销售组合 ID |
| product_id | bigint | 商品 ID |
| item_role | varchar | package_item、main、bundle_item、group_item、direct_item、optional_item |
| required_quantity | int | 每份组合需要数量 |
| price_snapshot | decimal | 组合内价格快照 |
| is_required | boolean | 是否必选 |
| sort_order | int | 排序 |

## 13. carts

购物车表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| user_id | bigint | 买家 ID |
| group_id | bigint | 团 ID |
| status | varchar | active、ordered、abandoned |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 14. cart_items

购物车明细。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| cart_id | bigint | 购物车 ID |
| sale_combination_id | bigint | 销售组合 ID，可为空 |
| product_id | bigint | 商品 ID |
| product_unit_id | bigint | 指定编号库存 ID，可为空 |
| product_unit_code_snapshot | varchar | 编号标记快照，可为空 |
| sale_rule_id | bigint | 销售规则 ID |
| bundle_rule_id | bigint | 捆出规则 ID，可为空 |
| parent_cart_item_id | bigint | 捆出被捆商品关联主商品，可为空 |
| quantity | int | 数量 |
| unit_price_snapshot | decimal | 加购时单价快照 |
| created_at | datetime | 创建时间 |

## 15. orders

订单表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| order_no | varchar | 订单号 |
| user_id | bigint | 买家 ID |
| leader_id | bigint | 团长 ID |
| group_id | bigint | 团 ID |
| status | varchar | pending_payment、pending_review、confirmed、rejected、shipped、completed、transferred、cancelled |
| product_amount | decimal | 商品金额 |
| shipping_fee | decimal | 邮费 |
| packing_fee | decimal | 打包费 |
| material_fee | decimal | 物料费 |
| tip_fee | decimal | 小费 |
| total_amount | decimal | 总金额 |
| payment_proof_url | varchar | 支付截图 |
| shipment_status | varchar | pending、not_required、shipped、signed |
| shipment_id | bigint | 普通发货记录 ID，可为空 |
| shipment_merge_id | bigint | 合并发货记录 ID，可为空 |
| buyer_remark | text | 买家备注 |
| leader_review_remark | text | 团长审核备注 |
| confirmed_at | datetime | 确认时间 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 16. order_items

订单明细。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| order_id | bigint | 订单 ID |
| sale_combination_id | bigint | 销售组合 ID，可为空 |
| product_id | bigint | 商品 ID |
| product_unit_id | bigint | 指定编号库存 ID，可为空 |
| product_unit_code_snapshot | varchar | 编号标记快照，可为空 |
| sale_rule_id | bigint | 销售规则 ID |
| bundle_rule_id | bigint | 捆出规则 ID，可为空 |
| parent_order_item_id | bigint | 捆出被捆商品关联主商品，可为空 |
| product_name_snapshot | varchar | 商品名快照 |
| unit_price_snapshot | decimal | 单价快照 |
| quantity | int | 数量 |
| subtotal | decimal | 小计 |

## 17. inventory_logs

库存流水表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| product_id | bigint | 商品 ID |
| order_id | bigint | 订单 ID，可为空 |
| change_type | varchar | reserve、confirm、release、adjust |
| available_delta | int | 可售库存变化 |
| reserved_delta | int | 预占库存变化 |
| sold_delta | int | 已售库存变化 |
| operator_id | bigint | 操作人 |
| remark | text | 备注 |
| created_at | datetime | 创建时间 |

## 18. shipments

发货记录表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| leader_id | bigint | 团长 ID |
| user_id | bigint | 买家 ID |
| shipment_type | varchar | single_order、merge |
| order_id | bigint | 单订单 ID，可为空 |
| shipment_merge_id | bigint | 合并发货 ID，可为空 |
| logistics_company | varchar | 物流公司，可为空 |
| tracking_no | varchar | 物流单号，可为空 |
| no_logistics_reason | varchar | 无需物流原因，可为空 |
| status | varchar | pending、shipped、signed、cancelled |
| shipped_at | datetime | 发货时间 |
| signed_at | datetime | 签收时间 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 19. shipment_tracking_events

物流轨迹表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| shipment_id | bigint | 发货记录 ID |
| event_time | datetime | 轨迹时间 |
| event_status | varchar | 轨迹状态 |
| event_text | text | 轨迹描述 |
| source | varchar | manual、provider |
| created_at | datetime | 创建时间 |

## 20. shipment_merges

合并发货表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| user_id | bigint | 买家 ID |
| leader_id | bigint | 团长 ID |
| status | varchar | requested、approved、rejected、shipped |
| shipment_id | bigint | 发货记录 ID，可为空 |
| remark | text | 备注 |
| reject_reason | text | 驳回原因，可为空 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 21. shipment_merge_orders

合并发货订单关联表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| shipment_merge_id | bigint | 合并发货 ID |
| order_id | bigint | 订单 ID |

## 22. order_transfers

转单记录表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| order_id | bigint | 订单 ID |
| from_user_id | bigint | 原买家 |
| to_user_id | bigint | 接收买家，可为空 |
| to_contact | varchar | 外部接收人联系方式 |
| status | varchar | requested、accepted、rejected、completed |
| reject_reason | text | 驳回原因，可为空 |
| created_at | datetime | 创建时间 |
| completed_at | datetime | 完成时间 |

## 23. leader_reviews

团长评价表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| leader_id | bigint | 团长 ID |
| user_id | bigint | 评价买家 ID |
| order_id | bigint | 关联订单 ID |
| rating | int | 1 到 5 星 |
| content | text | 评价正文 |
| image_urls | json | 评价图片 |
| is_anonymous | boolean | 是否匿名展示 |
| moderation_status | varchar | pending、approved、rejected |
| moderation_reason | text | 审核原因，可为空 |
| reply_content | text | 团长回复，可为空 |
| reply_moderation_status | varchar | pending、approved、rejected，可为空 |
| status | varchar | active、hidden、deleted |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 24. leader_rating_stats

团长评分聚合表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| leader_id | bigint | 团长 ID |
| rating_avg | decimal | 平均评分 |
| rating_count | int | 评价数量 |
| five_star_count | int | 5 星数量 |
| updated_at | datetime | 更新时间 |

## 25. content_moderation_records

内容审核记录表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| target_type | varchar | review、review_reply、product、group |
| target_id | bigint | 目标 ID |
| content_type | varchar | text、image |
| content_snapshot | text | 审核内容快照 |
| status | varchar | pending、approved、rejected |
| provider | varchar | 审核服务商或 manual |
| reason | text | 审核原因 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 26. leader_blacklists

团长黑名单表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| leader_id | bigint | 团长 ID |
| user_id | bigint | 被拉黑用户 ID |
| reason | varchar | 原因分类 |
| remark | text | 内部备注 |
| source | varchar | manual、import、system |
| status | varchar | active、inactive |
| paid_feature_source | varchar | free、paid，可为空 |
| created_by | bigint | 操作人 ID |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

## 27. ads

广告表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| placement | varchar | splash、market_feed、group_detail、order_confirm |
| title | varchar | 广告标题 |
| media_url | varchar | 素材地址 |
| target_url | varchar | 跳转地址 |
| start_at | datetime | 开始时间 |
| end_at | datetime | 结束时间 |
| status | varchar | active、inactive |

## 28. 操作日志

关键操作建议记录日志：

- 团长创建、修改、关闭团。
- 团长批量上架商品和发布销售组合。
- 商品库存调整。
- 买家下单。
- 买家上传支付截图。
- 团长审核订单。
- 订单取消、驳回、确认。
- 合并发货和转单。
- 团长填写或修改物流单号。
- 买家提交评价、团长回复评价、评价审核。
- 团长添加或移除黑名单。
