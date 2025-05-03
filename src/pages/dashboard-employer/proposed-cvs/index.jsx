import { getUserLoginData } from "@/helpers/decodeJwt";
import { fetchCompanyProfile } from "@/services/employerServices";
import { fetchJobsByUserId } from "@/services/jobServices";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Index = () => {
  const [verificationLevel, setVerificationLevel] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Showing 6 cards per page (2 rows of 3 in desktop view)

  useEffect(() => {
    const isEmployerVerified = async () => {
      try {
        const user = getUserLoginData();

        if (user.role === "Employer") {
          const companyData = await fetchCompanyProfile();

          setVerificationLevel(companyData.verificationLevel);
          console.log("Verification Level:", companyData.verificationLevel);
        }
      } catch (error) {
        console.error("Error loading verification data:", error);
      }
    };

    const loadData = async () => {
      try {
        const user = getUserLoginData();

        if (user.role === "Employer") {
          const companyData = await fetchCompanyProfile();
          setVerificationLevel(companyData.verificationLevel);

          // Fetch all jobs and then filter for status 3
          const user = JSON.parse(localStorage.getItem("userLoginData"));
          const userID = user?.userID || null;
          const jobs = await fetchJobsByUserId(userID);
          console.log("jobs in proposed-cv: ", jobs);
          const filteredJobs = jobs.filter((job) => job.status === 3);
          setActiveJobs(filteredJobs);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    isEmployerVerified();
    loadData();
  }, []);

  useEffect(() => {
    if (verificationLevel !== null && verificationLevel < 3) {
      navigate("/employer/verification");
    }
  }, [verificationLevel, navigate]);

  // Hàm xử lý khi nhấn vào button AI Match
  const handleAIMatchClick = (job) => {
    if (!job.priority) {
      toast.warning(
        "The AI Matching CV feature is only available for jobs marked as Priority. Please upgrade your job to use this feature.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } else {
      // Điều hướng đến trang AI Matching CV
      navigate(`/employer/proposed-cvs/jobs/${job.jobID}/candidates`);
    }
  };

  // Format date from ISO string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activeJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(activeJobs.length / itemsPerPage);

  // Pagination navigation functions
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <section className="user-dashboard p-6">
      <ToastContainer />
      <div className="dashboard-outer">
        <div className="upper-title-box mb-4">
          <h2 className="text-2xl font-bold">Proposed CV Management</h2>
          <p className="text-muted-foreground">
            Manage and view CVs proposed for your jobs
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activeJobs.length === 0 ? (
          <Card className="border border-dashed p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium">No active jobs</h3>
              <p className="text-muted-foreground mt-2">
                You currently don&apos;t have any active jobs to receive
                proposed CVs
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/employer/post-job")}
              >
                Post a new job
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentItems.map((job) => (
                <Card key={job.jobID} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold line-clamp-2">
                          {job.title}
                        </h3>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{job.location}</span>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Deadline: {formatDate(job.deadline)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="bg-muted/30 p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                job.priority ? "bg-green-500" : "bg-red-500"
                              } mr-2`}
                            ></div>
                            <span
                              className={
                                job.priority
                                  ? "font-medium text-green-500"
                                  : "font-medium text-red-500"
                              }
                            >
                              {job.priority ? "Running" : "Stopped"}
                            </span>
                          </div>
                        </div>

                        {/* Button thay đổi cho AI Matching */}
                        <Button
                          variant={job.priority ? "default" : "outline"}
                          size="sm"
                          className={
                            job.priority
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "text-gray-400 border-gray-300 hover:bg-gray-100"
                          }
                          onClick={() => handleAIMatchClick(job)}
                        >
                          {job.priority ? (
                            <>
                              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI
                              Match CVs
                            </>
                          ) : (
                            <>
                              <AlertCircle className="mr-1.5 h-3.5 w-3.5" />{" "}
                              Priority Required
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {activeJobs.length > itemsPerPage && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {[...Array(totalPages).keys()].map((number) => (
                    <Button
                      key={number + 1}
                      variant={
                        currentPage === number + 1 ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => paginate(number + 1)}
                    >
                      {number + 1}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
