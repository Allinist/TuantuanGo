const ROLE_KEY = "ttg_role_v1";
const LEADER_NAME_KEY = "ttg_leader_name_v1";

function getRole() {
  const role = wx.getStorageSync(ROLE_KEY);
  if (role === "leader" || role === "buyer") return role;
  return "buyer";
}

function setRole(role) {
  const safeRole = role === "leader" ? "leader" : "buyer";
  wx.setStorageSync(ROLE_KEY, safeRole);
  wx.setStorageSync("ttg_is_leader", safeRole === "leader");
  return safeRole;
}

function isLeader() {
  return getRole() === "leader";
}

function getLeaderName() {
  const name = wx.getStorageSync(LEADER_NAME_KEY);
  if (name && typeof name === "string") return name;
  return "Miku仓";
}

function setLeaderName(name) {
  const safe = typeof name === "string" && name.trim() ? name.trim() : "Miku仓";
  wx.setStorageSync(LEADER_NAME_KEY, safe);
  return safe;
}

module.exports = {
  getRole,
  setRole,
  isLeader,
  getLeaderName,
  setLeaderName
};
