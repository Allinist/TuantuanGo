const { getUserId } = require("../../stores/session-store");
const { submitApplication, getApplications } = require("../../stores/leader-application-store");

Page({
  data: {
    name: "",
    phone: "",
    reason: "",
    latest: null
  },
  onShow() {
    const uid = getUserId();
    const latest = getApplications().find((x) => x.userId === uid) || null;
    this.setData({ latest });
  },
  onInputName(e) { this.setData({ name: e.detail.value || "" }); },
  onInputPhone(e) { this.setData({ phone: e.detail.value || "" }); },
  onInputReason(e) { this.setData({ reason: e.detail.value || "" }); },
  submitApply() {
    const payload = {
      userId: getUserId(),
      name: this.data.name.trim(),
      phone: this.data.phone.trim(),
      reason: this.data.reason.trim()
    };
    submitApplication(payload);
    wx.showToast({ title: "申请已提交", icon: "success" });
    this.setData({ name: "", phone: "", reason: "" });
    this.onShow();
  }
});
