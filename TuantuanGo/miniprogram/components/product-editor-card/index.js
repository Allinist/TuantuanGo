const MAX_IMAGES = 4;

Component({
  properties: {
    product: { type: Object, value: {} },
    showRoleTag: { type: Boolean, value: false },
    showPresale: { type: Boolean, value: false },
    showRule: { type: Boolean, value: false },
    showPoolSelector: { type: Boolean, value: false },
    poolSelection: { type: Array, value: [] },
    poolOptions: { type: Array, value: [] },
    canRemove: { type: Boolean, value: true },
    removeText: { type: String, value: "删除该商品" }
  },
  methods: {
    emitPatch(patch) {
      this.triggerEvent("change", { patch });
    },
    onNameInput(e) { this.emitPatch({ name: e.detail.value || "" }); },
    onPriceInput(e) { this.emitPatch({ price: Number(e.detail.value || 0) }); },
    onStockInput(e) { this.emitPatch({ stock: Number(e.detail.value || 0) }); },
    onDateChange(e) { this.emitPatch({ presaleDate: e.detail.value || "" }); },
    onRuleChange(e) { this.emitPatch({ ruleInput: e.detail || { qty: "", amount: "", people: "" } }); },
    onTogglePool(e) {
      const key = e.currentTarget.dataset.key;
      const set = new Set(this.properties.poolSelection || []);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      this.triggerEvent("poolchange", Array.from(set));
    },
    chooseImage() {
      const images = (this.properties.product && this.properties.product.images) || [];
      const remain = MAX_IMAGES - images.length;
      if (remain <= 0) {
        wx.showToast({ title: "最多4张图", icon: "none" });
        return;
      }
      wx.chooseImage({
        count: remain,
        success: (res) => {
          const next = [...images, ...((res.tempFilePaths || []).filter(Boolean))].slice(0, MAX_IMAGES);
          this.emitPatch({ images: next });
        }
      });
    },
    removeImage(e) {
      const idx = Number(e.currentTarget.dataset.idx);
      const images = [ ...(((this.properties.product || {}).images) || []) ];
      images.splice(idx, 1);
      this.emitPatch({ images });
    },
    removeProduct() {
      this.triggerEvent("remove");
    }
  }
});
