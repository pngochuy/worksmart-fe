import { useEffect, useState } from "react";
import { GetRemainingCVCreationLimit } from "@/services/cvServices";
import { CreateCVLayout } from "@/layouts/CreateCVLayout";
import { Index as DemoListCVsPage } from "./demoListCVs";

export const index = () => {
  const [remainingCVSlots, setRemainingCVSlots] = useState(0);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || null;

  useEffect(() => {
    const fetchRemainingCVSlots = async () => {
      try {
        const result = await GetRemainingCVCreationLimit(userID);
        setRemainingCVSlots(result);
      } catch (err) {
        console.error("Error fetching remaining CV slots:", err);
        setError("Failed to load remaining CV slots");
      }
    };

    fetchRemainingCVSlots();
  }, []);

  return (
    <>
      {/* Dashboard */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <div className="title-flex">
              <h3>My CV</h3>
              <div className="remaining-job-slots ml-3">
                <span className="badge" style={{
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontWeight: '600',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <i className="fas fa-clipboard-list mr-2" style={{ color: '#fff' }}></i>
                  {remainingCVSlots.remainingLimit} Create CV Slot{remainingCVSlots.remainingLimit !== 1 ? 's' : ''} Left
                </span>
              </div>
              <div className="text">Ready to jump back in?</div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              {/* CV Manager Widget */}
              <div className="cv-manager-widget ls-widget">
                <div className="widget-content">
                  <CreateCVLayout>
                    <DemoListCVsPage />
                  </CreateCVLayout>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Dashboard */}
    </>
  );
};