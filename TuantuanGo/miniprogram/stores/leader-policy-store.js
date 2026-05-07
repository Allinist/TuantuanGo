const KEY = "ttg_leader_policy_v1";

function getLeaderPolicy() {
  return (
    wx.getStorageSync(KEY) || {
      autoCompleteDays: 14,
      groupRules: {
        byQty: { enabled: true, value: 10, scope: "order" },
        byAmount: { enabled: true, value: 100, scope: "order" },
        byPeople: { enabled: false, value: 10, scope: "order" }
      }
    }
  );
}

function setLeaderPolicy(policy) {
  const prev = getLeaderPolicy();
  const next = {
    ...prev,
    ...policy,
    autoCompleteDays: Number(policy.autoCompleteDays || prev.autoCompleteDays || 14)
  };
  wx.setStorageSync(KEY, next);
  return next;
}

module.exports = {
  getLeaderPolicy,
  setLeaderPolicy
};
