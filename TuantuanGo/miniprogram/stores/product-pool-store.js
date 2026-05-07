const KEY = "ttg_product_pool_v2";

const POOLS = ["direct", "main", "bundle", "group"];

function defaultData() {
  return {
    products: [],
    bindings: { direct: [], main: [], bundle: [], group: [] }
  };
}

function getData() {
  const saved = wx.getStorageSync(KEY);
  if (!saved || typeof saved !== "object") return defaultData();
  const base = defaultData();
  return {
    products: Array.isArray(saved.products) ? saved.products : [],
    bindings: { ...base.bindings, ...(saved.bindings || {}) }
  };
}

function saveData(data) {
  wx.setStorageSync(KEY, data);
}

function getProducts() {
  return getData().products;
}

function getBindings() {
  return getData().bindings;
}

function getPool(poolKey) {
  const data = getData();
  const ids = data.bindings[poolKey] || [];
  return ids.map((id) => data.products.find((p) => p.id === id)).filter(Boolean);
}

function addProduct(payload) {
  const data = getData();
  const item = {
    id: `sp_${Date.now()}`,
    name: payload.name || "未命名商品",
    price: Number(payload.price || 0),
    stock: Number(payload.stock || 0),
    unmade: !!payload.unmade,
    images: Array.isArray(payload.images) ? payload.images.slice(0, 4) : [],
    updatedAt: Date.now()
  };
  data.products.unshift(item);
  saveData(data);
  return item;
}

function updateProduct(id, patch) {
  const data = getData();
  data.products = data.products.map((p) => (
    p.id === id
      ? {
        ...p,
        ...patch,
        price: Number(patch.price != null ? patch.price : p.price || 0),
        stock: Number(patch.stock != null ? patch.stock : p.stock || 0),
        images: Array.isArray(patch.images) ? patch.images.slice(0, 4) : (p.images || []),
        updatedAt: Date.now()
      }
      : p
  ));
  saveData(data);
}

function removeProduct(id) {
  const data = getData();
  data.products = data.products.filter((p) => p.id !== id);
  const nextBindings = { ...data.bindings };
  POOLS.forEach((k) => {
    nextBindings[k] = (nextBindings[k] || []).filter((x) => x !== id);
  });
  data.bindings = nextBindings;
  saveData(data);
}

function setProductPoolBinding(productId, poolKey, enabled) {
  const data = getData();
  const list = new Set(data.bindings[poolKey] || []);
  if (enabled) list.add(productId);
  else list.delete(productId);
  data.bindings[poolKey] = Array.from(list);
  saveData(data);
}

function getProductPools(productId) {
  const bindings = getBindings();
  return POOLS.filter((key) => (bindings[key] || []).includes(productId));
}

module.exports = {
  POOLS,
  getProducts,
  getBindings,
  getPool,
  addProduct,
  updateProduct,
  removeProduct,
  setProductPoolBinding,
  getProductPools
};
