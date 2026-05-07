const { groups } = require("../../stores/mock-data");
const { getAllGroupCarts, updateQuantity, clearGroupCart, MAX_GROUP_ORDERS } = require("../../stores/cart-store");
const { calcOrderAmount } = require("../../services/pricing");
const {
  getOrders,
  updateOrderStatus,
  processMergeShipment,
  processTransfer,
  processReceiveIssue,
  processAfterSale
} = require("../../stores/order-store");
const { isLeader } = require("../../stores/session-store");
const { fenToYuanText, buildRefundAllocation } = require("../../utils/refund-allocation");

function mapRule(ruleType) {
  const m = {
    optional: "自选",
    direct: "直出",
    bundle_main: "捆出主商品",
    bundle_item: "捆出被捆商品",
    bundle_fixed: "固定捆商品"
  };
  return m[ruleType] || ruleType;
}

Page({
  data: {
    isLeader: false,
    activeLeaderTab: "review",
    leaderTabCounts: {
      review: 0,
      merge: 0,
      transfer: 0,
      return: 0,
      afterSale: 0
    },
    cartGroups: [],
    cartGroupCount: 0,
    cartGroupLimit: MAX_GROUP_ORDERS,
    selecting: false,
    selectedGroupIds: [],
    pendingOrders: [],
    mergeRequestedOrders: [],
    transferRequestedOrders: [],
    receiveIssueOrders: [],
    afterSaleOrders: [],
    reviewRemark: ""
  },
  onShow() {
    const leader = isLeader();
    this.setData({ isLeader: leader });
    if (leader) {
      this.refreshLeader();
      return;
    }
    this.refresh();
  },
  refreshLeader() {
    const pendingOrders = getOrders().filter((o) => o.status === "pending_review");
    const mergeRequestedOrders = getOrders().filter((o) => o.mergeShipment && o.mergeShipment.status === "requested");
    const transferRequestedOrders = getOrders().filter((o) => o.transferRecord && o.transferRecord.status === "requested");
    const receiveIssueOrders = getOrders().filter((o) => o.receiveIssue && o.receiveIssue.status === "requested");
    const afterSaleOrders = getOrders()
      .filter((o) => (o.afterSales || []).some((x) => x.status === "requested"))
      .map((o) => {
        const pendingAfterSales = (o.afterSales || []).filter((x) => x.status === "requested").map((x) => {
          if (x.type !== "partial_refund" || !x.amount) {
            return { ...x, allocationRows: [], allocationRemainderYuanText: "0.00", allocationTotalYuanText: "0.00" };
          }
          const alloc = buildRefundAllocation(o.items || [], x.amount);
          return {
            ...x,
            allocationRows: alloc.rows.map((r) => ({ ...r, amountYuanText: fenToYuanText(r.amountFen) })),
            allocationRemainderYuanText: fenToYuanText(alloc.remainderFen),
            allocationTotalYuanText: fenToYuanText(alloc.refundFen)
          };
        });
        return { ...o, pendingAfterSales };
      });
    this.setData({
      pendingOrders,
      mergeRequestedOrders,
      transferRequestedOrders,
      receiveIssueOrders,
      afterSaleOrders,
      leaderTabCounts: {
        review: pendingOrders.length,
        merge: mergeRequestedOrders.length,
        transfer: transferRequestedOrders.length,
        return: receiveIssueOrders.length,
        afterSale: afterSaleOrders.length
      }
    });
  },
  switchLeaderTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (!tab || tab === this.data.activeLeaderTab) return;
    this.setData({ activeLeaderTab: tab });
  },
  refresh() {
    const cartGroups = getAllGroupCarts().map((cart) => {
      const group = groups.find((x) => x.id === cart.groupId) || null;
      const amount = group
        ? calcOrderAmount(cart.items, {
            shippingFee: group.shippingFee,
            freeShippingThreshold: group.freeShippingThreshold,
            packingFee: group.packingFee,
            materialFee: group.materialFee,
            tipFee: group.tipFee
          })
        : null;
      return {
        groupId: cart.groupId,
        group,
        amount,
        items: (cart.items || []).map((x) => ({ ...x, ruleLabel: mapRule(x.ruleType) }))
      };
    });
    this.setData({ cartGroups, cartGroupCount: cartGroups.length });
  },
  plus(e) {
    const groupId = e.currentTarget.dataset.groupId;
    const id = e.currentTarget.dataset.productId;
    const cartGroup = this.data.cartGroups.find((x) => x.groupId === groupId);
    const item = (cartGroup?.items || []).find((x) => x.productId === id);
    if (!item) return;
    updateQuantity(groupId, id, item.quantity + 1);
    this.refresh();
  },
  minus(e) {
    const groupId = e.currentTarget.dataset.groupId;
    const id = e.currentTarget.dataset.productId;
    const cartGroup = this.data.cartGroups.find((x) => x.groupId === groupId);
    const item = (cartGroup?.items || []).find((x) => x.productId === id);
    if (!item) return;
    updateQuantity(groupId, id, item.quantity - 1);
    this.refresh();
  },
  submitGroup(e) {
    const groupId = e.currentTarget.dataset.groupId;
    if (!groupId) return;
    wx.navigateTo({ url: `/pages/order-confirm/index?groupId=${groupId}` });
  },
  onQtyChange(e) {
    const { groupId, productId, value } = e.detail || {};
    if (!groupId || !productId) return;
    updateQuantity(groupId, productId, Number(value || 0));
    this.refresh();
  },
  removeGroup(e) {
    const groupId = e.currentTarget.dataset.groupId;
    if (!groupId) return;
    clearGroupCart(groupId);
    this.refresh();
  },
  startSelectDelete() {
    this.setData({ selecting: true, selectedGroupIds: [] });
  },
  cancelSelectDelete() {
    this.setData({ selecting: false, selectedGroupIds: [] });
  },
  toggleSelectGroup(e) {
    const groupId = e.currentTarget.dataset.groupId;
    if (!groupId) return;
    const selected = new Set(this.data.selectedGroupIds);
    if (selected.has(groupId)) selected.delete(groupId);
    else selected.add(groupId);
    this.setData({ selectedGroupIds: Array.from(selected) });
  },
  deleteSelectedGroups() {
    (this.data.selectedGroupIds || []).forEach((groupId) => clearGroupCart(groupId));
    this.setData({ selecting: false, selectedGroupIds: [] });
    this.refresh();
  },
  onRemarkInput(e) {
    this.setData({ reviewRemark: e.detail.value });
  },
  approve(e) {
    const orderId = e.currentTarget.dataset.orderId;
    updateOrderStatus(orderId, "approve", this.data.reviewRemark);
    wx.showToast({ title: "审核通过", icon: "success" });
    this.setData({ reviewRemark: "" });
    this.refreshLeader();
  },
  reject(e) {
    const orderId = e.currentTarget.dataset.orderId;
    updateOrderStatus(orderId, "reject", this.data.reviewRemark || "支付截图不完整");
    wx.showToast({ title: "已驳回", icon: "none" });
    this.setData({ reviewRemark: "" });
    this.refreshLeader();
  },
  openOrder(e) {
    const orderId = e.currentTarget.dataset.orderId;
    wx.navigateTo({ url: `/pages/order-detail/index?orderId=${orderId}` });
  },
  approveMerge(e) {
    const orderId = e.currentTarget.dataset.orderId;
    processMergeShipment(orderId, "approve", this.data.reviewRemark);
    wx.showToast({ title: "已通过合并申请", icon: "success" });
    this.setData({ reviewRemark: "" });
    this.refreshLeader();
  },
  rejectMerge(e) {
    const orderId = e.currentTarget.dataset.orderId;
    processMergeShipment(orderId, "reject", this.data.reviewRemark || "不满足合并条件");
    wx.showToast({ title: "已驳回合并申请", icon: "none" });
    this.setData({ reviewRemark: "" });
    this.refreshLeader();
  },
  approveTransfer(e) {
    const orderId = e.currentTarget.dataset.orderId;
    processTransfer(orderId, "approve", this.data.reviewRemark);
    wx.showToast({ title: "已确认转单", icon: "success" });
    this.setData({ reviewRemark: "" });
    this.refreshLeader();
  },
  rejectTransfer(e) {
    const orderId = e.currentTarget.dataset.orderId;
    processTransfer(orderId, "reject", this.data.reviewRemark || "接收人信息不符合");
    wx.showToast({ title: "已驳回转单", icon: "none" });
    this.setData({ reviewRemark: "" });
    this.refreshLeader();
  },
  approveReceiveIssue(e) {
    const orderId = e.currentTarget.dataset.orderId;
    processReceiveIssue(orderId, "approve", this.data.reviewRemark);
    wx.showToast({ title: "已通过拒收", icon: "success" });
    this.setData({ reviewRemark: "" });
    this.refreshLeader();
  },
  rejectReceiveIssue(e) {
    const orderId = e.currentTarget.dataset.orderId;
    processReceiveIssue(orderId, "reject", this.data.reviewRemark || "拒收条件不满足");
    wx.showToast({ title: "已驳回拒收", icon: "none" });
    this.setData({ reviewRemark: "" });
    this.refreshLeader();
  },
  approveAfterSale(e) {
    const orderId = e.currentTarget.dataset.orderId;
    const afterSaleId = e.currentTarget.dataset.afterSaleId;
    processAfterSale(orderId, afterSaleId, "approve", this.data.reviewRemark);
    wx.showToast({ title: "已通过售后申请", icon: "success" });
    this.setData({ reviewRemark: "" });
    this.refreshLeader();
  },
  rejectAfterSale(e) {
    const orderId = e.currentTarget.dataset.orderId;
    const afterSaleId = e.currentTarget.dataset.afterSaleId;
    processAfterSale(orderId, afterSaleId, "reject", this.data.reviewRemark || "资料不完整");
    wx.showToast({ title: "已驳回售后申请", icon: "none" });
    this.setData({ reviewRemark: "" });
    this.refreshLeader();
  }
});
