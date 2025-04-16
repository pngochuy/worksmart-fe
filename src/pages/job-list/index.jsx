import { useState, useEffect, useRef } from "react";
import { fetchJobs } from "../../services/jobServices";
import { expandSearchTerms } from "./action";
import { useLocation } from "react-router-dom";
import WorkTypeFilter from "./WorkTypeFilter";
import JobPositionDropdown from "./JobPositionDropdown";
import SalaryRangeDropdown from "./SalaryRangeDropdown";
import TagDropdown from "./TagDropdown";
import CategoryDropdown from "./CategoryDropdown";
import EnhancedPagination from "./EnhancedPagination";
import {
  Building2,
  Users,
  MapPin,
  Calendar,
  BriefcaseBusiness,
  GraduationCap,
  Clock,
  Heart,
  CalendarDays,
  Sparkle,
  Loader2,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Index = () => {
  const [jobs, setJobs] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [totalJob, setTotalJob] = useState(1);
  const [groupedJobs, setGroupedJobs] = useState({});
  const [hoveredJob, setHoveredJob] = useState(null);
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 5,
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
  const [isExpanding, setIsExpanding] = useState(false);
  const [relatedKeywords, setRelatedKeywords] = useState([]);
  const [originalKeyword, setOriginalKeyword] = useState("");
  const [displayTitle, setDisplayTitle] = useState("");
  const [expandKeywords, setExpandKeywords] = useState(false); // State để theo dõi trạng thái mở rộng
  const locationHook = useLocation();

  // Ref để theo dõi trạng thái search params mới nhất
  const searchParamsRef = useRef(searchParams);

  // Di chuyển định nghĩa handleSearch lên trước useEffect
  const handleSearch = async (e) => {
    e.preventDefault();

    const searchTerm = displayTitle; // Sử dụng displayTitle

    console.log("handleSearch called with term:", searchTerm);

    if (searchTerm && searchTerm.trim() !== "") {
      try {
        setIsExpanding(true);

        // Lưu từ khóa gốc
        setOriginalKeyword(searchTerm);

        // Gọi AI để mở rộng từ khóa
        const keywordsList = await expandSearchTerms(searchTerm);

        // Loại bỏ từ khóa gốc từ danh sách các từ khóa liên quan
        const filteredKeywords = keywordsList.filter(
          (keyword) => keyword.toLowerCase() !== searchTerm.toLowerCase()
        );

        // Đặt danh sách các từ khóa liên quan để hiển thị
        setRelatedKeywords(filteredKeywords);

        // Tạo chuỗi tất cả các từ khóa để tìm kiếm
        const allKeywords = keywordsList.join(", ");

        // Cập nhật searchParams và searchParamsRef.current cùng lúc
        const newParams = {
          ...searchParams,
          Title: allKeywords,
          PageIndex: 1,
        };

        // Cập nhật searchParamsRef trước khi gọi API
        searchParamsRef.current = newParams;

        // Cập nhật state React (không cần đợi cập nhật xong)
        setSearchParams(newParams);

        // Gọi getJobs ngay lập tức với searchParamsRef.current đã cập nhật
        getJobs();
      } catch (error) {
        console.error("Error expanding search terms:", error);

        // Xử lý lỗi tương tự
        const newParams = {
          ...searchParams,
          Title: searchTerm,
          PageIndex: 1,
        };
        searchParamsRef.current = newParams;
        setSearchParams(newParams);
        getJobs();
      } finally {
        setIsExpanding(false);
      }
    } else {
      // Nếu không có từ khóa, thực hiện tìm kiếm bình thường
      setRelatedKeywords([]);
      setOriginalKeyword("");
      const newParams = {
        ...searchParams,
        Title: "",
      };
      searchParamsRef.current = newParams;
      setSearchParams(newParams);
      getJobs();
    }
  };

  // Cập nhật ref khi searchParams thay đổi
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // Đồng bộ hóa displayTitle với searchParams.Title ban đầu
  useEffect(() => {
    setDisplayTitle(searchParams.Title);
  }, []);

  // Cập nhật useEffect xử lý navigation
  useEffect(() => {
    const processNavigationState = async () => {
      if (locationHook.state) {
        console.log("Received state from navigation:", locationHook.state);

        // Destructure state đúng cách
        const {
          title = "",
          location = "",
          expand = false,
        } = locationHook.state;

        if (title || location) {
          console.log("Processing navigation with title:", title);

          // Cập nhật displayTitle trước
          setDisplayTitle(title);

          // Tìm kiếm trực tiếp thay vì thông qua handleSearch
          // nếu cần mở rộng AI
          if (expand && title) {
            // Đánh dấu đang loading
            setIsExpanding(true);

            try {
              console.log("Expanding search with AI for:", title);

              // Lưu từ khóa gốc
              setOriginalKeyword(title);

              // Gọi API mở rộng từ khóa
              const keywordsList = await expandSearchTerms(title);

              // Lọc từ khóa gốc
              const filteredKeywords = keywordsList.filter(
                (keyword) => keyword.toLowerCase() !== title.toLowerCase()
              );

              // Cập nhật từ khóa liên quan
              setRelatedKeywords(filteredKeywords);

              // Join tất cả từ khóa
              const allKeywords = keywordsList.join(", ");

              // Cập nhật params
              const newParams = {
                ...searchParams,
                Title: allKeywords,
                Location: location || searchParams.Location,
                PageIndex: 1,
              };

              // Cập nhật ref và state
              searchParamsRef.current = newParams;
              setSearchParams(newParams);

              // Gọi API tìm kiếm
              getJobs();
            } catch (error) {
              console.error("Error expanding search:", error);

              // Fallback nếu lỗi
              const newParams = {
                ...searchParams,
                Title: title,
                Location: location || searchParams.Location,
                PageIndex: 1,
              };
              searchParamsRef.current = newParams;
              setSearchParams(newParams);
              getJobs();
            } finally {
              setIsExpanding(false);
            }
          } else {
            // Không cần mở rộng, tìm kiếm thông thường
            const newParams = {
              ...searchParams,
              Title: title,
              Location: location || searchParams.Location,
              PageIndex: 1,
            };

            // Cập nhật ref và state
            searchParamsRef.current = newParams;
            setSearchParams(newParams);

            // Gọi API tìm kiếm
            getJobs();
          }
        }

        // Xóa state sau khi xử lý
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    };

    // Chạy function xử lý
    processNavigationState();
  }, [locationHook.state]); // useEffect chạy khi state thay đổi

  // Cập nhật useEffect xử lý stateKey để luôn chạy AI trước khi fetch
  useEffect(() => {
    const handleURLWithStateKey = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const stateKey = queryParams.get("stateKey");
        const from = queryParams.get("from");
        const title = queryParams.get("title"); // Fallback

        console.log("URL params:", { stateKey, from, title });

        // Lấy keyword từ localStorage nếu đến từ từ khóa liên quan
        if (stateKey && from === "related") {
          // Lấy keyword từ localStorage
          const keyword = localStorage.getItem(stateKey);
          console.log("Retrieved keyword from localStorage:", keyword);

          // Nếu có keyword từ localStorage, sử dụng nó
          if (keyword) {
            // Cập nhật displayTitle và originalKeyword
            setDisplayTitle(keyword);
            setOriginalKeyword(keyword);

            // Đánh dấu đang mở rộng từ khóa
            setIsExpanding(true);

            try {
              // Chạy AI để mở rộng từ khóa trước khi fetch
              console.log("Expanding search with AI for:", keyword);
              const keywordsList = await expandSearchTerms(keyword);

              // Lọc từ khóa gốc từ danh sách các từ khóa liên quan
              const filteredKeywords = keywordsList.filter(
                (kw) => kw.toLowerCase() !== keyword.toLowerCase()
              );

              // Đặt danh sách các từ khóa liên quan để hiển thị
              setRelatedKeywords(filteredKeywords);

              // Tạo chuỗi tất cả các từ khóa để tìm kiếm
              const allKeywords = keywordsList.join(", ");

              // Cập nhật searchParams và searchParamsRef.current cùng lúc
              const newParams = {
                ...searchParams,
                Title: allKeywords, // Cập nhật Title cho API với tất cả từ khóa
                PageIndex: 1,
              };

              // Cập nhật searchParamsRef trước khi gọi API
              searchParamsRef.current = newParams;
              setSearchParams(newParams);

              // Gọi API với tất cả các từ khóa
              console.log(
                "Calling fetchJobs with expanded keywords:",
                newParams
              );
              fetchJobs(newParams)
                .then((data) => {
                  setJobs(data.jobs || []);
                  setTotalPage(data.totalPage || 1);
                  setTotalJob(data.totalJob || 0);

                  // Group jobs by company
                  const grouped = {};
                  data.jobs.forEach((job) => {
                    if (!grouped[job.companyName]) {
                      grouped[job.companyName] = {
                        companyName: job.companyName,
                        avatar: job.avatar,
                        jobs: [],
                      };
                    }
                    grouped[job.companyName].jobs.push(job);
                  });
                  setGroupedJobs(grouped);
                })
                .catch((error) => {
                  console.error("Error fetching jobs:", error);
                })
                .finally(() => {
                  // Xóa dữ liệu đã sử dụng
                  localStorage.removeItem(stateKey);
                });
            } catch (error) {
              console.error("Error expanding search terms:", error);

              // Fallback nếu AI fail: tìm kiếm với từ khóa gốc
              const newParams = {
                ...searchParams,
                Title: keyword,
                PageIndex: 1,
              };

              searchParamsRef.current = newParams;
              setSearchParams(newParams);
              getJobs();
            } finally {
              setIsExpanding(false);

              // Xóa query params khỏi URL (sau khi đã xử lý)
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname
              );
            }
          }
          // Fallback: nếu không có keyword trong localStorage, sử dụng title từ URL
          else if (title) {
            // Tương tự như trên, nhưng sử dụng title từ URL
            setDisplayTitle(title);
            setOriginalKeyword(title);
            setIsExpanding(true);

            // Xử lý tương tự như trên với title từ URL
            try {
              const keywordsList = await expandSearchTerms(title);
              // ... xử lý tương tự
            } catch (error) {
              // ... xử lý lỗi
            } finally {
              setIsExpanding(false);
            }
          }
        }
      } catch (error) {
        console.error("Error processing URL parameters:", error);
        setIsExpanding(false);
      }
    };

    // Gọi hàm xử lý khi component mount
    handleURLWithStateKey();
  }, []);

  const getJobs = async () => {
    try {
      // Sử dụng searchParamsRef.current thay vì searchParams
      console.log("getJobs called with params:", searchParamsRef.current);
      const data = await fetchJobs(searchParamsRef.current);
      setJobs(data.jobs || []);
      setTotalPage(data.totalPage || 1);
      setTotalJob(data.totalJob || 0);

      // Group jobs by company
      const grouped = {};
      data.jobs.forEach((job) => {
        if (!grouped[job.companyName]) {
          grouped[job.companyName] = {
            companyName: job.companyName,
            avatar: job.avatar,
            jobs: [],
          };
        }
        grouped[job.companyName].jobs.push(job);
      });
      setGroupedJobs(grouped);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  // Cập nhật handleInputChange để sử dụng displayTitle thay vì searchParams.Title
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "Title") {
      // Cập nhật displayTitle khi người dùng nhập vào ô tìm kiếm
      setDisplayTitle(value);
    } else {
      // Các trường khác vẫn cập nhật searchParams bình thường
      setSearchParams({ ...searchParams, [name]: value });
    }
  };

  const handleOrderChange = (value) => {
    setSearchParams((prev) => ({
      ...prev,
      MostRecent: value,
      PageIndex: 1,
    }));
  };

  const handlePageSizeChange = (value) => {
    const newSize = parseInt(value);
    setSearchParams((prev) => ({
      ...prev,
      PageSize: newSize,
      PageIndex: 1,
    }));
  };

  const handleClearFilters = () => {
    setSearchParams({
      PageIndex: 1,
      PageSize: 5,
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
    setDisplayTitle(""); // Đảm bảo xóa cả displayTitle
    setRelatedKeywords([]);
    setOriginalKeyword("");
  };

  useEffect(() => {
    getJobs();
  }, [
    searchParams.PageSize,
    searchParams.PageIndex,
    searchParams.MostRecent,
    searchParams.Category,
    searchParams.Location,
    searchParams.JobPosition,
    searchParams.WorkTypes,
    searchParams.Tags,
    searchParams.MinSalary,
    searchParams.MaxSalary,
  ]);

  // Format salary display
  const formatSalary = (salary) => {
    if (!salary) return "Negotiable";
    return salary;
  };

  // Calculate time passed since job posting
  const getTimeAgo = (dateString) => {
    const postDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - postDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Cập nhật RelatedKeywordsSection để thêm chức năng click vào từ khóa
  const RelatedKeywordsSection = () => {
    if (relatedKeywords.length === 0) return null;

    // Số lượng từ khóa hiển thị khi thu gọn
    const initialDisplayCount = 15;

    // Danh sách từ khóa hiển thị dựa vào trạng thái mở rộng
    const displayedKeywords = expandKeywords
      ? relatedKeywords
      : relatedKeywords.slice(0, initialDisplayCount);

    // Kiểm tra có nút "Show more" hay không
    const hasMoreKeywords = relatedKeywords.length > initialDisplayCount;

    // Hàm xử lý khi người dùng click vào từ khóa
    const handleKeywordClick = (keyword) => {
      // Lưu từ khóa vào localStorage với khóa duy nhất
      const stateKey = `search_title_${Date.now()}`;
      localStorage.setItem(stateKey, keyword);

      // Tạo URL với tham số
      const queryParams = new URLSearchParams();
      queryParams.append("title", keyword);
      queryParams.append("from", "related"); // Đánh dấu đến từ từ khóa liên quan
      queryParams.append("stateKey", stateKey);

      // Mở tab mới với URL tạo ra
      window.open(
        `${window.location.pathname}?${queryParams.toString()}`,
        "_blank"
      );
    };

    return (
      <section className="bg-gray-50 py-3 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 mr-1 text-gray-600" />
              <span className="text-sm font-medium">
                Related to &quot;{originalKeyword}&quot;:
              </span>
              {hasMoreKeywords && (
                <button
                  onClick={() => setExpandKeywords(!expandKeywords)}
                  className="ml-auto text-blue-600 text-sm hover:text-blue-800 transition-colors focus:outline-none"
                >
                  {expandKeywords
                    ? "Show less"
                    : `Show all (${relatedKeywords.length})`}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {displayedKeywords.map((keyword, index) => (
                <div
                  key={index}
                  className="text-sm bg-white text-blue-700 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => handleKeywordClick(keyword)}
                  title="Search with this keyword in a new tab"
                >
                  {keyword}
                </div>
              ))}

              {!expandKeywords && hasMoreKeywords && (
                <div
                  className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => setExpandKeywords(true)}
                >
                  +{relatedKeywords.length - initialDisplayCount} more
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <>
      {/*Page Title - sửa padding-bottom thành 0*/}
      <section className="bg-white py-12 pb-0" style={{ marginTop: "111px" }}>
        <div className="container mx-auto px-4">
          {/* Job Search Form */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Discover <span className="text-blue-600">{totalJob}</span> Job
              Opportunities
            </h1>
            <p className="text-gray-600">
              Find your next career move, freelance project, or internship
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6 bg-blue-100 rounded-md">
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5 relative gap-2">
                    <Input
                      type="text"
                      name="Title"
                      placeholder="Job title, keywords or company"
                      value={displayTitle} // Sử dụng displayTitle thay vì searchParams.Title
                      onChange={handleInputChange}
                      className="pl-14"
                    />
                    <BriefcaseBusiness className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>

                  <div className="md:col-span-5 relative">
                    <Input
                      type="text"
                      name="Location"
                      placeholder="City or location"
                      value={searchParams.Location}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                    <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>

                  <div className="md:col-span-2">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isExpanding}
                    >
                      {isExpanding ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Searching...</span>
                        </>
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Hiển thị từ khóa liên quan */}
      <RelatedKeywordsSection />

      {/* Filters Section */}
      <section className="bg-gray-50 py-4 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]">
              <SalaryRangeDropdown setSearchParams={setSearchParams} />
            </div>
            <div className="flex-1 min-w-[220px]">
              <JobPositionDropdown
                searchParams={searchParams}
                setSearchParams={setSearchParams}
              />
            </div>
            <div className="flex-1 min-w-[220px]">
              <CategoryDropdown setSearchParams={setSearchParams} />
            </div>
            <div className="flex-1 min-w-[220px]">
              <TagDropdown
                setSearchParams={setSearchParams}
                searchParams={searchParams}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Filters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WorkTypeFilter
                      searchParams={searchParams}
                      setSearchParams={setSearchParams}
                    />
                  </CardContent>
                </Card>

                <div className="mt-6">
                  <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Need Help?</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Our support team is here to assist you in finding the
                        perfect job.
                      </p>
                      <Button variant="outline" className="w-full">
                        Contact Support
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-3">
              {/* Results header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <strong>
                    {jobs.length > 0
                      ? (searchParams.PageIndex - 1) * searchParams.PageSize + 1
                      : 0}{" "}
                    -{" "}
                    {Math.min(
                      searchParams.PageIndex * searchParams.PageSize,
                      totalJob
                    )}
                  </strong>{" "}
                  of
                  <strong> {totalJob} </strong>
                  jobs
                </div>
                <div className="flex items-center gap-4">
                  <Select onValueChange={handleOrderChange} defaultValue="true">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Most Recent</SelectItem>
                      <SelectItem value="false">Least Recent</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    onValueChange={handlePageSizeChange}
                    defaultValue={searchParams.PageSize.toString()}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Show" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Show 3</SelectItem>
                      <SelectItem value="5">Show 5</SelectItem>
                      <SelectItem value="7">Show 7</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Company-grouped job listings */}
              {Object.keys(groupedJobs).length > 0 ? (
                <div className="space-y-8">
                  {Object.values(groupedJobs).map((company, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 pb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <img
                              src={
                                company.avatar ||
                                "https://via.placeholder.com/80"
                              }
                              alt={company.companyName}
                              className="w-16 h-16 object-cover rounded-md border border-gray-200"
                            />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold">
                              {company.companyName}
                            </CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Building2 className="h-4 w-4 mr-1" />
                              <span>{company.jobs.length} open positions</span>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <Accordion type="multiple" className="w-full">
                          {company.jobs.map((job) => (
                            <AccordionItem
                              key={job.jobID}
                              value={`job-${job.jobID}`}
                              className={`border border-gray-200 rounded-md mb-4 overflow-hidden transition-colors duration-200 ${
                                hoveredJob === job.jobID
                                  ? "border-blue-500"
                                  : ""
                              }`}
                              onMouseEnter={() => setHoveredJob(job.jobID)}
                              onMouseLeave={() => setHoveredJob(null)}
                            >
                              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline group">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full text-left">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3
                                        className={`font-semibold text-lg group-hover:text-blue-600 transition-colors duration-200 ${
                                          hoveredJob === job.jobID
                                            ? "text-blue-600"
                                            : ""
                                        }`}
                                      >
                                        {job.title}
                                      </h3>
                                      {job.priority && (
                                        <div className="flex items-center bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                          <Sparkle className="h-3 w-3 mr-1" />
                                          TOP
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      <Badge
                                        variant="outline"
                                        className="rounded flex items-center gap-1 text-blue-600 bg-blue-50 border-blue-100"
                                      >
                                        <BriefcaseBusiness className="h-3 w-3" />
                                        {job.workType}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="rounded flex items-center gap-1 text-green-600 bg-green-50 border-green-100"
                                      >
                                        <MapPin className="h-3 w-3" />
                                        {job.location}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="rounded flex items-center gap-1 text-amber-600 bg-amber-50 border-amber-100"
                                      >
                                        {formatSalary(job.salary)}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end mt-3 md:mt-0 relative">
                                    <div
                                      className={`flex items-center text-sm text-gray-500 absolute right-0 transition-all duration-300 min-w-[200px] justify-end ${
                                        hoveredJob === job.jobID
                                          ? "opacity-0 transform -translate-y-2"
                                          : "opacity-100 transform translate-y-0"
                                      }`}
                                    >
                                      <CalendarDays className="h-4 w-4 mr-1" />
                                      <span>
                                        Posted {getTimeAgo(job.createdAt)}
                                      </span>
                                    </div>

                                    <div
                                      className={`transition-all duration-300 ${
                                        hoveredJob === job.jobID
                                          ? "opacity-100 transform translate-y-0"
                                          : "opacity-0 invisible"
                                      }`}
                                    >
                                      <Button
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() =>
                                          (window.location.href = `/job-list/${job.jobID}`)
                                        }
                                      >
                                        Apply Now
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>

                              <AccordionContent className="px-4 pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center">
                                      <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="text-sm">
                                        <strong>Education:</strong>{" "}
                                        {job.education}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="text-sm">
                                        <strong>Experience:</strong> {job.exp}+
                                        years
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center">
                                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="text-sm">
                                        <strong>Hiring:</strong>{" "}
                                        {job.numberOfRecruitment} position(s)
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="text-sm">
                                        <strong>Level:</strong>{" "}
                                        {job.level || "Not specified"}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="text-sm">
                                        <strong>Deadline:</strong>{" "}
                                        {new Date(
                                          job.deadline
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                  <Button
                                    variant="outline"
                                    className="text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700 flex items-center gap-2 cursor-default"
                                  >
                                    <Heart className="h-4 w-4  text-blue-500" />
                                    <span className="hidden sm:inline text-blue-500">
                                      Save
                                    </span>
                                  </Button>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                      <CardFooter className="bg-gray-50 flex justify-end align-items-center py-2">
                        <Button
                          variant="outline"
                          className="text-sm"
                          onClick={() =>
                            (window.location.href = `/company-list/${company.companyName}`)
                          }
                        >
                          View Company Profile
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="py-12">
                  <CardContent className="flex flex-col items-center justify-center">
                    <div className="text-gray-400 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="8" y1="15" x2="16" y2="15"></line>
                        <line x1="9" y1="9" x2="9.01" y2="9"></line>
                        <line x1="15" y1="9" x2="15.01" y2="9"></line>
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                      No Jobs Found
                    </h3>
                    <p className="text-gray-500 mb-6 text-center max-w-md">
                      We couldn&apos;t find any jobs matching your search
                      criteria. Try adjusting your filters or search terms.
                    </p>
                    <Button onClick={handleClearFilters}>Clear Filters</Button>
                  </CardContent>
                </Card>
              )}

              {/* Pagination */}
              <div className="mt-8">
                <EnhancedPagination
                  currentPage={searchParams.PageIndex}
                  totalPage={totalPage}
                  setSearchParams={setSearchParams}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
