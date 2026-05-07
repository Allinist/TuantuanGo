const KEY = "ttg_orders_v1";
const DAY_MS = 24 * 60 * 60 * 1000;

function getOrders() {
  return wx.getStorageSync(KEY) || [];
}

function saveOrders(orders) {
  wx.setStorageSync(KEY, orders);
}

function pushEvent(order, time, text, eventAt) {
  order.trackingEvents = [
    { time, text, eventAt: eventAt || Date.now() },
    ...(order.trackingEvents || [])
  ];
}

function createOrder(payload) {
  const orders = getOrders();
  const now = Date.now();
  const order = {
    id: `o_${now}`,
    orderNo: `TTG-${String(now).slice(-8)}`,
    status: "pending_review",
    shipmentStatus: "pending",
    paymentReviewStatus: "pending_review",
    logisticsCompany: "",
    trackingNo: "",
    trackingEvents: [],
    mergeShipment: null,
    transferRecord: null,
    createdAt: now,
    ...payload
  };
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

function getOrderById(orderId) {
  return getOrders().find((o) => o.id === orderId) || null;
}

function updateOrderStatus(orderId, action, reviewRemark) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  if (action === "approve") {
    order.status = "confirmed";
    order.paymentReviewStatus = "approved";
    order.shipmentStatus = "pending";
    order.leaderReviewRemark = reviewRemark || "";
    pushEvent(order, "已审核", "团长已确认支付截图，订单进入待发货。");
  } else if (action === "reject") {
    order.status = "rejected";
    order.paymentReviewStatus = "rejected";
    order.shipmentStatus = "pending";
    order.leaderReviewRemark = reviewRemark || "";
    pushEvent(order, "已驳回", `团长已驳回支付截图：${reviewRemark || "请补充有效凭证"}`);
  }
  orders[idx] = order;
  saveOrders(orders);
  return order;
}

function markShipped(orderId, payload) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  order.status = "shipped";
  order.shipmentStatus = payload.noLogistics ? "not_required" : "shipped";
  order.logisticsCompany = payload.noLogistics ? "无需物流" : (payload.logisticsCompany || order.logisticsCompany);
  order.trackingNo = payload.noLogistics ? (payload.noLogisticsReason || "面交/自提") : (payload.trackingNo || order.trackingNo);
  const shippedAt = Date.now();
  const autoCompleteDays = Number(payload.autoCompleteDays || 14);
  order.autoCompleteAt = shippedAt + autoCompleteDays * DAY_MS;
  pushEvent(
    order,
    "已发货",
    payload.noLogistics
      ? `无需物流：${payload.noLogisticsReason || "面交/自提"}`
      : `已由 ${order.logisticsCompany} 发出，单号 ${order.trackingNo}${order.mergeShipment?.mergeNo ? `（合并单 ${order.mergeShipment.mergeNo}）` : ""}`,
    shippedAt
  );
  pushEvent(order, "自动签收", `若买家未手动确认，系统将在 ${autoCompleteDays} 天后自动完成订单。`, shippedAt + 1);
  if (order.mergeShipment && order.mergeShipment.status === "approved") {
    order.mergeShipment.status = "shipped";
  }
  orders[idx] = order;
  saveOrders(orders);
  return order;
}

function markShippedBatch(orderIds, payload) {
  const updated = [];
  (orderIds || []).forEach((id) => {
    const order = markShipped(id, payload);
    if (order) updated.push(order);
  });
  return updated;
}

function confirmReceived(orderId) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  order.status = "completed";
  order.shipmentStatus = "signed";
  pushEvent(order, "已签收", "买家已确认收货，订单完成。");
  orders[idx] = order;
  saveOrders(orders);
  return order;
}

function extendReceiveDeadline(orderId, days) {
  const extDays = Number(days || 3);
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  if (!order.autoCompleteAt || order.status !== "shipped") return null;
  order.autoCompleteAt += extDays * DAY_MS;
  pushEvent(order, "延长收货", `买家已申请延长收货 ${extDays} 天。`);
  orders[idx] = order;
  saveOrders(orders);
  return order;
}

function rejectReceive(orderId, reason) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  order.shipmentStatus = "rejected_receive";
  order.receiveIssue = {
    status: "requested",
    reason: reason || "商品与描述不符，申请拒收"
  };
  pushEvent(order, "拒绝收货", `买家已发起拒收申请。原因：${order.receiveIssue.reason}`);
  orders[idx] = order;
  saveOrders(orders);
  return order;
}

