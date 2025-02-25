import { useState, useEffect } from "react";
import { fetchCandidates } from "../../services/candidateServices";
import MajorDropdown from "./MajorDropdown";
import EducationDropdown from "./EducationDropdown";
import WorkTypeDropdown from "./WorkTypeDropdown";
import Pagination from "./Pagination";
export const Index = () => {
  const [candidates, setCandidates] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 3,
    Name: "",
    Education: "",
    Major: "",
    Skill: "",
    JobPosition: "",
    Exp: 0,
    WorkType: "",
    LastUpdatedAt: null,
  });

  const getCandidates = async () => {
    console.log("hoho", searchParams);
    const data = await fetchCandidates(searchParams);
    console.log("hehe", data);
    setCandidates(data.candidates);
    setTotalPage(data.totalPage);
  };

  useEffect(() => {
    getCandidates();
  }, [searchParams.PageSize, searchParams.PageIndex]);

  // Hàm cập nhật searchParams khi nhập liệu
  const handleInputChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setSearchParams((prev) => ({
      ...prev,
      PageSize: newSize,
      PageIndex: 1, // Reset về trang 1 khi thay đổi PageSize
    }));
  };

  return (
    <>
      {/*Page Title*/}
      <section
        className="page-title at-jlv16 before_none bg-white"
        style={{ marginTop: "111px" }}
      >
        <div className="auto-container">
          <div className="hero-at-jlv17 mb30">
            <h1>Hire people for your business!</h1>
            <p>
              Look up candidate information and find the best person to work for
              you
            </p>
          </div>
          <div className="job-search-form">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="row">
                <div className="form-group col-lg-7">
                  <span className="icon flaticon-search-1"></span>
                  <input
                    type="text"
                    name="Name"
                    placeholder="Candidate Name"
                    value={searchParams.Name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group col-lg-2">
                  <input
                    type="text"
                    name="JobPosition"
                    placeholder="Job Position"
                    value={searchParams.JobPosition}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group col-lg-1">
                  <input
                    type="number"
                    name="Exp"
                    placeholder="Years"
                    min="0"
                    value={searchParams.Exp}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.preventDefault()} // Chặn nhập từ bàn phím
                  />
                </div>
                <div className="form-group col-lg-2 text-right">
                  <button
                    type="button"
                    className="theme-btn btn-style-one"
                    onClick={getCandidates}
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
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
                        <WorkTypeDropdown setSearchParams={setSearchParams} />
                      </div>
                      <div className="form-group">
                        <MajorDropdown setSearchParams={setSearchParams} />
                      </div>
                      <div className="form-group">
                        <EducationDropdown setSearchParams={setSearchParams} />
                      </div>
                    </div>
                  </div>

                  <div className="sort-by">
                    <select className="chosen-select">
                      <option>Most Recent</option>
                      <option>Least recent </option>
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
                  <div className="row">
                    {candidates.map((candidate, index) => (
                      <div
                        key={index}
                        className="candidate-block-four col-lg-4 col-md-6 col-sm-12"
                      >
                        <div className="inner-box">
                          <ul className="job-other-info">
                            <li className="green">Featured</li>
                          </ul>
                          <span className="thumb">
                            <img
                              src={candidate.avatar}
                              alt={candidate.fullName}
                            />
                          </span>
                          <h3 className="name">
                            <a href="#">{candidate.fullName}</a>
                          </h3>
                          <span className="cat">{candidate.role}</span>
                          <ul className="job-info">
                            <li>
                              <span className="icon flaticon-map-locator"></span>{" "}
                              {candidate.address || "Unknown Location"}
                            </li>
                            <li>
                              <span className="icon flaticon-money"></span> $
                              {candidate.amount || 0} / hour
                            </li>
                          </ul>
                          <ul className="post-tags">
                            {candidate.tags && candidate.tags.length > 0
                              ? candidate.tags.map((tag, i) => (
                                  <li key={i}>
                                    <a href="#">{tag}</a>
                                  </li>
                                ))
                              : "No Tags"}
                          </ul>
                          <a href="#" className="theme-btn btn-style-three">
                            View Profile
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
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
