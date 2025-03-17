import { useState, useEffect } from "react";
import { fetchJobs } from "../../services/jobServices";
import Pagination from "./Pagination";
import WorkTypeFilter from "./WorkTypeFilter";
import JobPositionDropdown from "./JobPositionDropdown";
import SalaryRangeDropdown from "./SalaryRangeDropdown";
import TagDropdown from "./TagDropdown";
import CategoryDropdown from "./CategoryDropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Index = () => {
  const [jobs, setJobs] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [totalJob, setTotalJob] = useState(1);
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 9, // Changed default to 9 to support 3x3 grid
    Category: "",
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

  const handleOrderChange = (value) => {
    setSearchParams((prev) => ({
      ...prev,
      MostRecent: value,
      PageIndex: 1, // Reset về trang 1 khi thay đổi PageSize
    }));
  };

  const handlePageSizeChange = (value) => {
    const newSize = parseInt(value);
    setSearchParams((prev) => ({
      ...prev,
      PageSize: newSize,
      PageIndex: 1, // Reset về trang 1 khi thay đổi PageSize
    }));
  };

  useEffect(() => {
    getJobs();
  }, [
    searchParams.PageSize,
    searchParams.PageIndex,
    searchParams.MostRecent,
    searchParams.Category,
  ]);

  // Function to chunk jobs array into rows of 3
  const chunkJobs = (jobs, chunkSize = 3) => {
    if (!jobs || jobs.length === 0) return [];

    const result = [];
    for (let i = 0; i < jobs.length; i += chunkSize) {
      result.push(jobs.slice(i, i + chunkSize));
    }
    return result;
  };

  // Create chunks of jobs for the 3x3 grid layout
  const jobRows = chunkJobs(jobs);

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
                    <CategoryDropdown setSearchParams={setSearchParams} />
                  </div>
                  <div className="form-group">
                    {/* Form Group */}
                    <TagDropdown
                      setSearchParams={setSearchParams}
                      searchParams={searchParams}
                    />
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
                    {/* Replace regular select with shadcn Select component */}
                    <Select
                      onValueChange={handleOrderChange}
                      defaultValue="true"
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Most Recent</SelectItem>
                        <SelectItem value="false">Least Recent</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="ml-4">
                      <Select
                        onValueChange={handlePageSizeChange}
                        defaultValue={searchParams.PageSize.toString()}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Show" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">Show 3</SelectItem>
                          <SelectItem value="6">Show 6</SelectItem>
                          <SelectItem value="9">Show 9</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* New job grid layout - 3 rows x 3 jobs per row */}
                {jobs && jobs.length > 0 ? (
                  <div className="job-grid">
                    {jobRows.map((row, rowIndex) => (
                      <div key={rowIndex} className="row mb-4">
                        {row.map((job, jobIndex) => (
                          <div
                            key={jobIndex}
                            className="col-lg-4 col-md-6 col-sm-12 mb-4"
                          >
                            <div
                              className="job-card  h-full shadow-sm rounded-lg overflow-hidden border"
                              style={{ backgroundColor: "#fff" }}
                            >
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="company-logo">
                                    <img
                                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png"
                                      alt=""
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  </div>
                                  <a
                                    className="text-gray-400 hover:text-blue-500"
                                    href=""
                                  >
                                    <i className="flaticon-bookmark"></i>
                                  </a>
                                </div>

                                <h4 className="text-lg font-medium mb-2">
                                  <a
                                    href={`/job-list/${job.jobID}`}
                                    className="hover:text-blue-600"
                                  >
                                    {job.title}
                                  </a>
                                </h4>

                                <p className="text-sm text-gray-600 mb-3">
                                  by{" "}
                                  <span className="font-medium">
                                    {job.userID}
                                  </span>{" "}
                                  in Design & Creative
                                </p>

                                <div className="job-tags flex flex-wrap gap-2 mt-3">
                                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-md">
                                    {job.workType}
                                  </span>
                                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-md">
                                    {job.location}
                                  </span>
                                  <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-md">
                                    {job.salary.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <h4 className="text-xl font-medium text-gray-600">
                      No Jobs Found
                    </h4>
                  </div>
                )}

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
