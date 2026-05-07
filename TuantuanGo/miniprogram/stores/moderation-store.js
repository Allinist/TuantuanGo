const KEY = "ttg_moderation_v1";

function getState() {
  const saved = wx.getStorageSync(KEY);
  return {
    bannedUsers: (saved && Array.isArray(saved.bannedUsers)) ? saved.bannedUsers : [],
    bannedGroups: (saved && Array.isArray(saved.bannedGroups)) ? saved.bannedGroups : []
  };
}

function saveState(state) {
  wx.setStorageSync(KEY, state);
}

function isUserBanned(userId) {
  return getState().bannedUsers.includes(userId);
}

function isGroupBanned(groupId) {
  return getState().bannedGroups.includes(groupId);
}

function toggleUserBan(userId) {
  const state = getState();
  const set = new Set(state.bannedUsers);
  if (set.has(userId)) set.delete(userId);
  else set.add(userId);
  state.bannedUsers = Array.from(set);
  saveState(state);
}

function toggleGroupBan(groupId) {
  const state = getState();
  const set = new Set(state.bannedGroups);
  if (set.has(groupId)) set.delete(groupId);
  else set.add(groupId);
  state.bannedGroups = Array.from(set);
  saveState(state);
}

module.exports = {
  getState,
  isUserBanned,
  isGroupBanned,
  toggleUserBan,
  toggleGroupBan
};
