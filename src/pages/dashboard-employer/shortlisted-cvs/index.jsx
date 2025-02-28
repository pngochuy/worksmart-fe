export const index = () => {
  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Shorlisted Resumes!</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* applicants Widget */}
              <div className="applicants-widget ls-widget">
                <div className="widget-title">
                  <h4>Shorlist Resumes</h4>

                  <div className="chosen-outer">
                    {/*search box*/}
                    <div className="search-box-one">
                      <form method="post" action="blog.html">
                        <div className="form-group">
                          <span className="icon flaticon-search-1"></span>
                          <input
                            type="search"
                            name="search-field"
                            value=""
                            placeholder="Search"
                            required=""
                          />
                        </div>
                      </form>
                    </div>

                    {/*Tabs Box*/}
                    <select className="chosen-select">
                      <option>Newest</option>
                      <option>Last 12 Months</option>
                      <option>Last 16 Months</option>
                      <option>Last 24 Months</option>
                      <option>Last 5 year</option>
                    </select>
                  </div>
                </div>
                <div className="widget-content">
                  {/* Candidate block three */}
                  <div className="candidate-block-three">
                    <div className="inner-box">
                      <div className="content">
                        <figure className="image">
                          <img src="images/resource/candidate-1.png" alt="" />
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
                            <span className="icon flaticon-money"></span> $99 /
                            hour
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
                        {/* Dashboard Option */}
                        <div className="dropdown resume-action">
                          <button
                            className="dropdown-toggle theme-btn btn-style-three"
                            role="button"
                            data-toggle="dropdown"
                            aria-expanded="false"
                          >
                            Action <i className="fa fa-angle-down"></i>
                          </button>

                          <ul className="dropdown-menu">
                            <li>
                              <button data-text="View Aplication">
                                <span className="la la-eye"></span> View
                                Aplication
                              </button>
                            </li>
                            <li>
                              <button data-text="Approve Aplication">
                                <span className="la la-check"></span> Approve
                                Aplication
                              </button>
                            </li>
                            <li>
                              <button data-text="Reject Aplication">
                                <span className="la la-times-circle"></span>{" "}
                                Reject Aplication
                              </button>
                            </li>
                          </ul>
                        </div>

                        <button
                          className="delete-btn"
                          data-text="Delete Aplication"
                        >
                          <span className="la la-trash"></span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Candidate block three */}
                  <div className="candidate-block-three">
                    <div className="inner-box">
                      <div className="content">
                        <figure className="image">
                          <img src="images/resource/candidate-2.png" alt="" />
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
                            <span className="icon flaticon-money"></span> $99 /
                            hour
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
                        {/* Dashboard Option */}
                        <div className="dropdown resume-action">
                          <button
                            className="dropdown-toggle theme-btn btn-style-three"
                            role="button"
                            data-toggle="dropdown"
                            aria-expanded="false"
                          >
                            Action <i className="fa fa-angle-down"></i>
                          </button>

                          <ul className="dropdown-menu">
                            <li>
                              <button data-text="View Aplication">
                                <span className="la la-eye"></span> View
                                Aplication
                              </button>
                            </li>
                            <li>
                              <button data-text="Approve Aplication">
                                <span className="la la-check"></span> Approve
                                Aplication
                              </button>
                            </li>
                            <li>
                              <button data-text="Reject Aplication">
                                <span className="la la-times-circle"></span>{" "}
                                Reject Aplication
                              </button>
                            </li>
                          </ul>
                        </div>

                        <button
                          className="delete-btn"
                          data-text="Delete Aplication"
                        >
                          <span className="la la-trash"></span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Candidate block three */}
                  <div className="candidate-block-three">
                    <div className="inner-box">
                      <div className="content">
                        <figure className="image">
                          <img src="images/resource/candidate-3.png" alt="" />
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
                            <span className="icon flaticon-money"></span> $99 /
                            hour
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
                        {/* Dashboard Option */}
                        <div className="dropdown resume-action">
                          <button
                            className="dropdown-toggle theme-btn btn-style-three"
                            role="button"
                            data-toggle="dropdown"
                            aria-expanded="false"
                          >
                            Action <i className="fa fa-angle-down"></i>
                          </button>

                          <ul className="dropdown-menu">
                            <li>
                              <button data-text="View Aplication">
                                <span className="la la-eye"></span> View
                                Aplication
                              </button>
                            </li>
                            <li>
                              <button data-text="Approve Aplication">
                                <span className="la la-check"></span> Approve
                                Aplication
                              </button>
                            </li>
                            <li>
                              <button data-text="Reject Aplication">
                                <span className="la la-times-circle"></span>{" "}
                                Reject Aplication
                              </button>
                            </li>
                          </ul>
                        </div>

                        <button
                          className="delete-btn"
                          data-text="Delete Aplication"
                        >
                          <span className="la la-trash"></span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Candidate block three */}
                  <div className="candidate-block-three">
                    <div className="inner-box">
                      <div className="content">
                        <figure className="image">
                          <img src="images/resource/candidate-4.png" alt="" />
                        </figure>
                        <h4 className="name">
                          <a href="#">Floyd Miles</a>
                        </h4>
                        <ul className="candidate-info">
                          <li className="designation">UI Designer</li>
                          <li>
                            <span className="icon flaticon-map-locator"></span>{" "}
                            London, UK
                          </li>
                          <li>
                            <span className="icon flaticon-money"></span> $99 /
                            hour
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
                        {/* Dashboard Option */}
                        <div className="dropdown resume-action">
                          <button
                            className="dropdown-toggle theme-btn btn-style-three"
                            role="button"
                            data-toggle="dropdown"
                            aria-expanded="false"
                          >
                            Action <i className="fa fa-angle-down"></i>
                          </button>

                          <ul className="dropdown-menu">
                            <li>
                              <button data-text="View Aplication">
                                <span className="la la-eye"></span> View
                                Aplication
                              </button>
                            </li>
                            <li>
                              <button data-text="Approve Aplication">
                                <span className="la la-check"></span> Approve
                                Aplication
                              </button>
                            </li>
                            <li>
                              <button data-text="Reject Aplication">
                                <span className="la la-times-circle"></span>{" "}
                                Reject Aplication
                              </button>
                            </li>
                          </ul>
                        </div>

                        <button
                          className="delete-btn"
                          data-text="Delete Aplication"
                        >
                          <span className="la la-trash"></span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pagination */}
                  <nav className="ls-pagination mb-5">
                    <ul>
                      <li className="prev">
                        <a href="#">
                          <i className="fa fa-arrow-left"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">1</a>
                      </li>
                      <li>
                        <a href="#" className="current-page">
                          2
                        </a>
                      </li>
                      <li>
                        <a href="#">3</a>
                      </li>
                      <li className="next">
                        <a href="#">
                          <i className="fa fa-arrow-right"></i>
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
