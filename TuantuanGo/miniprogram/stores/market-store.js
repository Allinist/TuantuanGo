const { groups: initialGroups } = require("./mock-data");
const { getLeaderName } = require("./session-store");

const MARKET_GROUPS_KEY = "ttg_market_groups_v1";

function getMarketGroups() {
  const saved = wx.getStorageSync(MARKET_GROUPS_KEY);
  if (Array.isArray(saved) && saved.length) return saved;
  wx.setStorageSync(MARKET_GROUPS_KEY, initialGroups);
  return initialGroups;
}

function saveMarketGroups(groups) {
  wx.setStorageSync(MARKET_GROUPS_KEY, groups);
}

function getGroupById(groupId) {
  if (!groupId) return null;
  const groups = getMarketGroups();
  return groups.find((g) => g.id === groupId) || null;
}

function addPublishedGroup(payload) {
  const groups = getMarketGroups();
  const leaderName = getLeaderName();
  const now = Date.now();
  const group = {
    id: `g_${now}`,
    title: payload.title || `新团 ${new Date(now).toLocaleDateString()}`,
    coverImage: payload.coverImage || "https://dummyimage.com/200x200/ffd8ce/8c1900&text=NEW",
    leaderName,
    category: payload.category || "谷子",
    groupType: payload.groupType || "multi",
    status: "active",
    saleRuleType: payload.saleRuleType || "direct",
    minPrice: Number(payload.minPrice || 0),
    stock: Number(payload.stock || 0),
    shippingFee: 8,
    freeShippingThreshold: 0,
    packingFee: 0,
    materialFee: 0,
    tipFee: 0,
    departureCondition: payload.departureCondition || "待团长配置",
    paymentQrHint: "团长收款二维码固定展示"
  };
  group.bundleRequiredAmount = Number(payload.bundleRequiredAmount || 0);
  group.products = Array.isArray(payload.products) ? payload.products : [];
  const next = [group, ...groups];
  saveMarketGroups(next);
  return group;
}

function updatePublishedGroup(groupId, payload) {
  const groups = getMarketGroups();
  const next = groups.map((group) => {
    if (group.id !== groupId) return group;
    return {
      ...group,
      title: payload.title || group.title,
      category: payload.category || group.category,
      minPrice: Number(payload.minPrice || group.minPrice || 0),
      stock: Number(payload.stock || group.stock || 0),
      saleRuleType: payload.saleRuleType || group.saleRuleType,
      groupType: payload.groupType || group.groupType,
      coverImage: payload.coverImage || group.coverImage,
      products: Array.isArray(payload.products) ? payload.products : (group.products || []),
      bundleRequiredAmount: Number(payload.bundleRequiredAmount || group.bundleRequiredAmount || 0),
      departureCondition: payload.departureCondition || group.departureCondition
    };
  });
  saveMarketGroups(next);
  return next.find((g) => g.id === groupId) || null;
}

module.exports = {
  getMarketGroups,
  addPublishedGroup,
  getGroupById,
  updatePublishedGroup
};
