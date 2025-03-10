import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getVerificationLevel } from "@/helpers/decodeJwt";

export const index = () => {
  const navigate = useNavigate();
  const [verificationLevel, setVerificationLevel] = useState(1);

  useEffect(() => {
    const level = getVerificationLevel();
    setVerificationLevel(level);

    if (verificationLevel < 3) {
      if (!toast.isActive("verification-warning")) {
        toast.warn("⚠️ You need to verify the company before posting!", {
          toastId: "verification-warning",
        });
      }
      const timeout = setTimeout(() => {
        navigate("/employer/verification");
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [verificationLevel, navigate]);

  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Packages</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Packages</h4>
                  </div>

                  <div className="widget-content">
                    <div className="table-outer">
                      <table className="default-table manage-job-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Transaction id</th>
                            <th>Package</th>
                            <th>Expiry</th>
                            <th>Total Jobs/CVs</th>
                            <th>Used</th>
                            <th>Remaining</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr>
                            <td>1</td>
                            <td className="trans-id">#593677663</td>
                            <td className="package">
                              <a href="#">Super CV Pack</a>
                            </td>
                            <td className="expiry">Jan 11, 2021</td>
                            <td className="total-jobs">50</td>
                            <td className="used">8</td>
                            <td className="remaining">42</td>
                            <td className="status">Active</td>
                          </tr>
                          <tr>
                            <td>2</td>
                            <td className="trans-id">#593677663</td>
                            <td className="package">
                              <a href="#">Gold Jobs package</a>
                            </td>
                            <td className="expiry">Jan 11, 2021</td>
                            <td className="total-jobs">50</td>
                            <td className="used">8</td>
                            <td className="remaining">42</td>
                            <td className="status">Active</td>
                          </tr>
                          <tr>
                            <td>3</td>
                            <td className="trans-id">#593677663</td>
                            <td className="package">
                              <a href="#">Silver Jobs package</a>
                            </td>
                            <td className="expiry">Jan 11, 2021</td>
                            <td className="total-jobs">50</td>
                            <td className="used">8</td>
                            <td className="remaining">42</td>
                            <td className="status">Active</td>
                          </tr>
                          <tr>
                            <td>4</td>
                            <td className="trans-id">#593677663</td>
                            <td className="package">
                              <a href="#">Super CV Pack</a>
                            </td>
                            <td className="expiry">Jan 11, 2021</td>
                            <td className="total-jobs">50</td>
                            <td className="used">8</td>
                            <td className="remaining">42</td>
                            <td className="status">Active</td>
                          </tr>
                          <tr>
                            <td>5</td>
                            <td className="trans-id">#593677663</td>
                            <td className="package">
                              <a href="#">Gold Jobs package</a>
                            </td>
                            <td className="expiry">Jan 11, 2021</td>
                            <td className="total-jobs">50</td>
                            <td className="used">8</td>
                            <td className="remaining">42</td>
                            <td className="status">Active</td>
                          </tr>
                          <tr>
                            <td>6</td>
                            <td className="trans-id">#593677663</td>
                            <td className="package">
                              <a href="#">Silver Jobs package</a>
                            </td>
                            <td className="expiry">Jan 11, 2021</td>
                            <td className="total-jobs">50</td>
                            <td className="used">8</td>
                            <td className="remaining">42</td>
                            <td className="status">Active</td>
                          </tr>
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
    </>
  );
};
