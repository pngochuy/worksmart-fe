import * as React from "react";

import { getUserLoginData } from "@/helpers/decodeJwt";
import AdminDashboardCharts from "./AdminDashboardCharts";

export const Index = () => {
  const [userDataLogin, setUserDataLogin] = React.useState(null); // State lưu người dùng đăng nhập

  React.useEffect(() => {
    const user = getUserLoginData();
    setUserDataLogin(user);
  }, []);
  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer" style={{ padding: "10px 30px" }}>
          <div className="upper-title-box">
            <h3>Hi, {userDataLogin?.fullName}!</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          {/* ... */}
          <AdminDashboardCharts />
        </div>
      </section>
    </>
  );
};
