const ROLE_KEY = "ttg_role_v2";
const LEADER_NAME_KEY = "ttg_leader_name_v2";
const USER_ID_KEY = "ttg_user_id_v1";

function getUserId() {
  const saved = wx.getStorageSync(USER_ID_KEY);
  if (saved && typeof saved === "string") return saved;
  const uid = "user_1024";
  wx.setStorageSync(USER_ID_KEY, uid);
  return uid;
}

function getRole() {
  const role = wx.getStorageSync(ROLE_KEY);
  if (role === "leader" || role === "admin" || role === "buyer") return role;
  return "buyer";
}

function setRole(role) {
  const safeRole = role === "leader" || role === "admin" ? role : "buyer";
  wx.setStorageSync(ROLE_KEY, safeRole);
  wx.setStorageSync("ttg_is_leader", safeRole === "leader");
  return safeRole;
}

function isLeader() {
  return getRole() === "leader";
}

function isAdmin() {
  return getRole() === "admin";
}

function getLeaderName() {
  const name = wx.getStorageSync(LEADER_NAME_KEY);
  if (name && typeof name === "string") return name;
  return "团长示例";
}

function setLeaderName(name) {
  const safe = typeof name === "string" && name.trim() ? name.trim() : "团长示例";
  wx.setStorageSync(LEADER_NAME_KEY, safe);
  return safe;
}

module.exports = {
  getUserId,
  getRole,
  setRole,
  isLeader,
  isAdmin,
  getLeaderName,
  setLeaderName
};