function createAfterSale(orderId, type, payload) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  const req = {
    id: `as_${Date.now()}`,
    type, // return_refund | partial_refund | reshipment
    status: "requested",
    reason: payload?.reason || "",
    amount: Number(payload?.amount || 0),
    items: payload?.items || [],
    remark: payload?.remark || "",
    createdAt: Date.now()
  };
  order.afterSales = order.afterSales || [];
  order.afterSales.unshift(req);
  pushEvent(order, "售后申请", `买家发起${type}申请。`);
  orders[idx] = order;
  saveOrders(orders);
  return req;
}

function processAfterSale(orderId, afterSaleId, action, remark) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  const list = order.afterSales || [];
  const j = list.findIndex((x) => x.id === afterSaleId);
  if (j < 0) return null;
  const req = list[j];
  req.status = action === "approve" ? "approved" : "rejected";
  req.leaderRemark = remark || "";
  req.processedAt = Date.now();

  if (action === "approve") {
    if (req.type === "return_refund") {
      order.status = "after_sale_processing";
      order.shipmentStatus = "return_pending";
      order.refundStatus = "return_pending";
      order.returnShipment = order.returnShipment || {};
      pushEvent(order, "退货退款通过", `团长已通过退货退款。${remark || ""}`);
    } else if (req.type === "partial_refund") {
      order.refundStatus = "partial_refunded";
      pushEvent(order, "部分退款通过", `团长已通过部分退款 ¥${req.amount}。${remark || ""}`);
    } else if (req.type === "reshipment") {
      order.reshipmentStatus = "approved";
      pushEvent(order, "补发货通过", `团长已通过补发货申请。${remark || ""}`);
    }
  } else {
    pushEvent(order, "售后驳回", `团长驳回${req.type}申请。原因：${remark || "不满足条件"}`);
  }
  list[j] = req;
  order.afterSales = list;
  orders[idx] = order;
  saveOrders(orders);
  return req;
}

function submitReturnShipment(orderId, logisticsCompany, trackingNo) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  order.returnShipment = {
    ...(order.returnShipment || {}),
    logisticsCompany: logisticsCompany || "顺丰速运",
    trackingNo: trackingNo || "",
    shippedAt: Date.now()
  };
  order.shipmentStatus = "return_in_transit";
  pushEvent(order, "退回物流已录入", `退回物流：${order.returnShipment.logisticsCompany} ${order.returnShipment.trackingNo}`);
  orders[idx] = order;
  saveOrders(orders);
  return order;
}

function completeRefund(orderId, refundAmount, remark) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  order.refundStatus = "refunded";
  order.refundAmount = Number(refundAmount || 0);
  order.refundRemark = remark || "";
  order.status = "cancelled";
  order.shipmentStatus = "returned";
  pushEvent(order, "退款完成", `已退款 ¥${order.refundAmount}。${order.refundRemark || ""}`);
  orders[idx] = order;
  saveOrders(orders);
  return order;
}

function submitReshipmentLogistics(orderId, logisticsCompany, trackingNo) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  order.reshipmentStatus = "shipped";
  order.reshipment = {
    ...(order.reshipment || {}),
    logisticsCompany: logisticsCompany || "顺丰速运",
    trackingNo: trackingNo || "",
    shippedAt: Date.now()
  };
  pushEvent(order, "补发已发货", `补发物流：${order.reshipment.logisticsCompany} ${order.reshipment.trackingNo}`);
  orders[idx] = order;
  saveOrders(orders);
  return order;
}

function processReceiveIssue(orderId, action, remark) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  const issue = order.receiveIssue || { status: "none", reason: "" };
  if (action === "approve") {
    order.receiveIssue = {
      ...issue,
      status: "approved",
      leaderRemark: remark || "已同意拒收处理"
    };
    order.status = "cancelled";
    order.shipmentStatus = "returned";
    pushEvent(order, "拒收通过", `团长已同意拒收申请。${order.receiveIssue.leaderRemark}`);
  } else if (action === "reject") {
    order.receiveIssue = {
      ...issue,
      status: "rejected",
      leaderRemark: remark || "拒收条件不满足"
    };
    order.shipmentStatus = "shipped";
    pushEvent(order, "拒收驳回", `团长已驳回拒收申请。原因：${order.receiveIssue.leaderRemark}`);
  }
  orders[idx] = order;
  saveOrders(orders);
  return order;
}

