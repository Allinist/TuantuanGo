const KEY = "ttg_cart_v1";

function getCart() {
  return wx.getStorageSync(KEY) || { groupId: "", items: [] };
}

function setCart(cart) {
  wx.setStorageSync(KEY, cart);
}

function clearCart() {
  setCart({ groupId: "", items: [] });
}

function addItem(groupId, product) {
  const cart = getCart();
  if (cart.groupId && cart.groupId !== groupId) {
    return { ok: false, message: "购物车按团隔离，请先提交或清空当前购物车。" };
  }
  cart.groupId = groupId;
  const idx = cart.items.findIndex((x) => x.productId === product.id);
  if (idx >= 0) {
    cart.items[idx].quantity += 1;
  } else {
    cart.items.push({
      productId: product.id,
      name: product.name,
      unitCode: product.unitCode || "",
      ruleType: product.mode || "optional",
      price: product.price,
      quantity: 1
    });
  }
  setCart(cart);
  return { ok: true, cart };
}

function updateQuantity(productId, quantity) {
  const cart = getCart();
  const idx = cart.items.findIndex((x) => x.productId === productId);
  if (idx < 0) return cart;
  if (quantity <= 0) {
    cart.items.splice(idx, 1);
  } else {
    cart.items[idx].quantity = quantity;
  }
  if (!cart.items.length) cart.groupId = "";
  setCart(cart);
  return cart;
}

module.exports = {
  getCart,
  setCart,
  clearCart,
  addItem,
  updateQuantity
};
