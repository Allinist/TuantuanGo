const { getRole, setRole } = require("./stores/session-store");

App({
  onLaunch() {
    const role = getRole();
    setRole(role);
  }
});