function applyMergeShipment(orderId) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  order.mergeShipment = {
    ...(order.mergeShipment || {}),
    status: "requested",
    relatedOrderNos: order.mergeShipment?.relatedOrderNos || []
  };
  pushEvent(order, "合并申请", "买家已提交合并发货申请，待团长处理。");
  orders[idx] = order;
  saveOrders(orders);
  return order;
}

function applyTransfer(orderId, toUser) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  order.transferRecord = {
    ...(order.transferRecord || {}),
    status: "requested",
    toUser: toUser || "待确认接收人"
  };
  pushEvent(order, "转单申请", `买家已发起转单申请，接收人：${order.transferRecord.toUser}`);
  orders[idx] = order;
  saveOrders(orders);
  return order;
}

function processTransfer(orderId, action, remark) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  const tr = order.transferRecord || { status: "none", fromUser: "", toUser: "" };
  if (action === "approve") {
    order.transferRecord = { ...tr, status: "completed", leaderRemark: remark || "" };
    order.status = "transferred";
    pushEvent(order, "转单完成", `团长已确认转单。${remark ? `备注：${remark}` : ""}`);
  } else if (action === "reject") {
    order.transferRecord = { ...tr, status: "rejected", leaderRemark: remark || "不满足转单条件" };
    pushEvent(order, "转单驳回", `团长驳回转单。原因：${order.transferRecord.leaderRemark}`);
  }
  orders[idx] = order;
  saveOrders(orders);
  return order;
}

function processMergeShipment(orderId, action, remark) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return null;
  const order = orders[idx];
  const merge = order.mergeShipment || { status: "not_applied", relatedOrderNos: [] };
  if (action === "approve") {
    order.mergeShipment = {
      ...merge,
      status: "approved",
      mergeNo: merge.mergeNo || `M-${String(Date.now()).slice(-8)}`,
      leaderRemark: remark || ""
    };
    pushEvent(order, "合并通过", `团长已通过合并发货申请。${remark ? `备注：${remark}` : ""}`);
  } else if (action === "reject") {
    order.mergeShipment = {
      ...merge,
      status: "rejected",
      leaderRemark: remark || "不符合合并条件"
    };
    pushEvent(order, "合并驳回", `团长已驳回合并发货申请。原因：${order.mergeShipment.leaderRemark}`);
  }
  orders[idx] = order;
  saveOrders(orders);
  return order;
}

function shipMergeShipment(mergeNo, payload) {
  const orders = getOrders();
  const targetIds = orders
    .filter((o) => o.mergeShipment && o.mergeShipment.mergeNo === mergeNo && ["approved", "shipped"].includes(o.mergeShipment.status))
    .map((o) => o.id);
  return markShippedBatch(targetIds, payload);
}

function getOrdersByMergeNo(mergeNo) {
  return getOrders().filter((o) => o.mergeShipment && o.mergeShipment.mergeNo === mergeNo);
}

function applyAutoCompleteStrategy(nowTs) {
  const now = Number(nowTs || Date.now());
  const orders = getOrders();
  let changed = false;
  orders.forEach((order) => {
    if (order.status === "shipped" && order.autoCompleteAt) {
      const left = order.autoCompleteAt - now;
      if (left > 0 && left <= 2 * DAY_MS && !order.receiveReminderSent) {
        pushEvent(order, "签收提醒", "订单即将自动完成，如需延长或拒收请及时处理。", now);
        order.receiveReminderSent = true;
        changed = true;
      }
      if (now >= order.autoCompleteAt) {
        order.status = "completed";
        order.shipmentStatus = "signed";
        pushEvent(order, "自动签收", "已达到自动签收时限，系统自动完成订单。", now);
        changed = true;
      }
    }
  });
  if (changed) saveOrders(orders);
  return changed;
}

module.exports = {
  getOrders,
  createOrder,
  getOrderById,
  updateOrderStatus,
  markShipped,
  markShippedBatch,
  confirmReceived,
  applyMergeShipment,
  processMergeShipment,
  applyTransfer,
  processTransfer,
  shipMergeShipment,
  getOrdersByMergeNo,
  applyAutoCompleteStrategy,
  extendReceiveDeadline,
  rejectReceive,
  processReceiveIssue,
  createAfterSale,
  processAfterSale,
  submitReshipmentLogistics,
  submitReturnShipment,
  completeRefund
};
