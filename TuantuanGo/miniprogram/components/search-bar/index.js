Component({
  properties: {
    value: { type: String, value: "" },
    placeholder: { type: String, value: "搜索" }
  },
  methods: {
    onInput(e) {
      const value = e.detail.value || "";
      this.triggerEvent("input", value);
    },
    onSearch() {
      this.triggerEvent("search");
    },
    onClear() {
      this.triggerEvent("clear");
    }
  }
});
