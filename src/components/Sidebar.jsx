import { useLocation } from "react-router-dom";
import { CandidateSidebar } from "./CandidateSidebar";
import { EmployerSidebar } from "./EmployerSidebar";

export const Sidebar = () => {
  const location = useLocation();

  // Kiểm tra pathname để xác định sidebar nào sẽ được hiển thị
  const isCandidate = location.pathname.startsWith("/candidate");
  const isEmployer = location.pathname.startsWith("/employer");

  return (
    <>
      <div className="user-sidebar">
        <div className="sidebar-inner" style={{ paddingTop: "70px" }}>
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
        </div>
      </div>
    </>
  );
};
