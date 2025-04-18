/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusSquare,
  Upload,
  FileText,
  Star,
  ExternalLink,
  Trash2,
  FileCheck,
  Briefcase,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createCV,
  getCVsByUserId,
  setFeatureCV,
  uploadCV,
  // deleteCV,
  hideCV,
} from "@/services/cvServices";
import { uploadFile } from "@/services/employerServices";
import { ResumePreview } from "@/components/ResumePreview";
import { mapToResumeValues } from "@/lib/utils";
import { NavLink, useNavigate } from "react-router-dom";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { fetchFreePlanSettings } from "@/services/adminServices";
import { hasActiveSubscription } from "@/services/subscriptionServices";
import { downloadCVAsHTML, downloadCVFromURL } from "@/helpers/downloadHelpers";

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center space-x-1">
        {[...Array(totalPages)].map((_, index) => (
          <Button
            key={index}
            variant={currentPage === index + 1 ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(index + 1)}
            className="w-8 h-8 p-0"
          >
            {index + 1}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const Index = () => {
  const [resumes, setResumes] = useState([]);
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [featuredCVs, setFeaturedCVs] = useState({});
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Search and pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || undefined;

  const fetchCVs = async () => {
    try {
      const data = await getCVsByUserId(userID);

      if (data) {
        const systemCVs = data.filter((cv) => !cv.filePath);
        const uploadedCVs = data.filter((cv) => cv.filePath);

        setResumes(systemCVs);
        setUploadedResumes(uploadedCVs);
        setTotalCount(data.length);

        const featuredStatus = data.reduce((acc, resume) => {
          acc[resume.cvid] = resume.isFeatured || false;
          return acc;
        }, {});
        setFeaturedCVs(featuredStatus);
      }

      console.log("CVs fetched:", data);
    } catch (error) {
      console.error("Error fetching CVs:", error);
      toast.error("Failed to load CVs. Please try again.");
    }
  };

  useEffect(() => {
    if (userID) {
      fetchCVs();
    }
  }, [userID]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleCreateCV = async () => {
    try {
      const userActiveSubscription = await hasActiveSubscription();
      console.log(userActiveSubscription);
      if (userActiveSubscription.hasActiveSubscription === true) {
        if (resumes.length >= userActiveSubscription.package.cvLimit) {
          toast.warning(
            <div>
              You have reached your limit of{" "}
              {userActiveSubscription.package.cvLimit} CVs.
              <br />
              <a
                href="/candidate/package-list"
                className="font-bold text-blue-600 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/package-list");
                }}
              >
                Upgrade your subscription
              </a>{" "}
              to create more CVs and access premium features.
            </div>,
            { autoClose: 8000 } // Give users more time to click the link
          );
          return;
        }
      } else {
        const freePlanSettings = await fetchFreePlanSettings();
        if (resumes.length >= freePlanSettings.candidateFreePlan.maxCVsPerDay) {
          toast.warning(
            <div>
              You have reached your free plan limit of{" "}
              {freePlanSettings.candidateFreePlan.maxCVsPerDay} CVs.
              <br />
              <a
                href="/package-list"
                className="font-bold text-blue-600 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/package-list");
                }}
              >
                Upgrade to a premium plan
              </a>{" "}
              to create unlimited CVs and unlock advanced features!
            </div>,
            {
              autoClose: 8000,
              className: "toast-with-link", // Add a custom class for styling
            }
          );
          return;
        }
      }

      const newCV = await createCV({ userID });
      setResumes((prevResumes) => [newCV, ...prevResumes]);
      setTotalCount((prevCount) => prevCount + 1);

      toast.success("New CV template created successfully");
      // Assuming you want to navigate to edit page
      navigate(`/candidate/my-cv/edit?cvId=${newCV.cvid}`);
    } catch (error) {
      console.error("Error creating CV:", error);
      toast.error("Failed to create new CV. Please try again.");
    }
  };

  const handleDeleteCV = async (deletedCVId, isUploadedCV = false) => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);

      // await deleteCV(deletedCVId);
      await hideCV(deletedCVId);

      if (isUploadedCV) {
        setUploadedResumes((prevResumes) =>
          prevResumes.filter((resume) => resume.cvid !== deletedCVId)
        );
      } else {
        setResumes((prevResumes) =>
          prevResumes.filter((resume) => resume.cvid !== deletedCVId)
        );
      }

      setTotalCount((prevCount) => prevCount - 1);
      toast.success("CV deleted successfully");
    } catch (error) {
      console.error("Error deleting CV:", error);
      toast.error("Failed to delete CV. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCVFileChange = async (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setFileError("Only PDF files are allowed!");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError("File size must be less than 5MB!");
      return;
    }

    setFileError("");
    setFileName(selectedFile.name);

    setIsLoading(true);

    try {
      const uploadResponse = await uploadFile(selectedFile);
      const fileUrl = uploadResponse.fileUrl;

      // Upload CV và lấy response
      await uploadCV({
        cvid: 0,
        userID,
        fileName: selectedFile.name,
        filePath: fileUrl,
      });

      await fetchCVs();
      toast.success("CV uploaded and processed successfully!");

      setFileName("");
    } catch (error) {
      console.error("Error processing CV:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error processing CV, please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetAsFeatured = async (cvId) => {
    try {
      await setFeatureCV(cvId, userID);

      // Cập nhật featured status trong state
      setFeaturedCVs((prevState) => {
        const updatedFeaturedCVs = {};

        // Đặt tất cả CV là không featured
        Object.keys(prevState).forEach((key) => {
          updatedFeaturedCVs[key] = false;
        });

        // Đặt CV được chọn là featured
        updatedFeaturedCVs[cvId.toString()] = true;

        return updatedFeaturedCVs;
      });

      // Cập nhật cả system CVs và uploaded CVs
      setResumes((prevResumes) =>
        prevResumes.map((resume) => ({
          ...resume,
          isFeatured: resume.cvid === cvId,
        }))
      );

      setUploadedResumes((prevResumes) =>
        prevResumes.map((resume) => ({
          ...resume,
          isFeatured: resume.cvid === cvId,
        }))
      );

      toast.success("CV featured status updated successfully");
    } catch (error) {
      console.error("Error setting featured CV:", error);
      toast.error("Failed to update CV featured status.");
    }
  };

  const handleRemoveFile = () => {
    setFileName("");
    setFileError("");
  };

  // Filter and pagination functions
  const filterCVs = (cvs) => {
    if (!searchQuery) return cvs;

    return cvs.filter((cv) => {
      const title = cv.title || cv.fileName || "";
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const paginateItems = (items) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Get all CVs (both system and uploaded)
  const allCVs = [...resumes, ...uploadedResumes];

  // Filter CVs based on search query
  const filteredAllCVs = filterCVs(allCVs);
  const filteredSystemCVs = filterCVs(resumes);
  const filteredUploadedCVs = filterCVs(uploadedResumes);

  // Apply pagination
  const paginatedAllCVs = paginateItems(filteredAllCVs);
  const paginatedSystemCVs = paginateItems(filteredSystemCVs);
  const paginatedUploadedCVs = paginateItems(filteredUploadedCVs);

  // Calculate total pages for each tab
  const totalAllPages = Math.ceil(filteredAllCVs.length / itemsPerPage);
  const totalSystemPages = Math.ceil(filteredSystemCVs.length / itemsPerPage);
  const totalUploadedPages = Math.ceil(
    filteredUploadedCVs.length / itemsPerPage
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 bg-gray-50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="size-6 text-blue-600" />
            CV Management Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage, create and upload candidate CVs for your hiring process
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleCreateCV}
            variant="default"
            className="flex items-center gap-2"
          >
            <PlusSquare className="size-4" />
            Create New CV
          </Button>
          <div className="uploadButton">
            <input
              className="uploadButton-input"
              type="file"
              accept=".pdf"
              id="uploadCV"
              onChange={handleCVFileChange}
              disabled={isLoading}
            />
            <Button
              variant="outline"
              className="flex items-center gap-2"
              asChild
              style={{ cursor: "pointer" }}
            >
              <label htmlFor="uploadCV">
                <Upload className="size-4" />
                Upload CV
              </label>
            </Button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total CVs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalCount}</div>
            <p className="text-sm text-gray-500 mt-1">Your CVs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">System CVs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {resumes.length}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Created with our system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Uploaded CVs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {uploadedResumes.length}
            </div>
            <p className="text-sm text-gray-500 mt-1">PDF files uploaded</p>
          </CardContent>
        </Card>
      </div>

      {/* File upload progress */}
      {(fileName || isLoading || fileError) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              CV Upload Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fileName && (
              <div className="flex items-center gap-2 mb-2">
                <FileText className="size-4 text-blue-600" />
                <span className="text-sm font-medium">{fileName}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              </div>
            )}

            {fileError && (
              <div className="text-red-500 text-sm mt-2">{fileError}</div>
            )}

            {isLoading && (
              <div className="text-sm flex items-center gap-2 mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                Processing your CV...
              </div>
            )}

            <div className="text-xs text-gray-500 mt-2">
              Max file size is 5MB. Suitable files are .pdf
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <Input
          type="text"
          placeholder="Search by CV title..."
          className="pl-10 pr-4 py-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* CV Tabs */}
      <Tabs
        defaultValue="all"
        className="w-full"
        onValueChange={() => {
          setCurrentPage(1); // Reset to first page when changing tabs
        }}
      >
        <TabsList className="grid grid-cols-3 mb-6 bg-gray-200">
          <TabsTrigger value="all">
            All CVs ({filteredAllCVs.length})
          </TabsTrigger>
          <TabsTrigger value="system">
            System CVs ({filteredSystemCVs.length})
          </TabsTrigger>
          <TabsTrigger value="uploaded">
            Uploaded CVs ({filteredUploadedCVs.length})
          </TabsTrigger>
        </TabsList>

        {/* All CVs Tab */}
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedAllCVs.length > 0 ? (
              paginatedAllCVs.map((resume) => (
                <CVCard
                  key={`all-${resume.cvid}`}
                  resume={resume}
                  isFeatured={featuredCVs[resume.cvid]}
                  onSetAsFeatured={handleSetAsFeatured}
                  onDelete={() =>
                    handleDeleteCV(resume.cvid, !!resume.filePath)
                  }
                  isDeleting={isDeleting}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                {searchQuery ? (
                  <p className="mb-2">
                    No CVs found matching your search criteria.
                  </p>
                ) : (
                  <>
                    <p className="mb-2">No CVs available yet</p>
                    <div className="flex justify-center gap-3 mt-4">
                      <Button
                        onClick={handleCreateCV}
                        size="sm"
                        variant="default"
                      >
                        Create New CV
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <label htmlFor="uploadCV-empty">
                          <Upload className="size-4 mr-2" />
                          Upload CV
                          <input
                            id="uploadCV-empty"
                            type="file"
                            accept=".pdf"
                            onChange={handleCVFileChange}
                            disabled={isLoading}
                            className="sr-only"
                          />
                        </label>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Pagination for All tab */}
          {filteredAllCVs.length > 0 && totalAllPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalAllPages}
              onPageChange={handlePageChange}
            />
          )}
        </TabsContent>

        {/* System CVs Tab */}
        <TabsContent value="system">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                My System CVs
              </CardTitle>
              <CardDescription className="text-gray-500">
                CVs created directly in our system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedSystemCVs.length > 0 ? (
                  paginatedSystemCVs.map((resume) => (
                    <SystemCVCard
                      key={resume?.cvid}
                      resume={resume}
                      isFeatured={featuredCVs[resume.cvid]}
                      onSetAsFeatured={handleSetAsFeatured}
                      onDelete={() => handleDeleteCV(resume.cvid)}
                      isDeleting={isDeleting}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-6 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                    {searchQuery ? (
                      <p className="mb-2">
                        No system CVs found matching your search criteria.
                      </p>
                    ) : (
                      <p className="mb-2">
                        No system CVs created yet. Click &quot;New CV&quot; to
                        create one.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination for System tab */}
              {filteredSystemCVs.length > 0 && totalSystemPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalSystemPages}
                  onPageChange={handlePageChange}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Uploaded CVs Tab */}
        <TabsContent value="uploaded">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">Uploaded CVs</CardTitle>
              <CardDescription className="text-gray-500">
                CVs uploaded to our system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedUploadedCVs.length > 0 ? (
                  paginatedUploadedCVs.map((resume) => (
                    <CVCard
                      key={`uploaded-${resume.cvid}`}
                      resume={resume}
                      isFeatured={featuredCVs[resume.cvid]}
                      onSetAsFeatured={handleSetAsFeatured}
                      onDelete={() => handleDeleteCV(resume.cvid, true)}
                      isDeleting={isDeleting}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                    {searchQuery ? (
                      <p className="mb-2">
                        No uploaded CVs found matching your search criteria.
                      </p>
                    ) : (
                      <>
                        <p className="mb-2">No uploaded CVs yet</p>
                        <Button variant="outline" size="sm" asChild>
                          <label htmlFor="uploadCV-empty2">
                            <Upload className="size-4 mr-2" />
                            Upload CV
                            <input
                              id="uploadCV-empty2"
                              type="file"
                              accept=".pdf"
                              onChange={handleCVFileChange}
                              disabled={isLoading}
                              className="sr-only"
                            />
                          </label>
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination for Uploaded tab */}
              {filteredUploadedCVs.length > 0 && totalUploadedPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalUploadedPages}
                  onPageChange={handlePageChange}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

// System CV Card Component with fixed height
const SystemCVCard = ({
  resume,
  isFeatured,
  onSetAsFeatured,
  onDelete,
  isDeleting,
}) => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // Thêm ref cho nội dung CV
  const cvContentRef = useRef(null);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsDeleteDialogOpen(false);
  };

  // Thêm hàm download CV
  const handleDownloadCV = () => {
    downloadCVAsHTML(
      cvContentRef,
      resume.title || `System-CV-${resume.cvid}.pdf`
    );
  };

  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="min-h-[10px] flex items-center">
          {isFeatured ? (
            <div className="bg-amber-100 py-1 px-2 w-full text-xs font-medium text-amber-800 flex items-center justify-center">
              <Star className="size-3 mr-1 fill-amber-500" /> Featured CV
            </div>
          ) : (
            <div className="h-[32px]"></div> // Spacer to maintain consistent height
          )}
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium truncate">
            {resume.title || `System CV ${resume.cvid}`}
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-4 flex-1">
          <NavLink
            to={`/candidate/my-cv/edit?cvId=${resume?.cvid}`}
            className="relative inline-block w-full"
          >
            <div className="h-48 overflow-hidden bg-gray-100 rounded mb-4 relative">
              <ResumePreview
                resumeData={mapToResumeValues(resume)}
                contentRef={cvContentRef}
                className="overflow-hidden shadow-sm transition-shadow group-hover:shadow-lg"
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
            </div>
          </NavLink>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 mt-auto">
          {/* Nhóm các hành động chính */}
          <div className="flex w-full gap-2">
            <Button
              variant="default" // Đổi thành variant default cho hành động chính
              size="sm"
              className="flex-1"
              onClick={() =>
                navigate(`/candidate/my-cv/edit?cvId=${resume.cvid}`)
              }
            >
              <FileCheck className="size-4 mr-1" /> Edit
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleDownloadCV}
            >
              <Download className="size-4 mr-1" /> Download
            </Button>
          </div>

          {/* Nhóm các hành động thứ cấp và nguy hiểm */}
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetAsFeatured(resume.cvid)}
              className={`flex-1 ${isFeatured ? "bg-amber-50 border-amber-200 text-amber-700" : ""
                }`}
            >
              <Star
                className={`size-4 mr-1 ${isFeatured ? "fill-amber-500" : ""}`}
              />
              {isFeatured ? "Featured" : "Feature"}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              className="flex-1"
            >
              <Trash2 className="size-4 mr-1" /> Delete
            </Button>
          </div>
        </CardFooter>
      </Card>
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
        cvName={resume.title || `System CV ${resume.cvid}`}
      />
    </>
  );
};

// CV Card Component for uploaded CVs with consistent structure
const CVCard = ({
  resume,
  isFeatured,
  onSetAsFeatured,
  onDelete,
  isDeleting,
}) => {
  const isUploaded = !!resume.filePath;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsDeleteDialogOpen(false);
  };

  // If it's a system CV in the All tab, use SystemCVCard
  if (!isUploaded) {
    return (
      <SystemCVCard
        resume={resume}
        isFeatured={isFeatured}
        onSetAsFeatured={onSetAsFeatured}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    );
  }

  // For uploaded CVs
  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="min-h-[10px] flex items-center">
          {isFeatured ? (
            <div className="bg-amber-100 py-1 px-2 w-full text-xs font-medium text-amber-800 flex items-center justify-center">
              <Star className="size-3 mr-1 fill-amber-500" /> Featured CV
            </div>
          ) : (
            <div className="h-[32px]"></div> // Spacer to maintain consistent height
          )}
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium truncate">
            {resume.fileName || "Uploaded CV"}
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-4 flex-1">
          <div className="h-48 overflow-hidden bg-gray-100 rounded mb-4">
            <iframe
              src={resume.filePath}
              title={`CV Preview ${resume.fileName}`}
              width="100%"
              height="100%"
              frameBorder="0"
              className="cv-preview-frame"
            ></iframe>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 mt-auto">
          {/* Nhóm các hành động chính */}
          <div className="flex w-full gap-2">
            <Button
              variant="default" // Đổi thành variant default cho hành động chính
              size="sm"
              className="flex-1 hover:text-white"
              asChild
            >
              <a
                href={resume.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <ExternalLink className="size-4 mr-1" /> View
              </a>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() =>
                downloadCVFromURL(
                  resume.filePath,
                  resume.fileName || "downloaded-cv.pdf"
                )
              }
            >
              <Download className="size-4 mr-1" /> Download
            </Button>
          </div>

          {/* Nhóm các hành động thứ cấp và nguy hiểm */}
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetAsFeatured(resume.cvid)}
              className={`flex-1 ${isFeatured ? "bg-amber-50 border-amber-200 text-amber-700" : ""
                }`}
            >
              <Star
                className={`size-4 mr-1 ${isFeatured ? "fill-amber-500" : ""}`}
              />
              {isFeatured ? "Featured" : "Feature"}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              className="flex-1"
            >
              <Trash2 className="size-4 mr-1" /> Delete
            </Button>
          </div>
        </CardFooter>
      </Card>
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
        cvName={resume.fileName || "Uploaded CV"}
      />
    </>
  );
};

export default Index;
