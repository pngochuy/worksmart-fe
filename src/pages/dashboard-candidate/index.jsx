export const index = () => {
  return (
    <>
      {/* Dashboard */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Hello, Huy!!</h3>
            <div className="text">Ready to jump back in?</div>
          </div>
          <div className="row">
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item">
                <div className="left">
                  <i className="icon flaticon-briefcase"></i>
                </div>
                <div className="right">
                  <h4>22</h4>
                  <p>Applied Jobs</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-red">
                <div className="left">
                  <i className="icon la la-file-invoice"></i>
                </div>
                <div className="right">
                  <h4>9382</h4>
                  <p>Job Alerts</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-yellow">
                <div className="left">
                  <i className="icon la la-comment-o"></i>
                </div>
                <div className="right">
                  <h4>74</h4>
                  <p>Messages</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-green">
                <div className="left">
                  <i className="icon la la-bookmark-o"></i>
                </div>
                <div className="right">
                  <h4>32</h4>
                  <p>Shortlist</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-7">
              {/* Graph widget */}
              <div className="graph-widget ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Your Profile Views</h4>
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
                    <canvas id="chart" width="100" height="45"></canvas>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              {/* Notification Widget */}
              <div className="notification-widget ls-widget">
                <div className="widget-title">
                  <h4>Notifications</h4>
                </div>
                <div className="widget-content">
                  <ul className="notification-list">
                    <li>
                      <span className="icon flaticon-briefcase"></span>{" "}
                      <strong>Huy A</strong> applied for a job{" "}
                      <span className="colored">Web Developer</span>
                    </li>
                    <li>
                      <span className="icon flaticon-briefcase"></span>{" "}
                      <strong>Huy </strong> applied for a job{" "}
                      <span className="colored">Senior Product Designer</span>
                    </li>
                    <li className="success">
                      <span className="icon flaticon-briefcase"></span>{" "}
                      <strong>Raul Costa</strong> applied for a job{" "}
                      <span className="colored">Product Manager, Risk</span>
                    </li>
                    <li>
                      <span className="icon flaticon-briefcase"></span>{" "}
                      <strong>Jack Milk</strong> applied for a job{" "}
                      <span className="colored">Technical Architect</span>
                    </li>
                    <li className="success">
                      <span className="icon flaticon-briefcase"></span>{" "}
                      <strong>Michel Arian</strong> applied for a job{" "}
                      <span className="colored">Software Engineer</span>
                    </li>
                    <li>
                      <span className="icon flaticon-briefcase"></span>{" "}
                      <strong>Ali Tufan</strong> applied for a job{" "}
                      <span className="colored">UI Designer</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              {/* applicants Widget */}
              <div className="applicants-widget ls-widget">
                <div className="widget-title">
                  <h4>Jobs Applied Recently</h4>
                </div>
                <div className="widget-content">
                  <div className="row">
                    {/* Job Block */}
                    <div className="job-block col-lg-6 col-md-12 col-sm-12">
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
                              Software Engineer (Android), Libraries
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
                            <li>
                              <span className="icon flaticon-clock-3"></span> 11
                              hours ago
                            </li>
                            <li>
                              <span className="icon flaticon-money"></span> $35k
                              - $45k
                            </li>
                          </ul>
                          <ul className="job-other-info">
                            <li className="time">Full Time</li>
                            <li className="privacy">Private</li>
                            <li className="required">Urgent</li>
                          </ul>
                          <button className="bookmark-btn">
                            <span className="flaticon-bookmark"></span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Job Block */}
                    <div className="job-block col-lg-6 col-md-12 col-sm-12">
                      <div className="inner-box">
                        <div className="content">
                          <span className="company-logo">
                            <img
                              src="images/resource/company-logo/1-2.png"
                              alt=""
                            />
                          </span>
                          <h4>
                            <a href="#">Recruiting Coordinator</a>
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
                            <li>
                              <span className="icon flaticon-clock-3"></span> 11
                              hours ago
                            </li>
                            <li>
                              <span className="icon flaticon-money"></span> $35k
                              - $45k
                            </li>
                          </ul>
                          <ul className="job-other-info">
                            <li className="time">Full Time</li>
                            <li className="privacy">Private</li>
                            <li className="required">Urgent</li>
                          </ul>
                          <button className="bookmark-btn">
                            <span className="flaticon-bookmark"></span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Job Block */}
                    <div className="job-block col-lg-6 col-md-12 col-sm-12">
                      <div className="inner-box">
                        <div className="content">
                          <span className="company-logo">
                            <img
                              src="images/resource/company-logo/1-3.png"
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
                            <li>
                              <span className="icon flaticon-clock-3"></span> 11
                              hours ago
                            </li>
                            <li>
                              <span className="icon flaticon-money"></span> $35k
                              - $45k
                            </li>
                          </ul>
                          <ul className="job-other-info">
                            <li className="time">Full Time</li>
                            <li className="privacy">Private</li>
                            <li className="required">Urgent</li>
                          </ul>
                          <button className="bookmark-btn">
                            <span className="flaticon-bookmark"></span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Job Block */}
                    <div className="job-block col-lg-6 col-md-12 col-sm-12">
                      <div className="inner-box">
                        <div className="content">
                          <span className="company-logo">
                            <img
                              src="images/resource/company-logo/1-4.png"
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
                            <li>
                              <span className="icon flaticon-clock-3"></span> 11
                              hours ago
                            </li>
                            <li>
                              <span className="icon flaticon-money"></span> $35k
                              - $45k
                            </li>
                          </ul>
                          <ul className="job-other-info">
                            <li className="time">Full Time</li>
                            <li className="privacy">Private</li>
                            <li className="required">Urgent</li>
                          </ul>
                          <button className="bookmark-btn">
                            <span className="flaticon-bookmark"></span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Job Block */}
                    <div className="job-block col-lg-6 col-md-12 col-sm-12">
                      <div className="inner-box">
                        <div className="content">
                          <span className="company-logo">
                            <img
                              src="images/resource/company-logo/1-5.png"
                              alt=""
                            />
                          </span>
                          <h4>
                            <a href="#">
                              Senior Full Stack Engineer, Creator Success
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
                            <li>
                              <span className="icon flaticon-clock-3"></span> 11
                              hours ago
                            </li>
                            <li>
                              <span className="icon flaticon-money"></span> $35k
                              - $45k
                            </li>
                          </ul>
                          <ul className="job-other-info">
                            <li className="time">Full Time</li>
                            <li className="privacy">Private</li>
                            <li className="required">Urgent</li>
                          </ul>
                          <button className="bookmark-btn">
                            <span className="flaticon-bookmark"></span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Job Block */}
                    <div className="job-block col-lg-6 col-md-12 col-sm-12">
                      <div className="inner-box">
                        <div className="content">
                          <span className="company-logo">
                            <img
                              src="images/resource/company-logo/1-6.png"
                              alt=""
                            />
                          </span>
                          <h4>
                            <a href="#">
                              Software Engineer (Android), Libraries
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
                            <li>
                              <span className="icon flaticon-clock-3"></span> 11
                              hours ago
                            </li>
                            <li>
                              <span className="icon flaticon-money"></span> $35k
                              - $45k
                            </li>
                          </ul>
                          <ul className="job-other-info">
                            <li className="time">Full Time</li>
                            <li className="privacy">Private</li>
                            <li className="required">Urgent</li>
                          </ul>
                          <button className="bookmark-btn">
                            <span className="flaticon-bookmark"></span>
                          </button>
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
      {/* End Dashboard */}
    </>
  );
};
