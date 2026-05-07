const { isAdmin, setRole } = require("../../stores/session-store");
const { getApplications, approveApplication, rejectApplication, getApprovedLeaderIds } = require("../../stores/leader-application-store");
const { getMarketGroups } = require("../../stores/market-store");
const { getState, toggleGroupBan, toggleUserBan } = require("../../stores/moderation-store");

Page({
  data: {
    tab: "apply",
    applications: [],
    groups: [],
    userIds: [],
    moderation: { bannedUsers: [], bannedGroups: [] }
  },
  onShow() {
    if (!isAdmin()) {
      wx.showModal({
        title: "仅管理员可访问",
        content: "当前不是管理员身份，是否切换为管理员（演示）？",
        success: (res) => {
          if (res.confirm) {
            setRole("admin");
            this.reload();
          } else {
            wx.navigateBack();
          }
        }
      });
      return;
    }
    this.reload();
  },
  reload() {
    const applications = getApplications();
    const moderation = getState();
    const groups = getMarketGroups().map((g) => ({ ...g, banned: moderation.bannedGroups.includes(g.id) }));
    const userSet = new Set(applications.map((x) => x.userId));
    getApprovedLeaderIds().forEach((x) => userSet.add(x));
    const userIds = Array.from(userSet).map((id) => ({ id, banned: moderation.bannedUsers.includes(id) }));
    this.setData({
      applications,
      groups,
      userIds,
      moderation
    });
  },
  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }); },
  approve(e) { approveApplication(e.currentTarget.dataset.id); this.reload(); },
  reject(e) { rejectApplication(e.currentTarget.dataset.id); this.reload(); },
  toggleGroup(e) { toggleGroupBan(e.currentTarget.dataset.id); this.reload(); },
  toggleUser(e) { toggleUserBan(e.currentTarget.dataset.id); this.reload(); }
});
