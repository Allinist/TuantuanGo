const KEY = "ttg_leader_apps_v1";
const APPROVED_KEY = "ttg_leader_approved_v1";

function getApplications() {
  const saved = wx.getStorageSync(KEY);
  return Array.isArray(saved) ? saved : [];
}

function saveApplications(list) {
  wx.setStorageSync(KEY, list || []);
}

function submitApplication(payload) {
  const list = getApplications();
  const app = {
    id: `la_${Date.now()}`,
    userId: payload.userId,
    name: payload.name || "",
    phone: payload.phone || "",
    reason: payload.reason || "",
    status: "pending",
    createdAt: Date.now()
  };
  list.unshift(app);
  saveApplications(list);
  return app;
}

function updateApplication(id, patch) {
  const next = getApplications().map((x) => (x.id === id ? { ...x, ...patch } : x));
  saveApplications(next);
}

function getApprovedLeaderIds() {
  const saved = wx.getStorageSync(APPROVED_KEY);
  return Array.isArray(saved) ? saved : [];
}

function saveApprovedLeaderIds(ids) {
  wx.setStorageSync(APPROVED_KEY, ids || []);
}

function approveApplication(id) {
  const list = getApplications();
  const target = list.find((x) => x.id === id);
  if (!target) return null;
  target.status = "approved";
  target.reviewedAt = Date.now();
  saveApplications(list);
  const ids = new Set(getApprovedLeaderIds());
  ids.add(target.userId);
  saveApprovedLeaderIds(Array.from(ids));
  return target;
}

function rejectApplication(id) {
  const list = getApplications();
  const target = list.find((x) => x.id === id);
  if (!target) return null;
  target.status = "rejected";
  target.reviewedAt = Date.now();
  saveApplications(list);
  return target;
}

function isLeaderApproved(userId) {
  return getApprovedLeaderIds().includes(userId);
}

module.exports = {
  getApplications,
  submitApplication,
  updateApplication,
  getApprovedLeaderIds,
  approveApplication,
  rejectApplication,
  isLeaderApproved
};
