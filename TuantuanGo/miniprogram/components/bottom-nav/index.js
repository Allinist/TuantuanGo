Component({
  properties: {
    active: {
      type: String,
      value: "market"
    }
  },
  methods: {
    go(e) {
      const page = e.currentTarget.dataset.page;
      if (!page || page === this.properties.active) return;
      wx.redirectTo({ url: `/pages/${page}/index` });
    },
    publish() {
      const isLeader = !!wx.getStorageSync("ttg_is_leader");
      if (isLeader) {
        wx.navigateTo({ url: "/pages/publish/index" });
      } else {
        wx.navigateTo({ url: "/pages/leader-apply/index" });
      }
    }
  }
});
