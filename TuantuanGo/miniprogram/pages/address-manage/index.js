const { getAddresses, addAddress, removeAddress } = require("../../stores/address-store");

Page({
  data: {
    addresses: [],
    name: "",
    phone: "",
    address: ""
  },
  onShow() { this.refresh(); },
  refresh() { this.setData({ addresses: getAddresses() }); },
  onInputName(e) { this.setData({ name: e.detail.value || "" }); },
  onInputPhone(e) { this.setData({ phone: e.detail.value || "" }); },
  onInputAddress(e) { this.setData({ address: e.detail.value || "" }); },
  add() {
    addAddress({ name: this.data.name.trim(), phone: this.data.phone.trim(), address: this.data.address.trim() });
    this.setData({ name: "", phone: "", address: "" });
    this.refresh();
  },
  remove(e) {
    removeAddress(e.currentTarget.dataset.id);
    this.refresh();
  }
});
