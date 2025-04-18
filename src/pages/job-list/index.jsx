import { useState, useEffect, useRef } from "react";
import { fetchJobs } from "../../services/jobServices";
import { 
  getFavoriteJobsByUserId, 
  toggleFavoriteJob 
} from "../../services/favoriteJobService";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export const Index = () => {
  const [jobs, setJobs] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [totalJob, setTotalJob] = useState(1);
  const [groupedJobs, setGroupedJobs] = useState({});
  const [hoveredJob, setHoveredJob] = useState(null);
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const { toast } = useToast();
  
  // Add missing state variables
  const [displayTitle, setDisplayTitle] = useState("");
  const [relatedKeywords, setRelatedKeywords] = useState([]);
  const [originalKeyword, setOriginalKeyword] = useState("");
  const [expandKeywords, setExpandKeywords] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  
  // Create ref for searchParams
  const searchParamsRef = useRef(null);

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
  
  // Update searchParamsRef whenever searchParams changes
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // Add missing handleSearch function
  const handleSearch = (e) => {
    e.preventDefault();
    setIsExpanding(true);
    
    setSearchParams(prev => ({
      ...prev,
      Title: displayTitle,
      PageIndex: 1,
    }));
    
    // Store original keyword
    setOriginalKeyword(displayTitle);
    
    // Generate related keywords (simplified example)
    // In a real app, you might fetch this from an API
    if (displayTitle.trim() !== "") {
      const keywords = generateRelatedKeywords(displayTitle);
      setRelatedKeywords(keywords);
    } else {
      setRelatedKeywords([]);
    }
    
    setTimeout(() => {
      setIsExpanding(false);
    }, 500);
  };
  
  // Helper function to generate related keywords (simplified)
  const generateRelatedKeywords = (keyword) => {
    // This is a simplified example. In a real app, you would fetch these from an API
    const baseKeywords = [
      "full time", "remote", "hybrid", "entry level", "senior", 
      "manager", "director", "software", "development", "engineering",
      "marketing", "sales", "customer service", "finance", "accounting",
      "human resources", "design", "product manager", "data analyst"
    ];
    
    // Filter and combine with the original keyword
    return baseKeywords
      .filter(k => k !== keyword.toLowerCase())
      .map(k => {
        if (keyword.toLowerCase().includes(k) || k.includes(keyword.toLowerCase())) {
          return k;
        }
        return `${keyword} ${k}`;
      })
      .slice(0, 20); // Limit to 20 keywords
  };

  // Get user ID from auth context or localStorage
  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('userLoginData') || '{}');
      console.log("User data:", user);
      return user.userID || null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  };

  const userId = getUserId();
  console.log("Current user ID:", userId);

  // Fetch user's favorite jobs
  const fetchFavoriteJobs = async () => {
    if (!userId) {
      console.log("No user ID, skipping favorites fetch");
      return;
    }
    
    try {
      console.log("Fetching favorite jobs for user:", userId);
      setIsLoadingFavorites(true);
      const favorites = await getFavoriteJobsByUserId(userId);
      console.log("Fetched favorites:", favorites);
      setFavoriteJobs(favorites || []);
    } catch (error) {
      console.error("Error fetching favorite jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load your saved jobs",
        variant: "destructive",
      });
      setFavoriteJobs([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  // Check if a job is in favorites
  const isJobFavorite = (jobId) => {
    if (!favoriteJobs || !Array.isArray(favoriteJobs) || favoriteJobs.length === 0) {
      return false;
    }
    return favoriteJobs.some(fav => fav && Number(fav.jobID) === Number(jobId));
  };

  // Handle when user clicks the save button
  const handleSaveClick = (e, job) => {
    e.preventDefault(); // Prevent accordion from opening/closing
    e.stopPropagation(); // Stop event propagation
    
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save jobs to favorites.",
        variant: "destructive",
      });
      return;
    }

    // If job is already favorite, remove it without confirmation
    if (isJobFavorite(job.jobID)) {
      console.log("Removing job from favorites directly:", job.jobID);
      handleToggleFavorite(job.jobID, false);
    } else {
      // If not favorite, show confirmation dialog
      console.log("Setting selected job for confirmation:", job.jobID);
      setSelectedJob(job);
      setConfirmDialogOpen(true);
    }
  };

  // Handle favorite toggle after confirmation
  const handleToggleFavorite = async (jobId, needConfirmation = true) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save jobs to favorites.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log(`Toggling favorite for user: ${userId}, job: ${jobId}`);
      setIsLoadingFavorites(true);
      
      // Optimistic UI update
      const currentlyFavorite = isJobFavorite(jobId);
      if (currentlyFavorite) {
        // Temporarily remove from UI
        setFavoriteJobs(prev => prev.filter(job => Number(job.jobID) !== Number(jobId)));
      } else {
        // Temporarily add to UI
        setFavoriteJobs(prev => [...prev, { jobID: jobId }]);
      }
      
      // Make the API call
      const result = await toggleFavoriteJob(userId, jobId);
      console.log("Toggle result:", result);
      
      if (result) {
        toast({
          title: "Success",
          description: result.message || (result.isFavorite ? "Job added to favorites" : "Job removed from favorites"),
          variant: "default",
        });
      }
      
      // Refresh favorite jobs to ensure UI is synced with server
      fetchFavoriteJobs();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
      // Refresh to ensure UI is in sync with server state
      fetchFavoriteJobs();
    } finally {
      setIsLoadingFavorites(false);
      
      if (needConfirmation) {
        setConfirmDialogOpen(false);
        setSelectedJob(null);
      }
    }
  };

  const getJobs = async () => {
    try {
      // Use searchParamsRef.current instead of searchParams
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

  // Update handleInputChange to use displayTitle instead of searchParams.Title
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "Title") {
      // Update displayTitle when user types in search box
      setDisplayTitle(value);
    } else {
      // Update other fields normally
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
    setDisplayTitle(""); // Clear displayTitle too
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
  ]);

  // Fetch favorite jobs when component mounts or user changes
  useEffect(() => {
    if (userId) {
      console.log("User ID changed, fetching favorites");
      fetchFavoriteJobs();
    } else {
      console.log("No user ID, clearing favorites");
      setFavoriteJobs([]);
    }
  }, [userId]);

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

  // Updated RelatedKeywordsSection with click functionality
  const RelatedKeywordsSection = () => {
    if (relatedKeywords.length === 0) return null;

    // Number of keywords to show when collapsed
    const initialDisplayCount = 15;

    // Keywords list based on expanded state
    const displayedKeywords = expandKeywords
      ? relatedKeywords
      : relatedKeywords.slice(0, initialDisplayCount);

    // Check if "Show more" button should be displayed
    const hasMoreKeywords = relatedKeywords.length > initialDisplayCount;

    // Handle keyword click
    const handleKeywordClick = (keyword) => {
      // Save keyword in localStorage with unique key
      const stateKey = `search_title_${Date.now()}`;
      localStorage.setItem(stateKey, keyword);

      // Create URL with parameters
      const queryParams = new URLSearchParams();
      queryParams.append("title", keyword);
      queryParams.append("from", "related"); // Mark as coming from related keywords
      queryParams.append("stateKey", stateKey);

      // Open in new tab
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
                      value={displayTitle} // Use displayTitle instead of searchParams.Title
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

      {/* Display related keywords */}
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
                                    className={`border hover:bg-blue-100 flex items-center gap-2 ${
                                      isJobFavorite(job.jobID)
                                        ? "text-blue-600 border-blue-200 bg-blue-50"
                                        : "text-gray-500 border-gray-200 hover:text-blue-600"
                                    }`}
                                    onClick={(e) => handleSaveClick(e, job)}
                                    disabled={isLoadingFavorites}
                                  >
                                    <Heart 
                                      className={`h-4 w-4 ${
                                        isJobFavorite(job.jobID) 
                                          ? "text-blue-500 fill-blue-500" 
                                          : "text-gray-500"
                                      }`} 
                                    />
                                    <span className="hidden sm:inline">
                                      {isJobFavorite(job.jobID) ? "Saved" : "Save"}
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

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Job</DialogTitle>
            <DialogDescription>
              Do you want to save this job to your favorites?
              {selectedJob && (
                <div className="mt-2 font-medium text-gray-900">
                  {selectedJob.title} at {selectedJob.companyName}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setConfirmDialogOpen(false);
                setSelectedJob(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (selectedJob) {
                  handleToggleFavorite(selectedJob.jobID, true);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Index;