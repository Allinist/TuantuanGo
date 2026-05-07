const { addPublishedGroup, getGroupById, updatePublishedGroup } = require("../../stores/market-store");
const { getPool, getProducts, addProduct, setProductPoolBinding } = require("../../stores/product-pool-store");
const { getUserId } = require("../../stores/session-store");
const { isUserBanned } = require("../../stores/moderation-store");

const MAX_PRODUCT_IMAGES = 4;

function emptyRuleInput() {
  return { qty: "", amount: "", people: "" };
}

function parseRuleInput(input) {
  const qty = Number(input.qty || 0);
  const amount = Number(input.amount || 0);
  const people = Number(input.people || 0);
  return {
    byQty: { enabled: !!qty, value: qty },
    byAmount: { enabled: !!amount, value: amount },
    byPeople: { enabled: !!people, value: people }
  };
}

Page({
  data: {
    editGroupId: "",
    groupTitle: "",
    groupCover: "",
    saleRuleType: "direct",
    groupType: "multi",
    itemType: "goods",
    bundleRequiredAmount: 50,
    autoCompleteDays: 14,
    groupRuleInput: emptyRuleInput(),
    batchPresaleDate: "",
    products: [{ id: "np1", productId: "", name: "新品A", price: 39, stock: 10, presaleDate: "", images: [], bundleRole: "", ruleInput: emptyRuleInput() }]
  },
  onLoad(query) {
    const groupId = query && query.groupId ? query.groupId : "";
    if (!groupId) return;
    const group = getGroupById(groupId);
    if (!group) return;
    this.setData({
      editGroupId: groupId,
      groupTitle: group.title || "",
      groupCover: group.coverImage || "",
      saleRuleType: group.saleRuleType || "direct",
      groupType: group.groupType || "multi",
      itemType: group.category === "文创" ? "cultural" : "goods",
      bundleRequiredAmount: group.bundleRequiredAmount || 50,
      autoCompleteDays: Number(group.autoCompleteDays || 14),
      groupRuleInput: group.groupRuleInput || emptyRuleInput(),
      products: (group.products || []).map((p) => ({ ...p, ruleInput: p.ruleInput || emptyRuleInput() }))
    });
  },
  onTitleInput(e) { this.setData({ groupTitle: (e.detail.value || "").trim() }); },
  chooseGroupCover() {
    wx.chooseImage({ count: 1, success: (res) => this.setData({ groupCover: (res.tempFilePaths || [])[0] || "" }) });
  },
  onBatchDateChange(e) { this.setData({ batchPresaleDate: e.detail.value }); },
  onBundleAmountInput(e) { this.setData({ bundleRequiredAmount: Number(e.detail.value || 0) }); },
  onAutoCompleteDaysInput(e) { this.setData({ autoCompleteDays: Number(e.detail.value || 14) }); },
  switchMode(e) { this.setData({ saleRuleType: e.currentTarget.dataset.mode }); },
  switchGroupType(e) { this.setData({ groupType: e.currentTarget.dataset.type }); },
  switchItemType(e) { this.setData({ itemType: e.currentTarget.dataset.type }); },
  onGroupRuleInputChange(e) { this.setData({ groupRuleInput: e.detail || emptyRuleInput() }); },
  applyGroupRuleToAll() {
    const source = this.data.groupRuleInput || emptyRuleInput();
    this.setData({ products: this.data.products.map((p) => ({ ...p, ruleInput: { ...source } })) });
  },
  applyBatchPresale() {
    if (!this.data.batchPresaleDate) return wx.showToast({ title: "请先选择批量预售日期", icon: "none" });
    this.setData({ products: this.data.products.map((p) => ({ ...p, presaleDate: this.data.batchPresaleDate })) });
  },
  addProductAndBind(poolKey, role = "") {
    const created = addProduct({ name: "新品", price: 0, stock: 0, unmade: false, images: [] });
    if (poolKey) setProductPoolBinding(created.id, poolKey, true);
    this.setData({
      products: [...this.data.products, { id: `np_${Date.now()}`, productId: created.id, name: created.name, price: 0, stock: 0, presaleDate: "", images: [], bundleRole: role, ruleInput: emptyRuleInput() }]
    });
  },
  addProductFromAll(e) {
    const role = e.currentTarget.dataset.role || "";
    const bindPool = e.currentTarget.dataset.bindPool || "";
    const list = getProducts();
    if (!list.length) return wx.showToast({ title: "商品池暂无商品", icon: "none" });
    wx.showActionSheet({
      itemList: list.map((x) => `${x.name} ¥${x.price} 库存${x.stock}`),
      success: (res) => {
        const picked = list[res.tapIndex];
        if (!picked) return;
        if (bindPool) setProductPoolBinding(picked.id, bindPool, true);
        const item = {
          id: `np_${Date.now()}`,
          productId: picked.id,
          name: picked.name,
          price: Number(picked.price || 0),
          stock: Number(picked.stock || 0),
          presaleDate: "",
          images: (picked.images || []).slice(0, MAX_PRODUCT_IMAGES),
          bundleRole: role,
          ruleInput: emptyRuleInput()
        };
        this.setData({ products: [...this.data.products, item] });
      }
    });
  },
  addProductFromPool(e) {
    const pool = e.currentTarget.dataset.pool;
    const role = e.currentTarget.dataset.role || "";
    const list = getPool(pool);
    if (!list.length) return wx.showToast({ title: "该池暂无商品", icon: "none" });
    wx.showActionSheet({
      itemList: list.map((x) => `${x.name} ¥${x.price} 库存${x.stock}`),
      success: (res) => {
        const picked = list[res.tapIndex];
        if (!picked) return;
        const item = {
          id: `np_${Date.now()}`,
          productId: picked.id,
          name: picked.name,
          price: Number(picked.price || 0),
          stock: Number(picked.stock || 0),
          presaleDate: "",
          images: (picked.images || []).slice(0, MAX_PRODUCT_IMAGES),
          bundleRole: role,
          ruleInput: emptyRuleInput()
        };
        this.setData({ products: [...this.data.products, item] });
      }
    });
  },
  asyncAddToBindPoolAndUse(e) {
    this.addProductAndBind(e.currentTarget.dataset.bindPool || "", e.currentTarget.dataset.role || "");
  },
  asyncAddToMainPoolAndUse() { this.addProductAndBind("main", "main"); },
  addProductWithRole(e) { this.addProductAndBind("", e.currentTarget.dataset.role || ""); },
  onEditorChange(e) {
    const id = e.currentTarget.dataset.id;
    const patch = (e.detail && e.detail.patch) || {};
    this.patchProduct(id, patch);
  },
  onEditorRemove(e) {
    const id = e.currentTarget.dataset.id;
    const next = this.data.products.filter((p) => p.id !== id);
    if (!next.length) return wx.showToast({ title: "至少保留一个商品", icon: "none" });
    this.setData({ products: next });
  },
  patchProduct(id, patch) {
    this.setData({ products: this.data.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  },
  submitPublish() {
    if (isUserBanned(getUserId())) {
      return wx.showToast({ title: "当前账号已被管理员限制发布", icon: "none" });
    }
    if (this.data.autoCompleteDays < 7 || this.data.autoCompleteDays > 28) {
      return wx.showToast({ title: "自动签收请设置 7-28 天", icon: "none" });
    }
    const products = this.data.products.map((p) => ({
      ...p,
      images: (p.images || []).slice(0, 4),
      groupRules: this.data.saleRuleType === "group_buy" ? parseRuleInput(p.ruleInput || emptyRuleInput()) : null
    }));
    if (this.data.saleRuleType === "bundle_min_amount") {
      const hasMain = products.some((p) => p.bundleRole === "main");
      const hasBundle = products.some((p) => p.bundleRole === "bundle");
      if (!hasMain || !hasBundle) return wx.showToast({ title: "捆出需同时有主品和捆物", icon: "none" });
    }
    const payload = {
      title: this.data.groupTitle || `新品团 ${new Date().toLocaleDateString()}`,
      coverImage: this.data.groupCover || "",
      products,
      minPrice: products.length ? Math.min(...products.map((p) => Number(p.price || 0))) : 0,
      stock: products.reduce((s, p) => s + Number(p.stock || 0), 0),
      saleRuleType: this.data.saleRuleType,
      category: this.data.itemType === "cultural" ? "文创" : "谷子",
      groupType: this.data.groupType,
      bundleRequiredAmount: this.data.bundleRequiredAmount,
      autoCompleteDays: this.data.autoCompleteDays,
      groupRules: this.data.saleRuleType === "group_buy" ? parseRuleInput(this.data.groupRuleInput || emptyRuleInput()) : null,
      groupRuleInput: this.data.groupRuleInput || emptyRuleInput(),
      departureCondition: ""
    };
    if (this.data.editGroupId) updatePublishedGroup(this.data.editGroupId, payload);
    else addPublishedGroup(payload);
    wx.showToast({ title: "发布成功", icon: "success" });
    setTimeout(() => wx.reLaunch({ url: "/pages/market/index" }), 250);
  }
});
