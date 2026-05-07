const { addPublishedGroup, getGroupById, updatePublishedGroup } = require("../../stores/market-store");
const MAX_PRODUCT_IMAGES = 4;

Page({
  data: {
    editGroupId: "",
    groupTitle: "",
    groupCover: "",
    saleRuleType: "direct",
    groupType: "multi",
    bundleRequiredAmount: 50,
    departureCondition: "满 10 件发车",
    batchPresaleDate: "",
    products: [
      { id: "np1", name: "新品A", price: 39, stock: 10, presaleDate: "", images: [] }
    ]
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
      bundleRequiredAmount: group.bundleRequiredAmount || 50,
      departureCondition: group.departureCondition || "满 10 件发车",
      products: (group.products && group.products.length)
        ? group.products.map((p) => ({
          ...p,
          images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : [])
        }))
        : this.data.products
    });
  },
  onTitleInput(e) {
    this.setData({ groupTitle: (e.detail.value || "").trim() });
  },
  chooseGroupCover() {
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      success: (res) => {
        const path = (res.tempFilePaths && res.tempFilePaths[0]) || "";
        if (!path) return;
        this.setData({ groupCover: path });
      }
    });
  },
  onBatchDateChange(e) {
    this.setData({ batchPresaleDate: e.detail.value });
  },
  onBundleAmountInput(e) {
    this.setData({ bundleRequiredAmount: Number(e.detail.value || 0) });
  },
  onDepartureInput(e) {
    this.setData({ departureCondition: e.detail.value || "" });
  },
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    if (!mode || mode === this.data.saleRuleType) return;
    this.setData({ saleRuleType: mode });
  },
  switchGroupType(e) {
    const type = e.currentTarget.dataset.type;
    if (!type || type === this.data.groupType) return;
    this.setData({ groupType: type });
  },
  applyBatchPresale() {
    if (!this.data.batchPresaleDate) {
      wx.showToast({ title: "请先选择批量预售日期", icon: "none" });
      return;
    }
    const products = this.data.products.map((p) => ({ ...p, presaleDate: this.data.batchPresaleDate }));
    this.setData({ products });
    wx.showToast({ title: "已批量应用", icon: "success" });
  },
  onSingleDateChange(e) {
    const id = e.currentTarget.dataset.id;
    const date = e.detail.value;
    const products = this.data.products.map((p) => (p.id === id ? { ...p, presaleDate: date } : p));
    this.setData({ products });
  },
  addProduct() {
    const product = {
      id: `np_${Date.now()}`,
      name: `新品${this.data.products.length + 1}`,
      price: 39,
      stock: 10,
      presaleDate: "",
      images: []
    };
    this.setData({ products: [...this.data.products, product] });
  },
  removeProduct(e) {
    const id = e.currentTarget.dataset.id;
    const next = this.data.products.filter((p) => p.id !== id);
    this.setData({ products: next.length ? next : this.data.products });
  },
  onProductNameInput(e) {
    const id = e.currentTarget.dataset.id;
    const value = e.detail.value || "";
    this.setData({
      products: this.data.products.map((p) => (p.id === id ? { ...p, name: value } : p))
    });
  },
  onProductPriceInput(e) {
    const id = e.currentTarget.dataset.id;
    const value = Number(e.detail.value || 0);
    this.setData({
      products: this.data.products.map((p) => (p.id === id ? { ...p, price: value } : p))
    });
  },
  onProductStockInput(e) {
    const id = e.currentTarget.dataset.id;
    const value = Number(e.detail.value || 0);
    this.setData({
      products: this.data.products.map((p) => (p.id === id ? { ...p, stock: value } : p))
    });
  },
  chooseProductImage(e) {
    const id = e.currentTarget.dataset.id;
    const product = this.data.products.find((p) => p.id === id);
    const current = (product && product.images) || [];
    const remain = MAX_PRODUCT_IMAGES - current.length;
    if (remain <= 0) {
      wx.showToast({ title: "单个商品最多4张图片", icon: "none" });
      return;
    }
    wx.chooseImage({
      count: remain,
      sizeType: ["compressed"],
      success: (res) => {
        const paths = (res.tempFilePaths || []).filter(Boolean);
        if (!paths.length) return;
        this.setData({
          products: this.data.products.map((p) => (
            p.id === id ? { ...p, images: [...(p.images || []), ...paths].slice(0, MAX_PRODUCT_IMAGES) } : p
          ))
        });
      }
    });
  },
  removeProductImage(e) {
    const id = e.currentTarget.dataset.id;
    const idx = Number(e.currentTarget.dataset.idx);
    this.setData({
      products: this.data.products.map((p) => {
        if (p.id !== id) return p;
        const next = [...(p.images || [])];
        next.splice(idx, 1);
        return { ...p, images: next };
      })
    });
  },
  submitPublish() {
    const title = this.data.groupTitle || `新品团 ${new Date().toLocaleDateString()}`;
    const coverImage = this.data.groupCover || "https://dummyimage.com/200x200/ffd8ce/8c1900&text=NEW";
    const products = this.data.products.map((p) => ({
      id: p.id,
      name: p.name || "未命名商品",
      price: Number(p.price || 0),
      stock: Number(p.stock || 0),
      presaleDate: p.presaleDate || "",
      images: Array.isArray(p.images) ? p.images.slice(0, MAX_PRODUCT_IMAGES) : []
    }));
    const minPrice = products.length ? Math.min(...products.map((p) => p.price || 0)) : 0;
    const stock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
    if (this.data.editGroupId) {
      updatePublishedGroup(this.data.editGroupId, {
        title,
        coverImage,
        products,
        minPrice,
        stock,
        saleRuleType: this.data.saleRuleType,
        groupType: this.data.groupType,
        bundleRequiredAmount: this.data.bundleRequiredAmount,
        departureCondition: this.data.departureCondition
      });
      wx.showToast({ title: "已保存编辑", icon: "success" });
    } else {
      addPublishedGroup({
        title,
        coverImage,
        products,
        minPrice,
        stock,
        saleRuleType: this.data.saleRuleType,
        category: "谷子",
        groupType: this.data.groupType,
        bundleRequiredAmount: this.data.bundleRequiredAmount,
        departureCondition: this.data.departureCondition
      });
      wx.showToast({ title: "发布成功", icon: "success" });
    }
    setTimeout(() => {
      wx.reLaunch({ url: "/pages/market/index" });
    }, 250);
  }
});
