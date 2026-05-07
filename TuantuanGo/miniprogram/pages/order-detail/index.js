const {
  getOrderById,
  confirmReceived,
  applyMergeShipment,
  applyTransfer,
  getOrdersByMergeNo,
  applyAutoCompleteStrategy,
  extendReceiveDeadline,
  rejectReceive,
  createAfterSale
} = require("../../stores/order-store");
const { fenToYuanText, buildRefundAllocation } = require("../../utils/refund-allocation");

function statusLabel(status) {
  const map = {
    pending_payment: "待支付截图",
    pending_review: "待团长审核",
    confirmed: "团长已确认",
    rejected: "团长已驳回",
    shipped: "已发货",
    completed: "已完成",
    transferred: "已转单",
    cancelled: "已取消",
    delivery_rejected: "拒收处理中"
  };
  return map[status] || status;
}

function normalizeEvents(events) {
  const list = (events || []).map((e) => ({
    ...e,
    eventAt: Number(e.eventAt || 0)
  }));
  list.sort((a, b) => b.eventAt - a.eventAt);
  const seen = new Set();
  return list.filter((e) => {
    const key = `${e.time}|${e.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatTs(ts) {
  const n = Number(ts || 0);
  if (!n) return "";
  const d = new Date(n);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function afterSaleTypeLabel(type) {
  const map = {
    return_refund: "退货退款",
    partial_refund: "部分退款",
    reshipment: "补发货"
  };
  return map[type] || type;
}

function afterSaleStatusLabel(status) {
  const map = {
    requested: "待处理",
    approved: "已通过",
    rejected: "已驳回",
    completed: "已完成"
  };
  return map[status] || status;
}


Page({
  data: {
    order: null,
    statusText: "",
    canReview: false,
    paymentReviewText: "",
    shipmentStatusText: "",
    sharedTracking: [],
    autoCompleteText: "",
    refundRows: [],
    refundRemainderYuanText: "0.00",
    refundTotalYuanText: "0.00"
  },
  onLoad(options) {
    applyAutoCompleteStrategy();
    const orderId = options.orderId;
    const order = orderId ? getOrderById(orderId) : null;
    if (!order) {
      wx.showToast({ title: "订单不存在", icon: "none" });
      return;
    }
    this.renderOrder(order);
  },
  renderOrder(order) {
    const canReview = ["confirmed", "shipped", "completed"].includes(order.status);
    let sharedTracking = [];
    if (order.mergeShipment && order.mergeShipment.mergeNo) {
      const related = getOrdersByMergeNo(order.mergeShipment.mergeNo);
      sharedTracking = normalizeEvents(related.flatMap((x) => x.trackingEvents || []));
    }
    order.trackingEvents = normalizeEvents(order.trackingEvents || []);
    const afterSales = (order.afterSales || []).map((x) => ({
      ...x,
      typeLabel: afterSaleTypeLabel(x.type),
      statusLabel: afterSaleStatusLabel(x.status)
    }));
    this.setData({
      order: { ...order, afterSales },
      statusText: statusLabel(order.status),
      canReview,
      sharedTracking
    });
    this.setData({
      paymentReviewText:
        order.paymentReviewStatus === "pending_review"
          ? "待审核"
          : order.paymentReviewStatus === "approved"
            ? "已通过"
            : order.paymentReviewStatus === "rejected"
              ? "已驳回"
              : order.paymentReviewStatus,
      shipmentStatusText:
        order.shipmentStatus === "pending"
          ? "待发货"
          : order.shipmentStatus === "signed"
            ? "已签收"
          : order.shipmentStatus === "rejected_receive"
              ? "拒收处理中"
              : order.shipmentStatus === "return_pending"
                ? "退回待录入"
                : order.shipmentStatus === "return_in_transit"
                  ? "退回运输中"
                  : order.shipmentStatus === "returned"
                    ? "已退回"
              : order.shipmentStatus
    });
    this.setData({
      autoCompleteText: formatTs(order.autoCompleteAt)
    });
    const alloc = buildRefundAllocation(order.items || [], order.refundAmount || 0);
    this.setData({
      refundRows: alloc.rows.map((r) => ({ ...r, amountYuanText: fenToYuanText(r.amountFen) })),
      refundRemainderYuanText: fenToYuanText(alloc.remainderFen),
      refundTotalYuanText: fenToYuanText(alloc.refundFen)
    });
  },
  extendReceive3Days() {
    if (!this.data.order || this.data.order.status !== "shipped") {
      wx.showToast({ title: "当前不可延长收货", icon: "none" });
      return;
    }
    extendReceiveDeadline(this.data.order.id, 3);
    const order = getOrderById(this.data.order.id);
    this.renderOrder(order);
    wx.showToast({ title: "已延长3天", icon: "success" });
  },
  rejectReceive() {
    if (!this.data.order || this.data.order.status !== "shipped") {
      wx.showToast({ title: "当前不可拒收", icon: "none" });
      return;
    }
    rejectReceive(this.data.order.id, "商品与描述不符，申请拒收");
    const order = getOrderById(this.data.order.id);
    this.renderOrder(order);
    wx.showToast({ title: "已提交拒收申请", icon: "none" });
  },
  requestReturnRefund() {
    if (!this.data.order) return;
    createAfterSale(this.data.order.id, "return_refund", {
      reason: "商品质量问题，申请退货退款"
    });
    this.renderOrder(getOrderById(this.data.order.id));
    wx.showToast({ title: "已提交退货退款申请", icon: "success" });
  },
  requestPartialRefund() {
    if (!this.data.order) return;
    createAfterSale(this.data.order.id, "partial_refund", {
      reason: "商品存在瑕疵，申请部分退款",
      amount: 20
    });
    this.renderOrder(getOrderById(this.data.order.id));
    wx.showToast({ title: "已提交部分退款申请", icon: "success" });
  },
  requestReshipment() {
    if (!this.data.order) return;
    createAfterSale(this.data.order.id, "reshipment", {
      reason: "漏发/错发，申请补发货"
    });
    this.renderOrder(getOrderById(this.data.order.id));
    wx.showToast({ title: "已提交补发货申请", icon: "success" });
  },
  copyTrackingNo() {
    if (!this.data.order || !this.data.order.trackingNo) return;
    wx.setClipboardData({
      data: this.data.order.trackingNo,
      success: () => wx.showToast({ title: "已复制单号", icon: "none" })
    });
  },
  applyMerge() {
    if (!this.data.order) return;
    if (!["confirmed", "shipped"].includes(this.data.order.status)) {
      wx.showToast({ title: "当前状态不可申请合并", icon: "none" });
      return;
    }
    applyMergeShipment(this.data.order.id);
    const order = getOrderById(this.data.order.id);
    this.renderOrder(order);
    wx.showToast({ title: "已提交合并申请", icon: "success" });
  },
  applyTransfer() {
    if (!this.data.order) return;
    if (!["confirmed", "shipped"].includes(this.data.order.status)) {
      wx.showToast({ title: "当前状态不可申请转单", icon: "none" });
      return;
    }
    applyTransfer(this.data.order.id, "团团用户_2048");
    const order = getOrderById(this.data.order.id);
    this.renderOrder(order);
    wx.showToast({ title: "已提交转单申请", icon: "success" });
  },
  confirmReceived() {
    if (!this.data.order) return;
    if (!["shipped", "confirmed"].includes(this.data.order.status)) {
      wx.showToast({ title: "当前状态不可确认收货", icon: "none" });
      return;
    }
    confirmReceived(this.data.order.id);
    const order = getOrderById(this.data.order.id);
    this.renderOrder(order);
    wx.showToast({ title: "已确认收货", icon: "success" });
  },
  goReview() {
    wx.showToast({ title: "评价入口（占位）", icon: "none" });
  }
});
