const { isLeader, isAdmin, getLeaderName } = require("../../stores/session-store");
const { getMarketGroups } = require("../../stores/market-store");
const { isGroupBanned } = require("../../stores/moderation-store");

const AGREEMENT_KEY = "ttg_agreement_accepted_v1";
const PURCHASE_FILTERS = ["all", "direct", "bundle", "group", "optional"];
const ITEM_TYPE_FILTERS = ["all", "goods", "cultural"];

function mapGroupCard(group) {
  const itemType = group.category === "文创" ? "cultural" : "goods";
  let purchaseType = "optional";
  if (group.saleRuleType === "direct") purchaseType = "direct";
  else if (String(group.saleRuleType || "").includes("bundle")) purchaseType = "bundle";
  else if (group.saleRuleType === "optional") purchaseType = "optional";
  else if (group.groupType === "multi") purchaseType = "group";
  return {
    ...group,
    itemType,
    purchaseType,
    host: `团长：${group.leaderName || "-"}`,
    priceLabel: `¥${group.minPrice || 0} 起`,
    stockLabel: `余量 ${group.stock || 0}`,
    statusLabel: group.status === "active" ? "进行中" : "已结束"
  };
}

Page({
  data: {
    isLeader: false,
    isAdmin: false,
    leaderName: "",
    leaderView: "mine",
    purchaseFilter: "all",
    itemTypeFilter: "all",
    keyword: "",
    groups: [],
    filteredGroups: []
  },
  onLoad() {
    this.reloadGroups();
  },
  onShow() {
    this.setData({ isLeader: isLeader(), isAdmin: isAdmin(), leaderName: getLeaderName() });
    this.reloadGroups();
    this.applySearch(this.data.keyword);
    this.ensureAgreementConfirmed();
  },
  reloadGroups() {
    const mapped = getMarketGroups().filter((g) => !isGroupBanned(g.id)).map(mapGroupCard);
    this.setData({ groups: mapped });
  },
  ensureAgreementConfirmed() {
    if (wx.getStorageSync(AGREEMENT_KEY)) return;
    wx.showModal({
      title: "用户协议与免责声明",
      content: "本软件仅提供团购流程记录，不参与任何财务结算与纠纷仲裁。交易争议、物流争议、财务矛盾由买卖双方自行协商或依法处理。",
      confirmText: "同意继续",
      cancelText: "不同意",
      success: (res) => {
        if (res.confirm) wx.setStorageSync(AGREEMENT_KEY, true);
      }
    });
  },
  applySearch(keywordValue) {
    const keyword = (keywordValue || "").trim();
    const kw = keyword.toLowerCase();
    const leaderName = String(this.data.leaderName || "").toLowerCase();
    const sourceGroups = this.data.groups.filter((group) => {
      if (!this.data.isLeader && !this.data.isAdmin && group.status !== "active") return false;
      if (!this.data.isLeader || this.data.leaderView === "all") return true;
      return String(group.leaderName || "").toLowerCase() === leaderName;
    });
    const filteredGroups = sourceGroups.filter((group) => {
      const purchaseMatched = this.data.purchaseFilter === "all" || group.purchaseType === this.data.purchaseFilter;
      const typeMatched = this.data.itemTypeFilter === "all" || group.itemType === this.data.itemTypeFilter;
      const keywordMatched = !kw || String(group.title || "").toLowerCase().includes(kw) || String(group.leaderName || "").toLowerCase().includes(kw);
      return purchaseMatched && typeMatched && keywordMatched;
    });
    this.setData({ keyword, filteredGroups });
  },
  onKeywordInput(e) { this.setData({ keyword: String(e.detail || "").trim() }); },
  onSearchTap() { this.applySearch(this.data.keyword); },
  clearKeyword() { this.applySearch(""); },
  switchPurchaseFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    if (!PURCHASE_FILTERS.includes(filter)) return;
    this.setData({ purchaseFilter: filter });
    this.applySearch(this.data.keyword);
  },
  switchItemTypeFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    if (!ITEM_TYPE_FILTERS.includes(filter)) return;
    this.setData({ itemTypeFilter: filter });
    this.applySearch(this.data.keyword);
  },
  switchLeaderView(e) {
    const mode = e.currentTarget.dataset.mode;
    if (mode !== "mine" && mode !== "all") return;
    this.setData({ leaderView: mode });
    this.applySearch(this.data.keyword);
  },
  openGroup(e) { wx.navigateTo({ url: `/pages/group-detail/index?groupId=${e.currentTarget.dataset.groupId}` }); },
  editGroup(e) { wx.navigateTo({ url: `/pages/publish/index?groupId=${e.currentTarget.dataset.groupId}` }); }
});
