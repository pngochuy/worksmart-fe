import { useState, useEffect } from "react";
// import { JobTable } from "./JobTable";
import { getAllUsers } from "@/services/adminServices";

export const Index = () => {
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await getAllUsers();
        console.log("response: ", response);
        setUserData(response);
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer" style={{ padding: "30px 30px" }}>
        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="tabs-box">
                <div className="widget-title">
                  <h2 className="text-3xl">Users Management</h2>
                  {/* <JobTable data={jobData} isLoading={isLoading} /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
