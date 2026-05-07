Component({
  properties: {
    value: {
      type: Number,
      value: 0
    },
    min: {
      type: Number,
      value: 0
    },
    productId: {
      type: String,
      value: ""
    },
    groupId: {
      type: String,
      value: ""
    }
  },
  methods: {
    emitChange(value) {
      const safeValue = Number.isFinite(value) ? value : 0;
      this.triggerEvent("change", {
        value: safeValue,
        productId: this.properties.productId,
        groupId: this.properties.groupId
      });
    },
    minus() {
      const next = (this.properties.value || 0) - 1;
      this.emitChange(next < this.properties.min ? this.properties.min : next);
    },
    plus() {
      this.emitChange((this.properties.value || 0) + 1);
    },
    onInput(e) {
      const raw = (e.detail.value || "").trim();
      if (raw === "") {
        this.emitChange(0);
        return;
      }
      const parsed = parseInt(raw, 10);
      if (Number.isNaN(parsed) || parsed < this.properties.min) {
        this.emitChange(this.properties.min);
        return;
      }
      this.emitChange(parsed);
    }
  }
});
