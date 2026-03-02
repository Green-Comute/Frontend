import { getUserFromToken } from "../utils/jwt";
import EmployeeDashboard from "./dashboards/EmployeeDashboard";
import OrgAdminDashboard from "./dashboards/OrgAdminDashboard";
import PlatformDashboard from "./dashboards/PlatformDashboard";

const Dashboard = () => {
  const user = getUserFromToken();

  if (!user) return null;

  if (user.role === "ORG_ADMIN") return <OrgAdminDashboard />;
  if (user.role === "PLATFORM_ADMIN") return <PlatformDashboard />;
  return <EmployeeDashboard />;
};

export default Dashboard;
