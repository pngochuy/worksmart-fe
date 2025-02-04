export const index = () => {
  return (
    <>
      {/*Page Title*/}
      <section className="page-title style-two at-jlv16 before_none bg-white">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Find Jobs</h1>
            <ul className="page-breadcrumb">
              <li>
                <a href="index.html">Home</a>
              </li>
              <li>Jobs</li>
            </ul>
          </div>

          {/* Job Search Form */}
          <div className="hero-at-jlv17 mb30">
            <h1 className="">
              There Are <span className="theme-color">93,178</span> Postings
              Here For you!
            </h1>
            <p className="">
              Discover your next career move, freelance project, or internship
            </p>
          </div>
          <div className="job-search-form">
            <form method="post" action="job-list-v10.html">
              <div className="row">
                {/* Form Group */}
                <div className="form-group col-lg-4 col-md-12 col-sm-12">
                  <span className="icon flaticon-search-1"></span>
                  <input
                    type="text"
                    name="field_name"
                    placeholder="Job title, keywords, or company"
                  />
                </div>

                {/* Form Group */}
                <div className="form-group col-lg-3 col-md-12 col-sm-12 location">
                  <span className="icon flaticon-map-locator"></span>
                  <input type="text" name="field_name" placeholder="City" />
                </div>

                {/* Form Group */}
                <div className="form-group col-lg-3 col-md-12 col-sm-12 location">
                  <span className="icon flaticon-briefcase"></span>
                  <select className="chosen-select">
                    <option value="">All Categories</option>
                    <option value="44">Accounting / Finance</option>
                    <option value="106">Automotive Jobs</option>
                    <option value="46">Customer</option>
                    <option value="48">Design</option>
                    <option value="47">Development</option>
                    <option value="45">Health and Care</option>
                    <option value="105">Marketing</option>
                    <option value="107">Project Management</option>
                  </select>
                </div>

                {/* Form Group */}
                <div className="form-group col-lg-2 col-md-12 col-sm-12 text-right">
                  <button type="submit" className="theme-btn btn-style-one">
                    Find Jobs
                  </button>
                </div>
              </div>
            </form>
          </div>
          {/* Job Search Form */}
        </div>
      </section>
      {/*End Page Title*/}

      {/* Listing Section */}
      <section className="ls-section at-jlv16">
        <div className="auto-container">
          <div className="filters-backdrop"></div>

          <div className="row">
            {/* Filters Column */}
            <div className="filters-column col-lg-3">
              <div className="inner-column">
                <div className="filters-outer bg-transparent">
                  <button type="button" className="theme-btn close-filters">
                    X
                  </button>

                  {/* Switchbox Outer */}
                  <div className="switchbox-outer">
                    <h4>Job type</h4>
                    <ul className="switchbox at-jlv16">
                      <li className="mb-0">
                        <label className="switch">
                          <input type="checkbox" defaultChecked />
                          <span className="slider round"></span>
                          <span className="title">Freelance</span>
                        </label>
                      </li>
                      <li className="mb-0">
                        <label className="switch">
                          <input type="checkbox" />
                          <span className="slider round"></span>
                          <span className="title">Full Time</span>
                        </label>
                      </li>
                      <li className="mb-0">
                        <label className="switch">
                          <input type="checkbox" />
                          <span className="slider round"></span>
                          <span className="title">Internship</span>
                        </label>
                      </li>
                      <li className="mb-0">
                        <label className="switch">
                          <input type="checkbox" />
                          <span className="slider round"></span>
                          <span className="title">Part Time</span>
                        </label>
                      </li>
                    </ul>
                  </div>

                  {/* Checkboxes Ouer */}
                  <div className="checkbox-outer">
                    <h4>Experience</h4>
                    <ul className="checkboxes square at-jlv16">
                      <li>
                        <input id="check-l" type="checkbox" name="check" />
                        <label htmlFor="check-l">No Experience</label>
                      </li>
                      <li>
                        <input
                          id="check-m"
                          type="checkbox"
                          name="check"
                          defaultChecked
                        />
                        <label htmlFor="check-m">0-1 Year</label>
                      </li>
                      <li>
                        <input id="check-n" type="checkbox" name="check" />
                        <label htmlFor="check-n">2 Years</label>
                      </li>
                      <li>
                        <input id="check-o" type="checkbox" name="check" />
                        <label htmlFor="check-o">3 Years</label>
                      </li>
                      <li>
                        <input id="check-p" type="checkbox" name="check" />
                        <label htmlFor="check-p">4 - 5 Years</label>
                      </li>
                      <li>
                        <input id="check-p" type="checkbox" name="check" />
                        <label htmlFor="check-p">Over 5 Years</label>
                      </li>
                      {/* <li>
                        <button className="view-more">
                          <span className="icon flaticon-plus"></span> View More
                        </button>
                      </li> */}
                    </ul>
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Salary</h4>
                    <ul className="checkboxes square at-jlv16">
                      <li>
                        <input
                          id="check-l"
                          type="checkbox"
                          name="salary"
                          defaultChecked
                        />
                        <label htmlFor="check-l">All</label>
                      </li>
                      <li>
                        <input id="check-m" type="checkbox" name="salary" />
                        <label htmlFor="check-m">0 - 10.000.000</label>
                      </li>
                      <li>
                        <input id="check-m" type="checkbox" name="salary" />
                        <label htmlFor="check-m">10.000.000 - 20.000.000</label>
                      </li>
                      <li>
                        <input id="check-m" type="checkbox" name="salary" />
                        <label htmlFor="check-m">20.000.000 - 30.000.000</label>
                      </li>
                      <li>
                        <input id="check-m" type="checkbox" name="salary" />
                        <label htmlFor="check-m">30.000.000 - 40.000.000</label>
                      </li>
                      <li>
                        <input id="check-m" type="checkbox" name="salary" />
                        <label htmlFor="check-m">40.000.000 - 50.000.000</label>
                      </li>
                      <li>
                        <input id="check-m" type="checkbox" name="salary" />
                        <label htmlFor="check-m">Over 50.000.000</label>
                      </li>
                      <li>
                        <input id="check-m" type="checkbox" name="salary" />
                        <label htmlFor="check-m">Based on Deal</label>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* End Call To Action */}
              </div>
            </div>

            {/* Content Column */}
            <div className="content-column col-lg-9">
              <div className="ls-outer">
                <button
                  type="button"
                  className="theme-btn btn-style-two toggle-filters"
                >
                  Show Filters
                </button>
                {/* ls Switcher */}
                <div className="ls-switcher at-jlv17">
                  <div className="showing-result">
                    <div className="text">
                      Showing <strong>41-60</strong> of <strong>944</strong>{" "}
                      jobs
                    </div>
                  </div>
                  <div className="sort-by">
                    <select className="chosen-select">
                      <option>New Jobs</option>
                      <option>Freelance</option>
                      <option>Full Time</option>
                      <option>Internship</option>
                      <option>Part Time</option>
                      <option>Temporary</option>
                    </select>

                    <select className="chosen-select">
                      <option>Show 10</option>
                      <option>Show 20</option>
                      <option>Show 30</option>
                      <option>Show 40</option>
                      <option>Show 50</option>
                      <option>Show 60</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  {/* Job Block */}
                  <div className="job-block at-jlv16 col-lg-12 col-sm-6">
                    <div className="inner-box">
                      <div className="tags d-flex align-items-center">
                        <a className="flaticon-bookmark" href=""></a>
                      </div>
                      <div className="content ps-0">
                        <div className="d-lg-flex align-items-center">
                          <span className="company-logo position-relative">
                            <img
                              src="images/resource/company-logo/3-1.png"
                              alt=""
                            />
                          </span>
                          <div className="ms-0 ms-lg-3 mt-3 mt-lg-0">
                            <h4 className="fz20 mb-2 mb-lg-0">
                              <a href="/job-list/job-detail">
                                Business Analyst (N2 Up)
                              </a>
                            </h4>
                            <p className="mb-0">
                              by <span className="fw500 text">HuyPN</span> in
                              Design & Creative
                            </p>
                          </div>
                        </div>
                        <ul className="job-other-info at-jsv6 at-jsv17 mt20 ms-0">
                          <li className="time">Full Time</li>
                          <li className="time2">London, UK</li>
                          <li className="time2">450 - $900/month</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Job Block */}
                  <div className="job-block at-jlv16 active col-lg-12 col-sm-6">
                    <div className="inner-box">
                      <div className="tags d-flex align-items-center">
                        <a className="flaticon-bookmark" href=""></a>
                      </div>
                      <div className="content ps-0">
                        <div className="d-lg-flex align-items-center">
                          <span className="company-logo position-relative">
                            <img
                              src="images/resource/company-logo/3-2.png"
                              alt=""
                            />
                          </span>
                          <div className="ms-0 ms-lg-3 mt-3 mt-lg-0">
                            <h4 className="fz20 mb-2 mb-lg-0">
                              <a href="#">Business Analyst (N2 Up)</a>
                            </h4>
                            <p className="mb-0">
                              by <span className="fw500 text">HuyPN</span> in
                              Design & Creative
                            </p>
                          </div>
                        </div>
                        <ul className="job-other-info at-jsv6 at-jsv17 mt20 ms-0">
                          <li className="time">Full Time</li>
                          <li className="time2">London, UK</li>
                          <li className="time2">450 - $900/month</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Job Block */}
                  <div className="job-block at-jlv16 active col-lg-12 col-sm-6">
                    <div className="inner-box">
                      <div className="tags d-flex align-items-center">
                        <a className="flaticon-bookmark" href=""></a>
                      </div>
                      <div className="content ps-0">
                        <div className="d-lg-flex align-items-center">
                          <span className="company-logo position-relative">
                            <img
                              src="images/resource/company-logo/3-4.png"
                              alt=""
                            />
                          </span>
                          <div className="ms-0 ms-lg-3 mt-3 mt-lg-0">
                            <h4 className="fz20 mb-2 mb-lg-0">
                              <a href="#">Business Analyst (N2 Up)</a>
                            </h4>
                            <p className="mb-0">
                              by <span className="fw500 text">HuyPN</span> in
                              Design & Creative
                            </p>
                          </div>
                        </div>
                        <ul className="job-other-info at-jsv6 at-jsv17 mt20 ms-0">
                          <li className="time">Full Time</li>
                          <li className="time2">London, UK</li>
                          <li className="time2">450 - $900/month</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Job Block */}
                  <div className="job-block at-jlv16 col-lg-12 col-sm-6">
                    <div className="inner-box">
                      <div className="tags d-flex align-items-center">
                        <a className="flaticon-bookmark" href=""></a>
                      </div>
                      <div className="content ps-0">
                        <div className="d-lg-flex align-items-center">
                          <span className="company-logo position-relative">
                            <img
                              src="images/resource/company-logo/3-3.png"
                              alt=""
                            />
                          </span>
                          <div className="ms-0 ms-lg-3 mt-3 mt-lg-0">
                            <h4 className="fz20 mb-2 mb-lg-0">
                              <a href="#">Business Analyst (N2 Up)</a>
                            </h4>
                            <p className="mb-0">
                              by <span className="fw500 text">HuyPN</span> in
                              Design & Creative
                            </p>
                          </div>
                        </div>
                        <ul className="job-other-info at-jsv6 at-jsv17 mt20 ms-0">
                          <li className="time">Full Time</li>
                          <li className="time2">London, UK</li>
                          <li className="time2">450 - $900/month</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                {/* <div className="ls-show-more">
                  <p>Showing 36 of 497 Jobs</p>
                  <div className="bar">
                    <span className="bar-inner" style={{ width: "40%" }}></span>
                  </div>
                  <button className="show-more">Show More</button>
                </div> */}
                {/* Pagination */}
                <nav className="ls-pagination">
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
      </section>
      {/*End Listing Page Section */}
    </>
  );
};
