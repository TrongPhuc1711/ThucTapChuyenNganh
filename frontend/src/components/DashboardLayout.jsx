import Sidebar from "./Sidebar";
import "../styles/Dashboard/DashboardLayout.css";

export default function DashboardLayout({ title, children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <h1>{title}</h1>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
