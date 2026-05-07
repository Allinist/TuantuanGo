const {
  getOrders,
  markShipped,
  shipMergeShipment,
  applyAutoCompleteStrategy,
  submitReshipmentLogistics,
  submitReturnShipment,
  completeRefund
} = require("../../stores/order-store");
const { isLeader } = require("../../stores/session-store");
const { getLeaderPolicy } = require("../../stores/leader-policy-store");

Page({
  data: {
    isLeader: false,
    buyerOrderTab: "all",
    buyerTabCounts: {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      afterSale: 0
    },
    activeShipTab: "ship",
    shipTabCounts: {
      ship: 0,
      merge: 0,
      reship: 0,
      refund: 0
    },
    orders: [],
    displayedOrders: [],
    confirmedOrders: [],
    reshipmentOrders: [],
    returnRefundOrders: [],
    mergeApprovedGroups: [],
    selectedOrderIds: [],
    logisticsEntries: [
      { id: "l1", logisticsCompany: "顺丰速运", trackingNo: "" }
    ],
    noLogistics: false,
    noLogisticsReason: "同城面交"
  },
  onShow() {
    applyAutoCompleteStrategy();
    const leader = isLeader();
    this.setData({ isLeader: leader });
    if (leader) {
      this.refreshLeader();
      return;
    }
    const orders = getOrders().map((o) => ({
      ...o,
      statusLabel:
        o.status === "pending_review"
          ? "待团长审核"
          : o.status === "confirmed"
            ? "团长已确认"
            : o.status === "rejected"
              ? "已驳回"
              : o.status === "shipped"
                ? "已发货"
                : o.status === "completed"
                  ? "已完成"
              : o.status,
      amountLabel: `¥${o.amount ? o.amount.totalAmount : 0}`
    }));
    this.setData({ orders });
    this.refreshBuyerOrders();
  },
  refreshBuyerOrders() {
    const pending = this.data.orders.filter((o) => o.status === "pending_review");
    const confirmed = this.data.orders.filter((o) => o.status === "confirmed");
    const shipped = this.data.orders.filter((o) => o.status === "shipped");
    const afterSale = this.data.orders.filter((o) => (o.afterSales || []).length > 0);
    let displayedOrders = this.data.orders;
    if (this.data.buyerOrderTab === "pending") displayedOrders = pending;
    if (this.data.buyerOrderTab === "confirmed") displayedOrders = confirmed;
    if (this.data.buyerOrderTab === "shipped") displayedOrders = shipped;
    if (this.data.buyerOrderTab === "afterSale") displayedOrders = afterSale;
    this.setData({
      displayedOrders,
      buyerTabCounts: {
        pending: pending.length,
        confirmed: confirmed.length,
        shipped: shipped.length,
        afterSale: afterSale.length
      }
    });
  },
  switchBuyerTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (!tab || tab === this.data.buyerOrderTab) return;
    this.setData({ buyerOrderTab: tab });
    this.refreshBuyerOrders();
  },
  refreshLeader() {
    const confirmedOrders = getOrders().filter((o) => o.status === "confirmed");
    const reshipmentOrders = getOrders().filter((o) => o.reshipmentStatus === "approved");
    const returnRefundOrders = getOrders().filter((o) => o.refundStatus === "return_pending" || o.shipmentStatus === "return_pending");
    const mergeMap = {};
    getOrders()
      .filter((o) => o.mergeShipment && o.mergeShipment.status === "approved" && o.mergeShipment.mergeNo)
      .forEach((o) => {
        const key = o.mergeShipment.mergeNo;
        if (!mergeMap[key]) mergeMap[key] = { mergeNo: key, count: 0, orderIds: [] };
        mergeMap[key].count += 1;
        mergeMap[key].orderIds.push(o.id);
      });
    this.setData({
      confirmedOrders,
      reshipmentOrders,
      returnRefundOrders,
      mergeApprovedGroups: Object.values(mergeMap),
      shipTabCounts: {
        ship: confirmedOrders.length,
        merge: Object.values(mergeMap).length,
        reship: reshipmentOrders.length,
        refund: returnRefundOrders.length
      },
      selectedOrderIds: []
    });
  },
  switchShipTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (!tab || tab === this.data.activeShipTab) return;
    this.setData({ activeShipTab: tab });
  },
  toggleSelect(e) {
    const orderId = e.currentTarget.dataset.orderId;
    const set = new Set(this.data.selectedOrderIds);
    if (set.has(orderId)) set.delete(orderId);
    else set.add(orderId);
    this.setData({ selectedOrderIds: Array.from(set) });
  },
  onEntryCompanyInput(e) {
    const id = e.currentTarget.dataset.id;
    const next = this.data.logisticsEntries.map((x) => (x.id === id ? { ...x, logisticsCompany: e.detail.value } : x));
    this.setData({ logisticsEntries: next });
  },
  onEntryTrackingInput(e) {
    const id = e.currentTarget.dataset.id;
    const next = this.data.logisticsEntries.map((x) => (x.id === id ? { ...x, trackingNo: e.detail.value } : x));
    this.setData({ logisticsEntries: next });
  },
  onReasonInput(e) {
    this.setData({ noLogisticsReason: e.detail.value });
  },
  addLogisticsEntry() {
    const entry = { id: `l${Date.now()}`, logisticsCompany: "顺丰速运", trackingNo: "" };
    this.setData({ logisticsEntries: [...this.data.logisticsEntries, entry] });
  },
  removeLogisticsEntry(e) {
    const id = e.currentTarget.dataset.id;
    const next = this.data.logisticsEntries.filter((x) => x.id !== id);
    this.setData({
      logisticsEntries: next.length ? next : [{ id: `l${Date.now()}`, logisticsCompany: "顺丰速运", trackingNo: "" }]
    });
  },
  toggleNoLogistics() {
    this.setData({ noLogistics: !this.data.noLogistics });
  },
  getEntryByIndex(idx) {
    const list = this.data.logisticsEntries;
    if (!list.length) return { logisticsCompany: "顺丰速运", trackingNo: "" };
    return list[idx] || list[list.length - 1];
  },
  ship(e) {
    const orderId = e.currentTarget.dataset.orderId;
    const first = this.getEntryByIndex(0);
    const company = first.logisticsCompany || "顺丰速运";
    const tracking = first.trackingNo || "";
    if (!this.data.noLogistics && !tracking) {
      wx.showToast({ title: "请填写物流单号", icon: "none" });
      return;
    }
    markShipped(orderId, {
      logisticsCompany: company,
      trackingNo: tracking,
      noLogistics: this.data.noLogistics,
      noLogisticsReason: this.data.noLogisticsReason,
      autoCompleteDays: getLeaderPolicy().autoCompleteDays
    });
    wx.showToast({ title: "已标记发货", icon: "success" });
    this.refreshLeader();
  },
  shipBatch() {
    const ids = this.data.selectedOrderIds;
    if (!ids.length) {
      wx.showToast({ title: "请先选择订单", icon: "none" });
      return;
    }
    if (!this.data.noLogistics) {
      const hasAnyTracking = this.data.logisticsEntries.some((x) => x.trackingNo);
      if (!hasAnyTracking) {
        wx.showToast({ title: "请先新增并填写快递单号", icon: "none" });
        return;
      }
    }
    ids.forEach((id, idx) => {
      const entry = this.getEntryByIndex(idx);
      markShipped(id, {
        logisticsCompany: entry.logisticsCompany || "顺丰速运",
        trackingNo: entry.trackingNo || "",
        noLogistics: this.data.noLogistics,
        noLogisticsReason: this.data.noLogisticsReason,
        autoCompleteDays: getLeaderPolicy().autoCompleteDays
      });
    });
    wx.showToast({ title: `批量发货 ${ids.length} 单`, icon: "success" });
    this.refreshLeader();
  },
  shipMerge(e) {
    const mergeNo = e.currentTarget.dataset.mergeNo;
    const first = this.getEntryByIndex(0);
    if (!this.data.noLogistics && !first.trackingNo) {
      wx.showToast({ title: "请填写合并单物流单号", icon: "none" });
      return;
    }
    const updated = shipMergeShipment(mergeNo, {
      logisticsCompany: first.logisticsCompany || "顺丰速运",
      trackingNo: first.trackingNo || "",
      noLogistics: this.data.noLogistics,
      noLogisticsReason: this.data.noLogisticsReason,
      autoCompleteDays: getLeaderPolicy().autoCompleteDays
    });
    wx.showToast({ title: `合并单发货 ${updated.length} 单`, icon: "success" });
    this.refreshLeader();
  },
  shipReshipment(e) {
    const orderId = e.currentTarget.dataset.orderId;
    const first = this.getEntryByIndex(0);
    if (!first.trackingNo) {
      wx.showToast({ title: "请填写补发物流单号", icon: "none" });
      return;
    }
    submitReshipmentLogistics(orderId, first.logisticsCompany || "顺丰速运", first.trackingNo);
    wx.showToast({ title: "补发物流已提交", icon: "success" });
    this.refreshLeader();
  },
  shipReturn(e) {
    const orderId = e.currentTarget.dataset.orderId;
    const first = this.getEntryByIndex(0);
    if (!first.trackingNo) {
      wx.showToast({ title: "请填写退回物流单号", icon: "none" });
      return;
    }
    submitReturnShipment(orderId, first.logisticsCompany || "顺丰速运", first.trackingNo);
    wx.showToast({ title: "退回物流已录入", icon: "success" });
    this.refreshLeader();
  },
  finishRefund(e) {
    const orderId = e.currentTarget.dataset.orderId;
    const amount = e.currentTarget.dataset.amount || 0;
    completeRefund(orderId, amount, "售后退款完成");
    wx.showToast({ title: "已完成退款", icon: "success" });
    this.refreshLeader();
  },
  openDetail(e) {
    const orderId = e.currentTarget.dataset.orderId;
    wx.navigateTo({ url: `/pages/order-detail/index?orderId=${orderId}` });
  }
});
