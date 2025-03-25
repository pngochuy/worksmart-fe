import { getUserLoginData } from "@/helpers/decodeJwt";
import { fetchCompanyProfile } from "@/services/employerServices";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Index = () => {
  const [verificationLevel, setVerificationLevel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = getUserLoginData();

        if (user.role === "Employer") {
          const companyData = await fetchCompanyProfile();

          setVerificationLevel(companyData.verificationLevel);
          console.log("Verification Level:", companyData.verificationLevel);
        }
      } catch (error) {
        console.error("Error loading verification data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (verificationLevel !== null && verificationLevel < 3) {
      navigate("/employer/verification");
    }
  }, [verificationLevel, navigate]);

  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>All Aplicants</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Applicant</h4>

                    <div className="chosen-outer">
                      {/*Tabs Box*/}
                      <select className="chosen-select">
                        <option>Select Jobs</option>
                        <option>Last 12 Months</option>
                        <option>Last 16 Months</option>
                        <option>Last 24 Months</option>
                        <option>Last 5 year</option>
                      </select>

                      {/*Tabs Box*/}
                      <select className="chosen-select">
                        <option>All Status</option>
                        <option>Last 12 Months</option>
                        <option>Last 16 Months</option>
                        <option>Last 24 Months</option>
                        <option>Last 5 year</option>
                      </select>
                    </div>
                  </div>

                  <div className="widget-content">
                    <div className="tabs-box">
                      <div className="aplicants-upper-bar">
                        <h6>Senior Product Designer</h6>
                        <ul className="aplicantion-status tab-buttons clearfix">
                          <li
                            className="tab-btn active-btn totals"
                            data-tab="#totals"
                          >
                            Total(s): 6
                          </li>
                          <li className="tab-btn approved" data-tab="#approved">
                            Approved: 2
                          </li>
                          <li className="tab-btn rejected" data-tab="#rejected">
                            Rejected(s): 4
                          </li>
                        </ul>
                      </div>

                      <div className="tabs-content">
                        {/*Tab*/}
                        <div className="tab active-tab" id="totals">
                          <div className="row">
                            {/* Candidate block three */}
                            <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
                              <div className="inner-box">
                                <div className="content">
                                  <figure className="image">
                                    <img
                                      src="images/resource/candidate-1.png"
                                      alt=""
                                    />
                                  </figure>
                                  <h4 className="name">
                                    <a href="#">Darlene Robertson</a>
                                  </h4>
                                  <ul className="candidate-info">
                                    <li className="designation">UI Designer</li>
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      London, UK
                                    </li>
                                    <li>
                                      <span className="icon flaticon-money"></span>{" "}
                                      $99 / hour
                                    </li>
                                  </ul>
                                  <ul className="post-tags">
                                    <li>
                                      <a href="#">App</a>
                                    </li>
                                    <li>
                                      <a href="#">Design</a>
                                    </li>
                                    <li>
                                      <a href="#">Digital</a>
                                    </li>
                                  </ul>
                                </div>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <button data-text="View Aplication">
                                        <span className="la la-eye"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Approve Aplication">
                                        <span className="la la-check"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Reject Aplication">
                                        <span className="la la-times-circle"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Delete Aplication">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Candidate block three */}
                            <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
                              <div className="inner-box">
                                <div className="content">
                                  <figure className="image">
                                    <img
                                      src="images/resource/candidate-2.png"
                                      alt=""
                                    />
                                  </figure>
                                  <h4 className="name">
                                    <a href="#">Wade Warren</a>
                                  </h4>
                                  <ul className="candidate-info">
                                    <li className="designation">UI Designer</li>
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      London, UK
                                    </li>
                                    <li>
                                      <span className="icon flaticon-money"></span>{" "}
                                      $99 / hour
                                    </li>
                                  </ul>
                                  <ul className="post-tags">
                                    <li>
                                      <a href="#">App</a>
                                    </li>
                                    <li>
                                      <a href="#">Design</a>
                                    </li>
                                    <li>
                                      <a href="#">Digital</a>
                                    </li>
                                  </ul>
                                </div>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <button data-text="View Aplication">
                                        <span className="la la-eye"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Approve Aplication">
                                        <span className="la la-check"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Reject Aplication">
                                        <span className="la la-times-circle"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Delete Aplication">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Candidate block three */}
                            <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
                              <div className="inner-box">
                                <div className="content">
                                  <figure className="image">
                                    <img
                                      src="images/resource/candidate-3.png"
                                      alt=""
                                    />
                                  </figure>
                                  <h4 className="name">
                                    <a href="#">Leslie Alexander</a>
                                  </h4>
                                  <ul className="candidate-info">
                                    <li className="designation">UI Designer</li>
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      London, UK
                                    </li>
                                    <li>
                                      <span className="icon flaticon-money"></span>{" "}
                                      $99 / hour
                                    </li>
                                  </ul>
                                  <ul className="post-tags">
                                    <li>
                                      <a href="#">App</a>
                                    </li>
                                    <li>
                                      <a href="#">Design</a>
                                    </li>
                                    <li>
                                      <a href="#">Digital</a>
                                    </li>
                                  </ul>
                                </div>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <button data-text="View Aplication">
                                        <span className="la la-eye"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Approve Aplication">
                                        <span className="la la-check"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Reject Aplication">
                                        <span className="la la-times-circle"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Delete Aplication">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Candidate block three */}
                            <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
                              <div className="inner-box">
                                <div className="content">
                                  <figure className="image">
                                    <img
                                      src="images/resource/candidate-1.png"
                                      alt=""
                                    />
                                  </figure>
                                  <h4 className="name">
                                    <a href="#">Darlene Robertson</a>
                                  </h4>
                                  <ul className="candidate-info">
                                    <li className="designation">UI Designer</li>
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      London, UK
                                    </li>
                                    <li>
                                      <span className="icon flaticon-money"></span>{" "}
                                      $99 / hour
                                    </li>
                                  </ul>
                                  <ul className="post-tags">
                                    <li>
                                      <a href="#">App</a>
                                    </li>
                                    <li>
                                      <a href="#">Design</a>
                                    </li>
                                    <li>
                                      <a href="#">Digital</a>
                                    </li>
                                  </ul>
                                </div>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <button data-text="View Aplication">
                                        <span className="la la-eye"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Approve Aplication">
                                        <span className="la la-check"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Reject Aplication">
                                        <span className="la la-times-circle"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Delete Aplication">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Candidate block three */}
                            <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
                              <div className="inner-box">
                                <div className="content">
                                  <figure className="image">
                                    <img
                                      src="images/resource/candidate-2.png"
                                      alt=""
                                    />
                                  </figure>
                                  <h4 className="name">
                                    <a href="#">Wade Warren</a>
                                  </h4>
                                  <ul className="candidate-info">
                                    <li className="designation">UI Designer</li>
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      London, UK
                                    </li>
                                    <li>
                                      <span className="icon flaticon-money"></span>{" "}
                                      $99 / hour
                                    </li>
                                  </ul>
                                  <ul className="post-tags">
                                    <li>
                                      <a href="#">App</a>
                                    </li>
                                    <li>
                                      <a href="#">Design</a>
                                    </li>
                                    <li>
                                      <a href="#">Digital</a>
                                    </li>
                                  </ul>
                                </div>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <button data-text="View Aplication">
                                        <span className="la la-eye"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Approve Aplication">
                                        <span className="la la-check"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Reject Aplication">
                                        <span className="la la-times-circle"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Delete Aplication">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Candidate block three */}
                            <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
                              <div className="inner-box">
                                <div className="content">
                                  <figure className="image">
                                    <img
                                      src="images/resource/candidate-3.png"
                                      alt=""
                                    />
                                  </figure>
                                  <h4 className="name">
                                    <a href="#">Leslie Alexander</a>
                                  </h4>
                                  <ul className="candidate-info">
                                    <li className="designation">UI Designer</li>
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      London, UK
                                    </li>
                                    <li>
                                      <span className="icon flaticon-money"></span>{" "}
                                      $99 / hour
                                    </li>
                                  </ul>
                                  <ul className="post-tags">
                                    <li>
                                      <a href="#">App</a>
                                    </li>
                                    <li>
                                      <a href="#">Design</a>
                                    </li>
                                    <li>
                                      <a href="#">Digital</a>
                                    </li>
                                  </ul>
                                </div>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <button data-text="View Aplication">
                                        <span className="la la-eye"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Approve Aplication">
                                        <span className="la la-check"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Reject Aplication">
                                        <span className="la la-times-circle"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Delete Aplication">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/*Tab*/}
                        <div className="tab" id="approved">
                          <div className="row">
                            {/* Candidate block three */}
                            <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
                              <div className="inner-box">
                                <div className="content">
                                  <figure className="image">
                                    <img
                                      src="images/resource/candidate-1.png"
                                      alt=""
                                    />
                                  </figure>
                                  <h4 className="name">
                                    <a href="#">Darlene Robertson</a>
                                  </h4>
                                  <ul className="candidate-info">
                                    <li className="designation">UI Designer</li>
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      London, UK
                                    </li>
                                    <li>
                                      <span className="icon flaticon-money"></span>{" "}
                                      $99 / hour
                                    </li>
                                  </ul>
                                  <ul className="post-tags">
                                    <li>
                                      <a href="#">App</a>
                                    </li>
                                    <li>
                                      <a href="#">Design</a>
                                    </li>
                                    <li>
                                      <a href="#">Digital</a>
                                    </li>
                                  </ul>
                                </div>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <button data-text="View Aplication">
                                        <span className="la la-eye"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Approve Aplication">
                                        <span className="la la-check"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Reject Aplication">
                                        <span className="la la-times-circle"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Delete Aplication">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Candidate block three */}
                            <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
                              <div className="inner-box">
                                <div className="content">
                                  <figure className="image">
                                    <img
                                      src="images/resource/candidate-2.png"
                                      alt=""
                                    />
                                  </figure>
                                  <h4 className="name">
                                    <a href="#">Wade Warren</a>
                                  </h4>
                                  <ul className="candidate-info">
                                    <li className="designation">UI Designer</li>
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      London, UK
                                    </li>
                                    <li>
                                      <span className="icon flaticon-money"></span>{" "}
                                      $99 / hour
                                    </li>
                                  </ul>
                                  <ul className="post-tags">
                                    <li>
                                      <a href="#">App</a>
                                    </li>
                                    <li>
                                      <a href="#">Design</a>
                                    </li>
                                    <li>
                                      <a href="#">Digital</a>
                                    </li>
                                  </ul>
                                </div>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <button data-text="View Aplication">
                                        <span className="la la-eye"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Approve Aplication">
                                        <span className="la la-check"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Reject Aplication">
                                        <span className="la la-times-circle"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Delete Aplication">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/*Tab*/}
                        <div className="tab" id="rejected">
                          <div className="row">
                            {/* Candidate block three */}
                            <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
                              <div className="inner-box">
                                <div className="content">
                                  <figure className="image">
                                    <img
                                      src="images/resource/candidate-3.png"
                                      alt=""
                                    />
                                  </figure>
                                  <h4 className="name">
                                    <a href="#">Leslie Alexander</a>
                                  </h4>
                                  <ul className="candidate-info">
                                    <li className="designation">UI Designer</li>
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      London, UK
                                    </li>
                                    <li>
                                      <span className="icon flaticon-money"></span>{" "}
                                      $99 / hour
                                    </li>
                                  </ul>
                                  <ul className="post-tags">
                                    <li>
                                      <a href="#">App</a>
                                    </li>
                                    <li>
                                      <a href="#">Design</a>
                                    </li>
                                    <li>
                                      <a href="#">Digital</a>
                                    </li>
                                  </ul>
                                </div>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <button data-text="View Aplication">
                                        <span className="la la-eye"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Approve Aplication">
                                        <span className="la la-check"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Reject Aplication">
                                        <span className="la la-times-circle"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Delete Aplication">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Candidate block three */}
                            <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
                              <div className="inner-box">
                                <div className="content">
                                  <figure className="image">
                                    <img
                                      src="images/resource/candidate-1.png"
                                      alt=""
                                    />
                                  </figure>
                                  <h4 className="name">
                                    <a href="#">Darlene Robertson</a>
                                  </h4>
                                  <ul className="candidate-info">
                                    <li className="designation">UI Designer</li>
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      London, UK
                                    </li>
                                    <li>
                                      <span className="icon flaticon-money"></span>{" "}
                                      $99 / hour
                                    </li>
                                  </ul>
                                  <ul className="post-tags">
                                    <li>
                                      <a href="#">App</a>
                                    </li>
                                    <li>
                                      <a href="#">Design</a>
                                    </li>
                                    <li>
                                      <a href="#">Digital</a>
                                    </li>
                                  </ul>
                                </div>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <button data-text="View Aplication">
                                        <span className="la la-eye"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Approve Aplication">
                                        <span className="la la-check"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Reject Aplication">
                                        <span className="la la-times-circle"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Delete Aplication">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Candidate block three */}
                            <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
                              <div className="inner-box">
                                <div className="content">
                                  <figure className="image">
                                    <img
                                      src="images/resource/candidate-2.png"
                                      alt=""
                                    />
                                  </figure>
                                  <h4 className="name">
                                    <a href="#">Wade Warren</a>
                                  </h4>
                                  <ul className="candidate-info">
                                    <li className="designation">UI Designer</li>
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      London, UK
                                    </li>
                                    <li>
                                      <span className="icon flaticon-money"></span>{" "}
                                      $99 / hour
                                    </li>
                                  </ul>
                                  <ul className="post-tags">
                                    <li>
                                      <a href="#">App</a>
                                    </li>
                                    <li>
                                      <a href="#">Design</a>
                                    </li>
                                    <li>
                                      <a href="#">Digital</a>
                                    </li>
                                  </ul>
                                </div>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <button data-text="View Aplication">
                                        <span className="la la-eye"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Approve Aplication">
                                        <span className="la la-check"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Reject Aplication">
                                        <span className="la la-times-circle"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Delete Aplication">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Candidate block three */}
                            <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
                              <div className="inner-box">
                                <div className="content">
                                  <figure className="image">
                                    <img
                                      src="images/resource/candidate-3.png"
                                      alt=""
                                    />
                                  </figure>
                                  <h4 className="name">
                                    <a href="#">Leslie Alexander</a>
                                  </h4>
                                  <ul className="candidate-info">
                                    <li className="designation">UI Designer</li>
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      London, UK
                                    </li>
                                    <li>
                                      <span className="icon flaticon-money"></span>{" "}
                                      $99 / hour
                                    </li>
                                  </ul>
                                  <ul className="post-tags">
                                    <li>
                                      <a href="#">App</a>
                                    </li>
                                    <li>
                                      <a href="#">Design</a>
                                    </li>
                                    <li>
                                      <a href="#">Digital</a>
                                    </li>
                                  </ul>
                                </div>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <button data-text="View Aplication">
                                        <span className="la la-eye"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Approve Aplication">
                                        <span className="la la-check"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Reject Aplication">
                                        <span className="la la-times-circle"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button data-text="Delete Aplication">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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
