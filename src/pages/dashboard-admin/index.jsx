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
          <div className="row">
            <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item">
                <div className="left">
                  <i className="icon flaticon-briefcase"></i>
                </div>
                <div className="right">
                  <h4>22</h4>
                  <p>Posted Jobs</p>
                </div>
              </div>
            </div>
            <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-red">
                <div className="left">
                  <i className="icon la la-file-invoice"></i>
                </div>
                <div className="right">
                  <h4>100</h4>
                  <p>Users</p>
                </div>
              </div>
            </div>
            <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-yellow">
                <div className="left">
                  <i className="icon la la-comment-o"></i>
                </div>
                <div className="right">
                  <h4>74</h4>
                  <p>Messages</p>
                </div>
              </div>
            </div>
            <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-green">
                <div className="left">
                  <i className="icon la la-bookmark-o"></i>
                </div>
                <div className="right">
                  <h4>32</h4>
                  <p>Revenue</p>
                </div>
              </div>
            </div>
          </div>
          {/* ... */}
          <AdminDashboardCharts />
        </div>
      </section>
    </>
  );
};
