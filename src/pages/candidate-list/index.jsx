export const index = () => {
  return (
    <>
      {/*Page Title*/}
      <section
        className="page-title style-two at-jlv16 before_none bg-white"
        style={{ marginTop: "111px" }}
      >
        <div className="auto-container">
          {/* <div className="title-outer">
            <h1>Find Company</h1>
            <ul className="page-breadcrumb">
              <li>
                <a href="index.html">Home</a>
              </li>
              <li>Companies</li>
            </ul>
          </div> */}

          {/* Job Search Form */}
          <div className="hero-at-jlv17 mb30">
            <h1 className="">Hire people for your business!</h1>
            <p className="">
              Look up candidate information and find the best person to work for
              you
            </p>
          </div>
          <div className="job-search-form">
            <form method="post" action="job-list-v10.html">
              <div className="row">
                {/* Form Group */}
                <div className="form-group col-lg-10 col-md-12 col-sm-12">
                  <span className="icon flaticon-search-1"></span>
                  <input
                    type="text"
                    name="field_name"
                    placeholder="Candidate Name"
                  />
                </div>

                {/* Form Group */}
                <div className="form-group col-lg-2 col-md-12 col-sm-12 text-right">
                  <button type="submit" className="theme-btn btn-style-one">
                    Search
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
      <section className="ls-section">
        <div className="auto-container">
          <div className="filters-backdrop"></div>

          <div className="row">
            {/* Content Column */}
            <div className="content-column col-lg-12">
              <div className="ls-outer">
                {/* ls Switcher */}
                <div className="ls-switcher">
                  <div className="showing-result">
                    <div className="top-filters">
                      <div className="form-group">
                        <select className="chosen-select">
                          <option>Candidate Gender</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <select className="chosen-select">
                          <option>Date Posted</option>
                          <option>New Jobs</option>
                          <option>Freelance</option>
                          <option>Full Time</option>
                          <option>Internship</option>
                          <option>Part Time</option>
                          <option>Temporary</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <select className="chosen-select">
                          <option>Experience Level</option>
                          <option>New Jobs</option>
                          <option>Freelance</option>
                          <option>Full Time</option>
                          <option>Internship</option>
                          <option>Part Time</option>
                          <option>Temporary</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <select className="chosen-select">
                          <option>Education Level</option>
                          <option>New Jobs</option>
                          <option>Freelance</option>
                          <option>Full Time</option>
                          <option>Internship</option>
                          <option>Part Time</option>
                          <option>Temporary</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="sort-by">
                    <select className="chosen-select">
                      <option>Most Recent</option>
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
                  {/* Candidate block Four */}
                  <div className="candidate-block-four col-lg-4 col-md-6 col-sm-12">
                    <div className="inner-box">
                      <ul className="job-other-info">
                        <li className="green">Featured</li>
                      </ul>
                      <span className="thumb">
                        <img src="images/resource/candidate-1.png" alt="" />
                      </span>
                      <h3 className="name">
                        <a href="/candidate-list/candidate-detail">
                          Floyd Miles
                        </a>
                      </h3>
                      <span className="cat">UI Designer</span>
                      <ul className="job-info">
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
                      <a href="#" className="theme-btn btn-style-three">
                        View Profile
                      </a>
                    </div>
                  </div>

                  {/* Candidate block Four */}
                  <div className="candidate-block-four col-lg-4 col-md-6 col-sm-12">
                    <div className="inner-box">
                      <ul className="job-other-info">
                        <li className="green">Featured</li>
                      </ul>
                      <span className="thumb">
                        <img src="images/resource/candidate-2.png" alt="" />
                      </span>
                      <h3 className="name">
                        <a href="#">Darrell Steward</a>
                      </h3>
                      <span className="cat">UI Designer</span>
                      <ul className="job-info">
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
                      <a href="#" className="theme-btn btn-style-three">
                        View Profile
                      </a>
                    </div>
                  </div>

                  {/* Candidate block Four */}
                  <div className="candidate-block-four col-lg-4 col-md-6 col-sm-12">
                    <div className="inner-box">
                      <ul className="job-other-info">
                        <li className="green">Featured</li>
                      </ul>
                      <span className="thumb">
                        <img src="images/resource/candidate-3.png" alt="" />
                      </span>
                      <h3 className="name">
                        <a href="#">Brooklyn Simmons</a>
                      </h3>
                      <span className="cat">UI Designer</span>
                      <ul className="job-info">
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
                      <a href="#" className="theme-btn btn-style-three">
                        View Profile
                      </a>
                    </div>
                  </div>
                </div>

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
