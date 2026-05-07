const {
  getProducts,
  addProduct,
  updateProduct,
  removeProduct,
  POOLS,
  setProductPoolBinding,
  getProductPools,
  getBindings
} = require("../../stores/product-pool-store");

const POOL_OPTIONS = [
  { key: "direct", label: "直出" },
  { key: "main", label: "主品" },
  { key: "bundle", label: "捆物" },
  { key: "group", label: "拼团" }
];

Page({
  data: {
    keyword: "",
    sortKey: "updated_desc",
    activePool: "all",
    poolCount: { all: 0, direct: 0, main: 0, bundle: 0, group: 0 },
    poolOptions: POOL_OPTIONS,
    products: [],
    editId: "",
    form: { name: "", price: 0, stock: 0, unmade: false, images: [] },
    formPools: []
  },
  onShow() {
    this.reloadProducts();
  },
  isAllPool() {
    return this.data.activePool === "all";
  },
  onKeywordInput(e) {
    this.setData({ keyword: String(e.detail || "") });
  },
  onSearchTap() {
    this.reloadProducts();
  },
  clearKeyword() {
    this.setData({ keyword: "" });
    this.reloadProducts();
  },
  switchSort(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ sortKey: key });
    this.reloadProducts();
  },
  switchPool(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ activePool: key });
    if (key !== "all") {
      this.setData({ editId: "", form: { name: "", price: 0, stock: 0, unmade: false, images: [] }, formPools: [] });
    }
    this.reloadProducts();
  },
  reloadProducts() {
    const keyword = (this.data.keyword || "").trim().toLowerCase();
    const sortKey = this.data.sortKey;
    const activePool = this.data.activePool;
    const bindings = getBindings();
    const poolCount = {
      all: getProducts().length,
      direct: (bindings.direct || []).length,
      main: (bindings.main || []).length,
      bundle: (bindings.bundle || []).length,
      group: (bindings.group || []).length
    };
    let list = getProducts().map((p) => ({ ...p, pools: getProductPools(p.id) }));
    if (activePool !== "all") {
      list = list.filter((p) => p.pools.includes(activePool));
    }
    if (keyword) {
      list = list.filter((p) => (p.name || "").toLowerCase().includes(keyword));
    }
    list.sort((a, b) => {
      if (sortKey === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortKey === "stock_desc") return Number(b.stock || 0) - Number(a.stock || 0);
      return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
    });
    this.setData({ products: list, poolCount });
  },
  onNameInput(e) {
    if (!this.isAllPool()) return;
    this.setData({ form: { ...this.data.form, name: e.detail.value || "" } });
  },
  onEditorFormChange(e) {
    if (!this.isAllPool()) return;
    const patch = (e.detail && e.detail.patch) || {};
    this.setData({ form: { ...this.data.form, ...patch } });
  },
  onEditorFormPoolChange(e) {
    if (!this.isAllPool()) return;
    this.setData({ formPools: e.detail || [] });
  },
  onPriceInput(e) {
    if (!this.isAllPool()) return;
    this.setData({ form: { ...this.data.form, price: Number(e.detail.value || 0) } });
  },
  onStockInput(e) {
    if (!this.isAllPool()) return;
    this.setData({ form: { ...this.data.form, stock: Number(e.detail.value || 0) } });
  },
  toggleUnmade() {
    if (!this.isAllPool()) return;
    this.setData({ form: { ...this.data.form, unmade: !this.data.form.unmade } });
  },
  chooseFormImages() {
    if (!this.isAllPool()) return;
    const remain = 4 - (this.data.form.images || []).length;
    if (remain <= 0) {
      wx.showToast({ title: "最多4张图", icon: "none" });
      return;
    }
    wx.chooseImage({
      count: remain,
      success: (res) => {
        const next = [...(this.data.form.images || []), ...(res.tempFilePaths || [])].slice(0, 4);
        this.setData({ form: { ...this.data.form, images: next } });
      }
    });
  },
  removeFormImage(e) {
    if (!this.isAllPool()) return;
    const idx = Number(e.currentTarget.dataset.idx);
    const next = [...(this.data.form.images || [])];
    next.splice(idx, 1);
    this.setData({ form: { ...this.data.form, images: next } });
  },
  startEdit(e) {
    if (!this.isAllPool()) return;
    const id = e.currentTarget.dataset.id;
    const item = this.data.products.find((x) => x.id === id);
    if (!item) return;
    this.setData({
      editId: id,
      form: {
        name: item.name || "",
        price: Number(item.price || 0),
        stock: Number(item.stock || 0),
        unmade: !!item.unmade,
        images: Array.isArray(item.images) ? item.images.slice(0, 4) : []
      },
      formPools: getProductPools(id)
    });
  },
  cancelEdit() {
    if (!this.isAllPool()) return;
    this.setData({ editId: "", form: { name: "", price: 0, stock: 0, unmade: false, images: [] }, formPools: [] });
  },
  saveProduct() {
    if (!this.isAllPool()) return;
    const f = this.data.form;
    if (!f.name.trim()) {
      wx.showToast({ title: "请填写商品名", icon: "none" });
      return;
    }
    let productId = this.data.editId;
    if (productId) {
      updateProduct(productId, f);
      wx.showToast({ title: "已更新商品", icon: "success" });
    } else {
      const created = addProduct(f);
      productId = created.id;
      wx.showToast({ title: "已新增商品", icon: "success" });
    }
    POOLS.forEach((poolKey) => {
      const enabled = (this.data.formPools || []).includes(poolKey);
      setProductPoolBinding(productId, poolKey, enabled);
    });
    this.setData({ editId: "", form: { name: "", price: 0, stock: 0, unmade: false, images: [] }, formPools: [] });
    this.reloadProducts();
  },
  deleteProduct(e) {
    if (!this.isAllPool()) return;
    removeProduct(e.currentTarget.dataset.id);
    this.reloadProducts();
  },
  togglePoolTag(e) {
    const id = e.currentTarget.dataset.id;
    const pool = e.currentTarget.dataset.pool;
    const item = this.data.products.find((x) => x.id === id);
    const has = item && item.pools && item.pools.includes(pool);
    setProductPoolBinding(id, pool, !has);
    this.reloadProducts();
  },
  previewImage(e) {
    const id = e.currentTarget.dataset.id;
    const idx = Number(e.currentTarget.dataset.idx || 0);
    const item = this.data.products.find((x) => x.id === id);
    const urls = (item && item.images) || [];
    if (!urls.length) return;
    wx.previewImage({ current: urls[idx] || urls[0], urls });
  }
});
