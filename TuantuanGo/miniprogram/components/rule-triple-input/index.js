Component({
  properties: {
    value: {
      type: Object,
      value: { qty: "", amount: "", people: "" }
    }
  },
  methods: {
    onInput(e) {
      const key = e.currentTarget.dataset.key;
      const val = e.detail.value || "";
      const next = { ...(this.properties.value || {}), [key]: val };
      this.triggerEvent("change", next);
    }
  }
});
