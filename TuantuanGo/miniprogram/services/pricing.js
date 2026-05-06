function calcOrderAmount(items, fees) {
  const productAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = productAmount >= fees.freeShippingThreshold ? 0 : fees.shippingFee;
  const packingFee = fees.packingFee || 0;
  const materialFee = fees.materialFee || 0;
  const tipFee = fees.tipFee || 0;
  const totalAmount = productAmount + shippingFee + packingFee + materialFee + tipFee;
  return {
    productAmount,
    shippingFee,
    packingFee,
    materialFee,
    tipFee,
    totalAmount
  };
}

module.exports = {
  calcOrderAmount
};
