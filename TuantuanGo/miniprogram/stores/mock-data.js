const groups = [
  {
    id: "g1",
    title: "初音未来 15周年限定周边团",
    coverImage: "https://dummyimage.com/200x200/ffd8ce/8c1900&text=Miku",
    leaderName: "Miku仓",
    category: "谷子",
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
  },
  {
    id: "g2",
    title: "吉卜力胶片徽章直出团",
    coverImage: "https://dummyimage.com/200x200/d7f7ef/006b59&text=Ghibli",
    leaderName: "Ghibli屋",
    category: "谷子",
    groupType: "single",
    status: "active",
    saleRuleType: "direct",
    minPrice: 39,
    stock: 26,
    shippingFee: 10,
    freeShippingThreshold: 0,
    packingFee: 1,
    materialFee: 0,
    tipFee: 0,
    departureCondition: "单人团，下单即参与",
    paymentQrHint: "团长收款二维码固定展示"
  },
  {
    id: "g3",
    title: "TCG 卡包捆出团（指定捆50）",
    coverImage: "https://dummyimage.com/200x200/ffe8c8/8a4f00&text=TCG",
    leaderName: "Komorebi收藏室",
    category: "文创",
    groupType: "multi",
    status: "active",
    saleRuleType: "bundle_min_amount",
    minPrice: 120,
    stock: 18,
    shippingFee: 8,
    freeShippingThreshold: 299,
    packingFee: 2,
    materialFee: 1,
    tipFee: 0,
    departureCondition: "主卡包确认满 10 件发车",
    paymentQrHint: "团长收款二维码固定展示",
    bundleRequiredAmount: 50,
    bundleMainProductId: "p31",
    progressPercent: 75
  },
  {
    id: "g4",
    title: "排球少年吧唧固定捆团",
    coverImage: "https://dummyimage.com/200x200/ffe1ea/7a1b45&text=Haikyu",
    leaderName: "乌野补给站",
    category: "文创",
    groupType: "multi",
    status: "active",
    saleRuleType: "group_buy",
    minPrice: 88,
    stock: 22,
    shippingFee: 6,
    freeShippingThreshold: 188,
    packingFee: 2,
    materialFee: 1,
    tipFee: 0,
    departureCondition: "主商品确认满 8 件发车",
    paymentQrHint: "团长收款二维码固定展示",
    bundleMainProductId: "p41",
    progressPercent: 40
  }
];

const productsByGroupId = {
  g1: [
    { id: "p1", groupId: "g1", name: "亚克力立牌 A1", price: 79, stock: 12, mode: "optional", unitCode: "A1", presaleDate: "2026-06-20" },
    { id: "p2", groupId: "g1", name: "吧唧套组 B2", price: 45, stock: 18, mode: "optional", unitCode: "B2", presaleDate: "" },
    { id: "p3", groupId: "g1", name: "挂件盲袋 C3", price: 29, stock: 30, mode: "optional", unitCode: "C3", presaleDate: "2026-06-25" }
  ],
  g2: [
    { id: "p21", groupId: "g2", name: "胶片徽章 A组", price: 39, stock: 8, mode: "direct", unitCode: "A组", presaleDate: "" },
    { id: "p22", groupId: "g2", name: "胶片徽章 B组", price: 49, stock: 10, mode: "direct", unitCode: "B组", presaleDate: "2026-06-18" }
  ],
  g3: [
    { id: "p31", groupId: "g3", name: "主商品：TCG 补充包", price: 120, stock: 18, mode: "bundle_main", unitCode: "MAIN", presaleDate: "" },
    { id: "p32", groupId: "g3", name: "被捆：卡套组合", price: 28, stock: 20, mode: "bundle_item", unitCode: "B-01", presaleDate: "" },
    { id: "p33", groupId: "g3", name: "被捆：分隔页组合", price: 24, stock: 16, mode: "bundle_item", unitCode: "B-02", presaleDate: "" },
    { id: "p34", groupId: "g3", name: "被捆：卡盒组合", price: 32, stock: 14, mode: "bundle_item", unitCode: "B-03", presaleDate: "" }
  ],
  g4: [
    { id: "p41", groupId: "g4", name: "主商品：日向翔阳吧唧套组", price: 88, stock: 22, mode: "bundle_main", unitCode: "M-01", presaleDate: "" },
    { id: "p42", groupId: "g4", name: "固定捆：应援贴纸包", price: 18, stock: 40, mode: "bundle_fixed", unitCode: "F-01", fixedQty: 1, presaleDate: "" },
    { id: "p43", groupId: "g4", name: "固定捆：收藏卡保护袋", price: 12, stock: 30, mode: "bundle_fixed", unitCode: "F-02", fixedQty: 1, presaleDate: "" }
  ]
};

module.exports = {
  groups,
  productsByGroupId
};
