import { useLocation } from "react-router-dom";
import { CandidateSidebar } from "./CandidateSidebar";
import { EmployerSidebar } from "./EmployerSidebar";
import { useEffect, useState } from "react";
import { getUserLoginData } from "@/helpers/decodeJwt";
import { Tooltip } from "primereact/tooltip";
import { AdminSidebar } from "./AdminSiderbar";
import { fetchCompanyProfile } from "@/services/employerServices";

export const Sidebar = () => {
  const location = useLocation();

  // Kiểm tra pathname để xác định sidebar nào sẽ được hiển thị
  const isCandidate = location.pathname.startsWith("/candidate");
  const isEmployer = location.pathname.startsWith("/employer");
  const isAdmin = location.pathname.startsWith("/admin");
  const [verificationLevel, setVerificationLevel] = useState("");

  const [userDataLogin, setUserDataLogin] = useState(null); // State lưu người dùng đăng nhập

    useEffect(() => {
        const loadData = async () => {
            try {
                const user = getUserLoginData();
                setUserDataLogin(user);
                
                const companyData = await fetchCompanyProfile();
                
                setVerificationLevel(companyData.verificationLevel);
                console.log("Company Data:", companyData);
                console.log("Verification Level:", companyData.verificationLevel);
            } catch (error) {
                console.error("Error loading verification data:", error);
                toast.error("Failed to load verification information");
            }
        };
        loadData();
    }, []);

  return (
    <>
      <div
        className="user-sidebar"
        style={{ paddingTop: `${isAdmin ? "0px" : "80px"}` }}
      >
        <div
          className="sidebar-inner"
          style={{ paddingTop: `${isAdmin ? "0px" : "70px"}` }}
        >
          <div className="flex items-center gap-2 p-3">
            <div className="dashboard-option" style={{ marginLeft: "0px" }}>
              <img
                src={
                  userDataLogin?.avatar
                    ? userDataLogin.avatar
                    : "https://www.topcv.vn/images/avatar-default.jpg"
                }
                alt="avatar"
                className="thumb"
              />
            </div>
            <div className="text-lg">
              <h4 className="font-semibold">{userDataLogin?.fullName}</h4>
              <h5 className="">
                <span className="text-sm">
                  {userDataLogin?.role}{" "}
                  {userDataLogin?.role === "Candidate" && (
                    <>
                      <i className={`text-primary fa-solid fa-user-tie`}></i>
                    </>
                  )}
                  {userDataLogin?.role === "Employer" && (
                    <>
                      <i className={`text-primary fa-solid fa-briefcase`}></i>
                    </>
                  )}
                  {userDataLogin?.role === "Admin" && (
                    <>
                      <i className={`text-primary fa-solid fa-user-shield`}></i>
                    </>
                  )}
                </span>
              </h5>
            </div>
          </div>

          {/* Account Verification */}
          {userDataLogin?.role === "Employer" && (
            <>
              <div className="px-3 py-2 text-gray-400" style={{ fontSize: "0.85rem" }}>
                <Tooltip
                  target=".fa-circle-question"
                  className="custom-tooltip"
                // style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
                />
                <span>Account Verification: </span>
                <span className="text-green-500">
                  Level {verificationLevel}/3{" "}
                  <i
                    className="fa-solid fa-circle-question text-gray-400"
                    data-pr-tooltip="Verify your account to unlock more features"
                    data-pr-position="right"
                    data-pr-at="right+9 top"
                    data-pr-my="left center-2"
                    style={{ cursor: "pointer" }}
                  ></i>
                </span>
              </div>
            </>
          )}
          <hr className="mb-3 bg-black" />
          {/* Candidate Sidebar */}
          {isCandidate && (
            <>
              <CandidateSidebar />
            </>
          )}
          {/* End Candidate Sidebar */}

          {/* Employer Sidebar */}
          {isEmployer && (
            <>
              <EmployerSidebar />
            </>
          )}
          {/* End Employer Sidebar */}
          {/* Employer Sidebar */}
          {isAdmin && (
            <>
              <AdminSidebar />
            </>
          )}
          {/* End Employer Sidebar */}
        </div>
      </div>
    </>
  );
};
