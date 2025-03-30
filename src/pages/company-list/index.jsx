import { useState, useEffect } from "react";
import { fetchCompanyList } from "../../services/employerServices";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export const Index = () => {
  // State for companies list
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3); // Changed from 8 to 3
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);

  // Fetch companies when search term or pagination changes
  useEffect(() => {
    const getCompanies = async () => {
      setLoading(true);
      try {
        const response = await fetchCompanyList(
          searchQuery,
          currentPage,
          pageSize
        );

        setCompanies(response.list);
        setTotalCompanies(response.total);
        // This line correctly calculates total pages from total records
        setTotalPages(Math.ceil(response.total / pageSize));
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to load companies");
      } finally {
        setLoading(false);
      }
    };

    getCompanies();
  }, [searchQuery, currentPage, pageSize]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Generate array of page numbers to display
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <>
      {/*Page Title*/}
      <section
        className="page-title style-two at-jlv16 before_none bg-white"
        style={{ marginTop: "111px" }}
      >
        <div className="auto-container">
          <div className="hero-at-jlv17 mb30">
            <h1 className="">
              Explore <span className="theme-color">{totalCompanies}+</span>{" "}
              featured companies!
            </h1>
            <p className="">
              Look up company information and find the best place to work for
              you
            </p>
          </div>
          <div className="job-search-form">
            <form method="post" onSubmit={handleSearch}>
              <div className="row">
                {/* Form Group */}
                <div className="form-group col-lg-10 col-md-12 col-sm-12">
                  <span className="icon flaticon-search-1"></span>
                  <input
                    type="text"
                    name="company_name"
                    placeholder="Company Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                      {loading ? (
                        "Loading..."
                      ) : (
                        <>
                          Showing{" "}
                          <strong>
                            {Math.min(
                              (currentPage - 1) * pageSize + 1,
                              totalCompanies
                            )}
                            -{Math.min(currentPage * pageSize, totalCompanies)}
                          </strong>{" "}
                          of <strong>{totalCompanies}</strong> companies
                        </>
                      )}
                    </div>
                  </div>
                  <div className="sort-by">
                    <select
                      className="chosen-select"
                      onChange={handlePageSizeChange}
                      value={pageSize}
                    >
                      <option value="3">Show 3</option>
                      <option value="6">Show 6</option>
                      <option value="9">Show 9</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : companies.length === 0 ? (
                  <div className="text-center py-5">
                    <h3>No companies found</h3>
                    <p>Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="row">
                    {companies.map((company) => (
                      <div
                        className="company-block-four col-xl-4 col-lg-4 col-md-4 col-sm-12"
                        key={company.userID}
                      >
                        <div className="inner-box">
                          <button className="bookmark-btn">
                            <span className="flaticon-bookmark"></span>
                          </button>
                          {company.verificationLevel >= 2 && (
                            <span className="featured">Featured</span>
                          )}
                          <span className="company-logo">
                            <img
                              src={
                                company.avatar ||
                                "https://www.shutterstock.com/image-vector/image-icon-trendy-flat-style-600nw-643080895.jpg"
                              }
                              alt={company.companyName}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://www.shutterstock.com/image-vector/image-icon-trendy-flat-style-600nw-643080895.jpg";
                              }}
                            />
                          </span>
                          <h4>
                            <Link
                              to={`/company-list/${encodeURIComponent(
                                company.companyName
                              )}`}
                            >
                              {company.companyName}
                            </Link>
                          </h4>
                          <ul className="job-info">
                            <li>
                              <span className="icon flaticon-map-locator"></span>{" "}
                              {company.address || "Not specified"}
                            </li>
                            <li>
                              <span className="icon flaticon-briefcase"></span>{" "}
                              {company.industry || "Various industries"}
                            </li>
                          </ul>
                          <div className="job-type">
                            Open Jobs – {company.postedJobs?.length || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {!loading && companies.length > 0 && (
                  <nav className="ls-pagination">
                    <ul>
                      <li className="prev">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage - 1);
                          }}
                          style={{
                            cursor:
                              currentPage === 1 ? "not-allowed" : "pointer",
                          }}
                        >
                          <i className="fa fa-arrow-left"></i>
                        </a>
                      </li>

                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <li key={pageNum}>
                            <a
                              href="#"
                              className={
                                currentPage === pageNum ? "current-page" : ""
                              }
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(pageNum);
                              }}
                            >
                              {pageNum}
                            </a>
                          </li>
                        );
                      })}

                      <li className="next">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage + 1);
                          }}
                          style={{
                            cursor:
                              currentPage === totalPages
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          <i className="fa fa-arrow-right"></i>
                        </a>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*End Listing Page Section */}
    </>
  );
};
