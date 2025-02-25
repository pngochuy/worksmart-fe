export const index = () => {
  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Manage Jobs</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Job Listings</h4>

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
                            <th>Title</th>
                            <th>Applications</th>
                            <th>Created & Expired</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr>
                            <td>
                              <h6>
                                Senior Full Stack Engineer, Creator Success
                              </h6>
                              <span className="info">
                                <i className="icon flaticon-map-locator"></i>{" "}
                                London, UK
                              </span>
                            </td>
                            <td className="applied">
                              <a href="#">3+ Applied</a>
                            </td>
                            <td>
                              October 27, 2017 <br />
                              April 25, 2011
                            </td>
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
                                    <button data-text="Reject Aplication">
                                      <span className="la la-pencil"></span>
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
                              <h6>Senior Product Designer</h6>
                              <span className="info">
                                <i className="icon flaticon-map-locator"></i>{" "}
                                London, UK
                              </span>
                            </td>
                            <td className="applied">
                              <a href="#">3+ Applied</a>
                            </td>
                            <td>
                              October 27, 2017 <br />
                              April 25, 2011
                            </td>
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
                                    <button data-text="Reject Aplication">
                                      <span className="la la-pencil"></span>
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
                              <h6>Sr. Full Stack Engineer</h6>
                              <span className="info">
                                <i className="icon flaticon-map-locator"></i>{" "}
                                London, UK
                              </span>
                            </td>
                            <td className="applied">
                              <a href="#">3+ Applied</a>
                            </td>
                            <td>
                              October 27, 2017 <br />
                              April 25, 2011
                            </td>
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
                                    <button data-text="Reject Aplication">
                                      <span className="la la-pencil"></span>
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
                              <h6>Product Manager, Studio</h6>
                              <span className="info">
                                <i className="icon flaticon-map-locator"></i>{" "}
                                London, UK
                              </span>
                            </td>
                            <td className="applied">
                              <a href="#">3+ Applied</a>
                            </td>
                            <td>
                              October 27, 2017 <br />
                              April 25, 2011
                            </td>
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
                                    <button data-text="Reject Aplication">
                                      <span className="la la-pencil"></span>
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
    </>
  );
};
