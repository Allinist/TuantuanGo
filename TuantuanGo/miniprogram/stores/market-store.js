const { groups: initialGroups } = require("./mock-data");
const { getLeaderName } = require("./session-store");

const MARKET_GROUPS_KEY = "ttg_market_groups_v1";
const DEFAULT_GROUP_COVER = "https://dummyimage.com/200x200/f3f3f3/8a8a8a&text=SHOP";

function resolveGroupCover(payload = {}, fallbackGroup = null) {
  const coverImage = String(payload.coverImage || "").trim();
  if (coverImage) return coverImage;
  const products = Array.isArray(payload.products) ? payload.products : [];
  for (let i = 0; i < products.length; i += 1) {
    const first = ((products[i] && products[i].images) || [])[0];
    if (first) return first;
  }
  if (fallbackGroup && fallbackGroup.coverImage) return fallbackGroup.coverImage;
  return DEFAULT_GROUP_COVER;
}

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
  const products = Array.isArray(payload.products) ? payload.products : [];
  const group = {
    id: `g_${now}`,
    title: payload.title || `新品团 ${new Date(now).toLocaleDateString()}`,
    coverImage: resolveGroupCover(payload),
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
    paymentQrHint: "团长收款二维码固定展示",
    bundleRequiredAmount: Number(payload.bundleRequiredAmount || 0),
    autoCompleteDays: Number(payload.autoCompleteDays || 14),
    groupRules: payload.groupRules || null,
    groupRuleInput: payload.groupRuleInput || null,
    products
  };
  const next = [group, ...groups];
  saveMarketGroups(next);
  return group;
}

function updatePublishedGroup(groupId, payload) {
  const groups = getMarketGroups();
  let updated = null;
  const next = groups.map((group) => {
    if (group.id !== groupId) return group;
    const merged = {
      ...group,
      title: payload.title || group.title,
      category: payload.category || group.category,
      minPrice: Number(payload.minPrice || group.minPrice || 0),
      stock: Number(payload.stock || group.stock || 0),
      saleRuleType: payload.saleRuleType || group.saleRuleType,
      groupType: payload.groupType || group.groupType,
      products: Array.isArray(payload.products) ? payload.products : (group.products || []),
      bundleRequiredAmount: Number(payload.bundleRequiredAmount || group.bundleRequiredAmount || 0),
      departureCondition: payload.departureCondition || group.departureCondition,
      autoCompleteDays: Number(payload.autoCompleteDays || group.autoCompleteDays || 14),
      groupRules: payload.groupRules != null ? payload.groupRules : group.groupRules,
      groupRuleInput: payload.groupRuleInput != null ? payload.groupRuleInput : group.groupRuleInput
    };
    merged.coverImage = resolveGroupCover(payload, merged);
    updated = merged;
    return merged;
  });
  saveMarketGroups(next);
  return updated;
}

module.exports = {
  DEFAULT_GROUP_COVER,
  resolveGroupCover,
  getMarketGroups,
  addPublishedGroup,
  getGroupById,
  updatePublishedGroup
};
