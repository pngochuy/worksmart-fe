import React, { useEffect, useState } from "react";
import {
  getJobAlertsByUserId,
  deleteJobAlert,
} from "@/services/candidateServices";
import { toast } from "react-toastify";

const JobAlertManager = () => {
  const [jobAlerts, setJobAlerts] = useState([]);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("userLoginData"));
    } catch {
      return null;
    }
  })();

  const userID = user?.userID;

  useEffect(() => {
    if (!userID) return;

    const fetchJobAlerts = async () => {
      try {
        const data = await getJobAlertsByUserId(userID);
        setJobAlerts(data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch job alerts.");
      }
    };

    fetchJobAlerts();
  }, [userID]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;

    try {
      console.log("Deleting job alert with ID:", id); // Kiểm tra giá trị id

      // Lấy user từ localStorage và kiểm tra
      const user = JSON.parse(localStorage.getItem("userLoginData"));
      const userID = user?.userID;

      console.log("User data from localStorage:", user); // Debug user data
      console.log("User ID:", userID); // Kiểm tra giá trị userID

      // Kiểm tra nếu userID hoặc id không hợp lệ
      if (!userID || !id) {
        toast.error("Invalid job alert ID or user ID.");
        console.error("Invalid job alert ID or user ID:", userID, id);
        return;
      }

      // Thực hiện xóa nếu hợp lệ
      await deleteJobAlert(id, userID);
      setJobAlerts((prev) => prev.filter((alert) => alert.id !== id));
      toast.success("Alert deleted successfully.");
    } catch (error) {
      console.error("Error while deleting job alert:", error);
      toast.error("Failed to delete alert.");
    }
  };

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <h3>Job Alerts</h3>
          <div className="text">Ready to jump back in?</div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="tabs-box">
                <div className="widget-title">
                  <h4>My Job Alerts</h4>
                </div>

                <div className="widget-content">
                  <div className="table-outer">
                    <table className="default-table manage-job-table">
                      <thead>
                        <tr>
                          <th>Keyword</th>
                          <th>Location</th>
                          <th>Salary</th>
                          <th>Experience</th>
                          <th>Notification</th>
                          <th>Created</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobAlerts.length > 0 ? (
                          jobAlerts.map((job) => (
                            <tr key={job.id}>
                              <td>{job.keyword}</td>
                              <td>
                                {job.province}
                                {job.district ? ` - ${job.district}` : ""}
                              </td>
                              <td>{job.salaryRange || "N/A"}</td>
                              <td>{job.experience}</td>
                              <td>{job.notificationMethod}</td>
                              <td>
                                {new Date(job.createdDate).toLocaleDateString()}
                              </td>
                              <td>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <button
                                        onClick={() => handleDelete(job.id)}
                                        title="Delete"
                                      >
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} style={{ textAlign: "center" }}>
                              No job alerts found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const index = JobAlertManager;
