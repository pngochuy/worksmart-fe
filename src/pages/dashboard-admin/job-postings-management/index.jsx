import { useState, useEffect } from "react";
import { JobTable } from "./JobTable";
import { getAllJobs } from "@/services/adminServices";

export const Index = () => {
  const [jobData, setJobData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch job data from API
  useEffect(() => {
    const fetchJobData = async () => {
      setIsLoading(true);
      try {
        const response = await getAllJobs();
        console.log("response: ", response);
        setJobData(response);
      } catch (err) {
        console.error("Error fetching job data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, []);

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer" style={{ padding: "30px 30px" }}>
        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="tabs-box">
                <div className="widget-title">
                  <h2 className="text-3xl">Job Postings Management</h2>
                  <JobTable data={jobData} isLoading={isLoading} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
