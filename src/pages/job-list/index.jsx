import { useState, useEffect } from "react";
import { fetchJobs } from "../../services/jobServices";
import Pagination from "./Pagination";
import WorkTypeFilter from "./WorkTypeFilter";
import JobPositionDropdown from "./JobPositionDropdown";
import SalaryRangeDropdown from "./SalaryRangeDropdown";
import TagDropdown from "./TagDropdown";
export const Index = () => {
  const [jobs, setJobs] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [totalJob, setTotalJob] = useState(1);
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 3,
    Title: "",
    JobPosition: "",
    WorkTypes: [],
    Location: "",
    MinSalary: null,
    MaxSalary: null,
    Tags: [],
    MostRecent: null,
  });

  const getJobs = async () => {
    console.log("searchParams", searchParams);
    const data = await fetchJobs(searchParams);
    console.log("data", data);
    setJobs(data.jobs);
    setTotalPage(data.totalPage);
    setTotalJob(data.totalJob);
  };

  // Hàm cập nhật searchParams khi nhập liệu
  const handleInputChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleOrderChange = (e) => {
    const newOrder = e.target.value;
    setSearchParams((prev) => ({
      ...prev,
      MostRecent: newOrder,
      PageIndex: 1, // Reset về trang 1 khi thay đổi PageSize
    }));
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setSearchParams((prev) => ({
      ...prev,
      PageSize: newSize,
      PageIndex: 1, // Reset về trang 1 khi thay đổi PageSize
    }));
  };

  useEffect(() => {
    getJobs();
  }, [searchParams.PageSize, searchParams.PageIndex, searchParams.MostRecent]);
  return (
    <>
      {/*Page Title*/}
      <section
        className="page-title at-jlv16 before_none bg-white"
        style={{ marginTop: "111px" }}
      >
        <div className="auto-container">
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
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="row">
                {/* Form Group */}
                <div className="form-group col-lg-5 col-md-12 col-sm-12">
                  <span className="icon flaticon-search-1"></span>
                  <input
                    type="text"
                    name="Title"
                    placeholder="Job title"
                    value={searchParams.Title}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Form Group */}
                <div className="form-group col-lg-5 col-md-12 col-sm-12 location">
                  <span className="icon flaticon-map-locator"></span>
                  <input
                    type="text"
                    name="Location"
                    placeholder="City"
                    value={searchParams.Location}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Form Group */}
                <div className="form-group col-lg-2 col-md-12 col-sm-12 text-right">
                  <button
                    type="submit"
                    className="theme-btn btn-style-one"
                    onClick={getJobs}
                  >
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
      <section>
        <div className="auto-container">
          <div className="row">
            <div className="ls-switcher">
              <div className="showing-result" style={{ marginBottom: "0px" }}>
                <div className="top-filters">
                  <div className="form-group">
                    <SalaryRangeDropdown setSearchParams={setSearchParams} />
                  </div>
                  <div className="form-group">
                    {/* Form Group */}
                    <JobPositionDropdown
                      searchParams={searchParams}
                      setSearchParams={setSearchParams}
                    />
                  </div>
                  <div className="form-group">
                    {/* Form Group */}
                    <TagDropdown setSearchParams={setSearchParams} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="filters-backdrop"
            style={{ marginBottom: "50px" }}
          ></div>
        </div>
      </section>

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
                  <WorkTypeFilter
                    searchParams={searchParams}
                    setSearchParams={setSearchParams}
                  />
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
                      Showing{" "}
                      <strong>
                        {(searchParams.PageIndex - 1) * searchParams.PageSize +
                          1}{" "}
                        -{" "}
                        {Math.min(
                          searchParams.PageIndex * searchParams.PageSize,
                          totalJob
                        )}
                      </strong>{" "}
                      of
                      <strong>
                        {" "}
                        {Math.min(
                          totalPage * searchParams.PageSize,
                          totalJob
                        )}{" "}
                      </strong>
                      jobs
                    </div>
                  </div>
                  <div className="sort-by">
                    <select
                      className="chosen-select"
                      onChange={handleOrderChange}
                    >
                      <option value="true">Most Recent</option>
                      <option value="false">Least recent </option>
                    </select>

                    <select
                      className="chosen-select"
                      value={searchParams.PageSize}
                      onChange={handlePageSizeChange}
                    >
                      <option value="3">Show 3</option>
                      <option value="6">Show 6</option>
                      <option value="9">Show 9</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  {/* Job Block */}
                  {jobs && jobs.length > 0 ? (
                    jobs.map((job, index) => (
                      <div
                        key={index}
                        className="job-block at-jlv16 col-lg-12 col-sm-6"
                      >
                        <div className="inner-box">
                          <div className="tags d-flex align-items-center">
                            <a className="flaticon-bookmark" href=""></a>
                          </div>
                          <div className="content ps-0">
                            <div className="d-lg-flex align-items-center">
                              <span className="company-logo position-relative">
                                <img
                                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png"
                                  alt=""
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    objectFit: "cover",
                                  }}
                                />
                              </span>

                              <div className="ms-0 ms-lg-3 mt-3 mt-lg-0">
                                <h4 className="fz20 mb-2 mb-lg-0">
                                  <a href={`/job-list/${job.jobID}`}>
                                    {job.title}
                                  </a>
                                </h4>
                                <p className="mb-0">
                                  by{" "}
                                  <span className="fw500 text">
                                    {job.userID}
                                  </span>{" "}
                                  in Design & Creative
                                </p>
                              </div>
                            </div>
                            <ul className="job-other-info at-jsv6 at-jsv17 mt20 ms-0">
                              <li className="time">{job.workType}</li>
                              <li className="timee">{job.location}</li>
                              <li className="timeee ">${job.salary}/month</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <h4 className="fz20 mb-2 mb-lg-0">No Jobs</h4>
                  )}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={searchParams.PageIndex}
                  totalPage={totalPage}
                  setSearchParams={setSearchParams}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*End Listing Page Section */}
    </>
  );
};
