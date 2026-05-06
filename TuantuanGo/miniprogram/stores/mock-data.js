const groups = [
  {
    id: "g1",
    title: "初音未来 15周年限定周边团",
    leaderName: "Miku仓",
    category: "出谷子/文创",
    groupType: "multi",
    status: "active",
    saleRuleType: "optional",
    minPrice: 29,
    stock: 42,
    shippingFee: 8,
    freeShippingThreshold: 199,
    packingFee: 2,
    materialFee: 1,
    tipFee: 0,
    departureCondition: "A 商品 + B 商品均确认至少 1 件后发车",
    paymentQrHint: "团长收款二维码固定展示"
  }
];

const productsByGroupId = {
  g1: [
    { id: "p1", groupId: "g1", name: "亚克力立牌 A1", price: 79, stock: 12, mode: "optional", unitCode: "A1" },
    { id: "p2", groupId: "g1", name: "吧唧套组 B2", price: 45, stock: 18, mode: "optional", unitCode: "B2" },
    { id: "p3", groupId: "g1", name: "挂件盲袋 C3", price: 29, stock: 30, mode: "optional", unitCode: "C3" }
  ]
};

module.exports = {
  groups,
  productsByGroupId
};
