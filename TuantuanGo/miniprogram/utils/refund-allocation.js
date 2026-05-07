function toFen(yuan) {
  return Math.floor(Number(yuan || 0) * 100);
}

function fenToYuanText(fen) {
  return (Number(fen || 0) / 100).toFixed(2);
}

function buildRefundAllocation(items, refundAmountYuan) {
  const refundFen = toFen(refundAmountYuan);
  const list = (items || []).map((it) => {
    const subtotalFen = toFen(Number(it.price || 0) * Number(it.quantity || 0));
    const unitCode = it.unitCode || it.productUnitCodeSnapshot || "";
    return {
      name: it.name,
      unitCode,
      quantity: it.quantity,
      subtotalFen
    };
  });
  const totalFen = list.reduce((s, x) => s + x.subtotalFen, 0);
  if (!list.length || totalFen <= 0 || refundFen <= 0) {
    return { rows: [], remainderFen: refundFen, refundFen };
  }

  let allocatedFen = 0;
  const rows = list.map((x) => {
    const partFen = Math.floor((refundFen * x.subtotalFen) / totalFen);
    allocatedFen += partFen;
    return {
      label: `${x.name}${x.unitCode ? ` [${x.unitCode}]` : ""} x ${x.quantity}`,
      amountFen: partFen
    };
  });
  return {
    rows,
    remainderFen: refundFen - allocatedFen,
    refundFen
  };
}

module.exports = {
  fenToYuanText,
  buildRefundAllocation
};
