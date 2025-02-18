export const index = () => {
  return (
    <>
      {/* Dashboard */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Saved Jobs</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Saved Jobs</h4>

                    <div className="chosen-outer">
                      {/*Tabs Box*/}
                      <select className="chosen-select">
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                        <option>Last 16 Months</option>
                        <option>Last 24 Months</option>
                        <option>Last 5 year</option>
                      </select>
                    </div>
                  </div>

                  <div className="widget-content">
                    <div className="table-outer">
                      <table className="default-table manage-job-table">
                        <thead>
                          <tr>
                            <th>Job Title</th>
                            <th>Date Applied</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr>
                            <td>
                              {/* Job Block */}
                              <div className="job-block">
                                <div className="inner-box">
                                  <div className="content">
                                    <span className="company-logo">
                                      <img
                                        src="images/resource/company-logo/1-1.png"
                                        alt=""
                                      />
                                    </span>
                                    <h4>
                                      <a href="#">
                                        Senior Full Stack Engineer, Creator
                                        Success
                                      </a>
                                    </h4>
                                    <ul className="job-info">
                                      <li>
                                        <span className="icon flaticon-briefcase"></span>{" "}
                                        Segment
                                      </li>
                                      <li>
                                        <span className="icon flaticon-map-locator"></span>{" "}
                                        London, UK
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>Dec 5, 2020</td>
                            <td className="status">Active</td>
                            <td>
                              <div className="option-box">
                                <ul className="option-list">
                                  <li>
                                    <button data-text="View Aplication">
                                      <span className="la la-eye"></span>
                                    </button>
                                  </li>
                                  <li>
                                    <button data-text="Delete Aplication">
                                      <span className="la la-trash"></span>
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </td>
                          </tr>

                          <tr>
                            <td>
                              {/* Job Block */}
                              <div className="job-block">
                                <div className="inner-box">
                                  <div className="content">
                                    <span className="company-logo">
                                      <img
                                        src="images/resource/company-logo/1-2.png"
                                        alt=""
                                      />
                                    </span>
                                    <h4>
                                      <a href="#">Senior Product Designer</a>
                                    </h4>
                                    <ul className="job-info">
                                      <li>
                                        <span className="icon flaticon-briefcase"></span>{" "}
                                        Segment
                                      </li>
                                      <li>
                                        <span className="icon flaticon-map-locator"></span>{" "}
                                        London, UK
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>Dec 5, 2020</td>
                            <td className="status">Active</td>
                            <td>
                              <div className="option-box">
                                <ul className="option-list">
                                  <li>
                                    <button data-text="View Aplication">
                                      <span className="la la-eye"></span>
                                    </button>
                                  </li>
                                  <li>
                                    <button data-text="Delete Aplication">
                                      <span className="la la-trash"></span>
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              {/* Job Block */}
                              <div className="job-block">
                                <div className="inner-box">
                                  <div className="content">
                                    <span className="company-logo">
                                      <img
                                        src="images/resource/company-logo/1-3.png"
                                        alt=""
                                      />
                                    </span>
                                    <h4>
                                      <a href="#">Sr. Full Stack Engineer</a>
                                    </h4>
                                    <ul className="job-info">
                                      <li>
                                        <span className="icon flaticon-briefcase"></span>{" "}
                                        Segment
                                      </li>
                                      <li>
                                        <span className="icon flaticon-map-locator"></span>{" "}
                                        London, UK
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>Dec 5, 2020</td>
                            <td className="status">Active</td>
                            <td>
                              <div className="option-box">
                                <ul className="option-list">
                                  <li>
                                    <button data-text="View Aplication">
                                      <span className="la la-eye"></span>
                                    </button>
                                  </li>
                                  <li>
                                    <button data-text="Delete Aplication">
                                      <span className="la la-trash"></span>
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </td>
                          </tr>

                          <tr>
                            <td>
                              {/* Job Block */}
                              <div className="job-block">
                                <div className="inner-box">
                                  <div className="content">
                                    <span className="company-logo">
                                      <img
                                        src="images/resource/company-logo/1-4.png"
                                        alt=""
                                      />
                                    </span>
                                    <h4>
                                      <a href="#">Product Manager, Studio</a>
                                    </h4>
                                    <ul className="job-info">
                                      <li>
                                        <span className="icon flaticon-briefcase"></span>{" "}
                                        Segment
                                      </li>
                                      <li>
                                        <span className="icon flaticon-map-locator"></span>{" "}
                                        London, UK
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>Dec 5, 2020</td>
                            <td className="status">Active</td>
                            <td>
                              <div className="option-box">
                                <ul className="option-list">
                                  <li>
                                    <button data-text="View Aplication">
                                      <span className="la la-eye"></span>
                                    </button>
                                  </li>
                                  <li>
                                    <button data-text="Delete Aplication">
                                      <span className="la la-trash"></span>
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </td>
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
      {/* End Dashboard */}
    </>
  );
};
