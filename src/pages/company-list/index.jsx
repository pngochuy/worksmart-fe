export const Index = () => {
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
            <h1 className="">
              Explore <span className="theme-color">100,000+</span> featured
              companies!
            </h1>
            <p className="">
              Look up company information and find the best place to work for
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
                    placeholder="Company Name"
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
            <div className="content-column col-lg-12 col-md-12 col-sm-12">
              <div className="ls-outer">
                <button
                  type="button"
                  className="theme-btn btn-style-two toggle-filters"
                >
                  Show Filters
                </button>

                {/* ls Switcher */}
                <div className="ls-switcher">
                  <div className="showing-result">
                    <div className="text">
                      {/* Showing <strong>41-60</strong> of <strong>944</strong>{" "}
                      employer */}
                      LIST OF FEATURED COMPANIES
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
                  {/* Company Block Four */}
                  <div className="company-block-four col-xl-3 col-lg-4 col-md-6 col-sm-12">
                    <div className="inner-box">
                      <button className="bookmark-btn">
                        <span className="flaticon-bookmark"></span>
                      </button>
                      <span className="featured">Featured</span>
                      <span className="company-logo">
                        <img
                          src="images/resource/company-logo/6-1.png"
                          alt=""
                        />
                      </span>
                      <h4>
                        <a href="/company-list/company-detail">Netflix</a>
                      </h4>
                      <ul className="job-info">
                        <li>
                          <span className="icon flaticon-map-locator"></span>{" "}
                          London, UK
                        </li>
                        <li>
                          <span className="icon flaticon-briefcase"></span>{" "}
                          Accounting / Finance
                        </li>
                      </ul>
                      <div className="job-type">Open Jobs – 2</div>
                    </div>
                  </div>
                  {/* Company Block Four */}
                  <div className="company-block-four col-xl-3 col-lg-4 col-md-6 col-sm-12">
                    <div className="inner-box">
                      <button className="bookmark-btn">
                        <span className="flaticon-bookmark"></span>
                      </button>
                      <span className="featured">Featured</span>
                      <span className="company-logo">
                        <img
                          src="images/resource/company-logo/6-1.png"
                          alt=""
                        />
                      </span>
                      <h4>
                        <a href="/company/company-detail">Netflix</a>
                      </h4>
                      <ul className="job-info">
                        <li>
                          <span className="icon flaticon-map-locator"></span>{" "}
                          London, UK
                        </li>
                        <li>
                          <span className="icon flaticon-briefcase"></span>{" "}
                          Accounting / Finance
                        </li>
                      </ul>
                      <div className="job-type">Open Jobs – 2</div>
                    </div>
                  </div>
                  {/* Company Block Four */}
                  <div className="company-block-four col-xl-3 col-lg-4 col-md-6 col-sm-12">
                    <div className="inner-box">
                      <button className="bookmark-btn">
                        <span className="flaticon-bookmark"></span>
                      </button>
                      <span className="featured">Featured</span>
                      <span className="company-logo">
                        <img
                          src="images/resource/company-logo/6-1.png"
                          alt=""
                        />
                      </span>
                      <h4>
                        <a href="/company/company-detail">Netflix</a>
                      </h4>
                      <ul className="job-info">
                        <li>
                          <span className="icon flaticon-map-locator"></span>{" "}
                          London, UK
                        </li>
                        <li>
                          <span className="icon flaticon-briefcase"></span>{" "}
                          Accounting / Finance
                        </li>
                      </ul>
                      <div className="job-type">Open Jobs – 2</div>
                    </div>
                  </div>
                  {/* Company Block Four */}
                  <div className="company-block-four col-xl-3 col-lg-4 col-md-6 col-sm-12">
                    <div className="inner-box">
                      <button className="bookmark-btn">
                        <span className="flaticon-bookmark"></span>
                      </button>
                      <span className="featured">Featured</span>
                      <span className="company-logo">
                        <img
                          src="images/resource/company-logo/6-1.png"
                          alt=""
                        />
                      </span>
                      <h4>
                        <a href="/company/company-detail">Netflix</a>
                      </h4>
                      <ul className="job-info">
                        <li>
                          <span className="icon flaticon-map-locator"></span>{" "}
                          London, UK
                        </li>
                        <li>
                          <span className="icon flaticon-briefcase"></span>{" "}
                          Accounting / Finance
                        </li>
                      </ul>
                      <div className="job-type">Open Jobs – 2</div>
                    </div>
                  </div>
                  {/* Company Block Four */}
                  <div className="company-block-four col-xl-3 col-lg-4 col-md-6 col-sm-12">
                    <div className="inner-box">
                      <button className="bookmark-btn">
                        <span className="flaticon-bookmark"></span>
                      </button>
                      <span className="featured">Featured</span>
                      <span className="company-logo">
                        <img
                          src="images/resource/company-logo/6-1.png"
                          alt=""
                        />
                      </span>
                      <h4>
                        <a href="/company/company-detail">Netflix</a>
                      </h4>
                      <ul className="job-info">
                        <li>
                          <span className="icon flaticon-map-locator"></span>{" "}
                          London, UK
                        </li>
                        <li>
                          <span className="icon flaticon-briefcase"></span>{" "}
                          Accounting / Finance
                        </li>
                      </ul>
                      <div className="job-type">Open Jobs – 2</div>
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
