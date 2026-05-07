const { isLeader, getLeaderName } = require("../../stores/session-store");
const { getMarketGroups } = require("../../stores/market-store");

const AGREEMENT_KEY = "ttg_agreement_accepted_v1";
const PURCHASE_FILTERS = ["all", "direct", "bundle", "group", "optional"];
const ITEM_TYPE_FILTERS = ["all", "goods", "cultural"];

function mapGroupCard(group) {
  const itemType = group.category === "文创" ? "cultural" : "goods";
  let purchaseType = "optional";
  if (group.saleRuleType === "direct") {
    purchaseType = "direct";
  } else if (String(group.saleRuleType || "").includes("bundle")) {
    purchaseType = "bundle";
  } else if (group.saleRuleType === "optional") {
    purchaseType = "optional";
  } else if (group.groupType === "multi") {
    purchaseType = "group";
  }
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
    leaderName: "",
    leaderView: "mine",
    purchaseFilter: "all",
    itemTypeFilter: "all",
    keyword: "",
    groups: [],
    filteredGroups: []
  },
  onLoad() {
    const mapped = getMarketGroups().map(mapGroupCard);
    this.setData({ groups: mapped, filteredGroups: mapped });
  },
  onShow() {
    this.setData({ isLeader: isLeader(), leaderName: getLeaderName() });
    this.applySearch(this.data.keyword);
    this.ensureAgreementConfirmed();
  },
  ensureAgreementConfirmed() {
    if (wx.getStorageSync(AGREEMENT_KEY)) return;
    wx.showModal({
      title: "用户协议与免责声明",
      content:
        "请阅读并同意：1）本软件仅提供团购信息工具与流程记录；2）本软件不参与买卖双方任何财务结算、纠纷仲裁或债务追偿；3）因交易产生的价格争议、物流争议、质量争议及财务矛盾，均由交易双方自行协商或依法处理。",
      confirmText: "同意继续",
      cancelText: "不同意",
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync(AGREEMENT_KEY, true);
        } else {
          wx.showToast({ title: "未同意协议，部分功能将受限", icon: "none" });
        }
      }
    });
  },
  applySearch(keywordValue) {
    const keyword = (keywordValue || "").trim();
    const kw = keyword.toLowerCase();
    const leaderName = String(this.data.leaderName || "").toLowerCase();
    const sourceGroups = this.data.groups.filter((group) => {
      if (!this.data.isLeader && group.status !== "active") return false;
      if (!this.data.isLeader || this.data.leaderView === "all") return true;
      return String(group.leaderName || "").toLowerCase() === leaderName;
    });
    const filteredGroups = sourceGroups.filter((group) => {
      const purchaseMatched =
        this.data.purchaseFilter === "all" || group.purchaseType === this.data.purchaseFilter;
      const typeMatched = this.data.itemTypeFilter === "all" || group.itemType === this.data.itemTypeFilter;
      const keywordMatched =
        !kw ||
        String(group.title || "").toLowerCase().includes(kw) ||
        String(group.leaderName || "").toLowerCase().includes(kw) ||
        String(group.category || "").toLowerCase().includes(kw);
      return purchaseMatched && typeMatched && keywordMatched;
    });
    this.setData({ keyword, filteredGroups });
  },
  onKeywordInput(e) {
    this.setData({ keyword: (e.detail.value || "").trim() });
  },
  onSearchTap() {
    this.applySearch(this.data.keyword);
  },
  clearKeyword() {
    this.applySearch("");
  },
  switchPurchaseFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    if (!PURCHASE_FILTERS.includes(filter)) return;
    if (filter === this.data.purchaseFilter) return;
    this.setData({ purchaseFilter: filter });
    this.applySearch(this.data.keyword);
  },
  switchItemTypeFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    if (!ITEM_TYPE_FILTERS.includes(filter)) return;
    if (filter === this.data.itemTypeFilter) return;
    this.setData({ itemTypeFilter: filter });
    this.applySearch(this.data.keyword);
  },
  switchLeaderView(e) {
    const mode = e.currentTarget.dataset.mode;
    if (mode !== "mine" && mode !== "all") return;
    if (mode === this.data.leaderView) return;
    this.setData({ leaderView: mode });
    this.applySearch(this.data.keyword);
  },
  openGroup(e) {
    const groupId = e.currentTarget.dataset.groupId;
    wx.navigateTo({ url: `/pages/group-detail/index?groupId=${groupId}` });
  },
  editGroup(e) {
    const groupId = e.currentTarget.dataset.groupId;
    if (!groupId) return;
    wx.navigateTo({ url: `/pages/publish/index?groupId=${groupId}` });
  }
});
