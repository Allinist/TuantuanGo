Component({
  properties: {
    active: {
      type: String,
      value: "market"
    }
  },
  data: {
    isLeader: false
  },
  lifetimes: {
    attached() {
      this.syncRole();
    }
  },
  pageLifetimes: {
    show() {
      this.syncRole();
    }
  },
  methods: {
    syncRole() {
      const { isLeader } = require("../../stores/session-store");
      this.setData({ isLeader: isLeader() });
    },
    go(e) {
      const page = e.currentTarget.dataset.page;
      if (!page || page === this.properties.active) return;
      wx.redirectTo({ url: `/pages/${page}/index` });
    },
    publishOrSearch() {
      if (!this.data.isLeader) return;
      wx.navigateTo({ url: "/pages/publish/index" });
    }
  }
});
