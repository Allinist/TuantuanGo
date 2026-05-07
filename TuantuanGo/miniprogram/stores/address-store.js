const KEY = "ttg_addresses_v1";

function getAddresses() {
  const saved = wx.getStorageSync(KEY);
  return Array.isArray(saved) ? saved : [];
}

function saveAddresses(list) {
  wx.setStorageSync(KEY, list || []);
}

function addAddress(payload) {
  const list = getAddresses();
  const item = {
    id: `addr_${Date.now()}`,
    name: payload.name || "",
    phone: payload.phone || "",
    address: payload.address || ""
  };
  list.unshift(item);
  saveAddresses(list);
  return item;
}

function updateAddress(id, patch) {
  const next = getAddresses().map((x) => (x.id === id ? { ...x, ...patch } : x));
  saveAddresses(next);
}

function removeAddress(id) {
  saveAddresses(getAddresses().filter((x) => x.id !== id));
}

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  removeAddress
};
