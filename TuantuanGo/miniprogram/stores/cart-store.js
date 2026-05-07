const KEY = "ttg_cart_v2";
const MAX_GROUP_ORDERS = 10;

function normalize(raw) {
  if (raw && typeof raw === "object" && raw.groupCarts && typeof raw.groupCarts === "object") {
    return raw;
  }
  if (raw && typeof raw === "object" && raw.groupId && Array.isArray(raw.items)) {
    const groupCarts = {};
    if (raw.groupId) groupCarts[raw.groupId] = raw.items;
    return { groupCarts };
  }
  return { groupCarts: {} };
}

function getCartStore() {
  return normalize(wx.getStorageSync(KEY));
}

function setCartStore(store) {
  wx.setStorageSync(KEY, normalize(store));
}

function getCart(groupId) {
  const store = getCartStore();
  if (groupId) {
    return { groupId, items: store.groupCarts[groupId] || [] };
  }
  const groupIds = Object.keys(store.groupCarts);
  const first = groupIds[0] || "";
  return { groupId: first, items: first ? store.groupCarts[first] : [] };
}

function getAllGroupCarts() {
  const store = getCartStore();
  return Object.keys(store.groupCarts).map((groupId) => ({
    groupId,
    items: store.groupCarts[groupId] || []
  }));
}

function clearCart() {
  setCartStore({ groupCarts: {} });
}

function clearGroupCart(groupId) {
  const store = getCartStore();
  delete store.groupCarts[groupId];
  setCartStore(store);
}

function addItem(groupId, product) {
  const store = getCartStore();
  const groupIds = Object.keys(store.groupCarts);
  const isNewGroup = !store.groupCarts[groupId];
  if (isNewGroup && groupIds.length >= MAX_GROUP_ORDERS) {
    return { ok: false, message: "购物车已满，请先下单" };
  }
  const items = store.groupCarts[groupId] || [];
  const idx = items.findIndex((x) => x.productId === product.id);
  if (idx >= 0) {
    items[idx].quantity += 1;
  } else {
    items.push({
      productId: product.id,
      name: product.name,
      unitCode: product.unitCode || "",
      presaleDate: product.presaleDate || "",
      ruleType: product.mode || "optional",
      price: product.price,
      quantity: 1
    });
  }
  store.groupCarts[groupId] = items;
  setCartStore(store);
  return { ok: true, cart: { groupId, items } };
}

function updateQuantity(groupId, productId, quantity) {
  const store = getCartStore();
  const items = store.groupCarts[groupId] || [];
  const idx = items.findIndex((x) => x.productId === productId);
  if (idx < 0) return { groupId, items };
  if (quantity <= 0) {
    items.splice(idx, 1);
  } else {
    items[idx].quantity = quantity;
  }
  if (!items.length) {
    delete store.groupCarts[groupId];
  } else {
    store.groupCarts[groupId] = items;
  }
  setCartStore(store);
  return { groupId, items: store.groupCarts[groupId] || [] };
}

module.exports = {
  MAX_GROUP_ORDERS,
  getCart,
  getAllGroupCarts,
  clearCart,
  clearGroupCart,
  addItem,
  updateQuantity
};
