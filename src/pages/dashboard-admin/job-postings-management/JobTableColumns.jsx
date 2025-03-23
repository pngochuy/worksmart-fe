/* eslint-disable react/prop-types */
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobStatusBadge } from "./JobStatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import LoadingButton from "@/components/LoadingButton";
import { toast } from "react-toastify";
// Import real API functions
import { approveJob, rejectJob, getJobDetails } from "../../../services/adminServices";
import { hideJob, unhideJob } from "@/services/jobServices";

// Enum for job statuses
export const JOB_STATUS = {
  PENDING: 0,
  REJECTED: 1,
  HIDDEN: 2,
  ACTIVE: 3,
};

// Remove mock function definitions since we're importing the real ones

const filterByMultipleValues = (row, id, filterValues) => {
  if (!filterValues || !filterValues.length) return true;

  // Get the numeric status value from the row
  const rowValue = row.getValue(id);

  // Check if the status value is in the filtered values array
  return filterValues.includes(rowValue);
};

// Hàm filter cho createdAt (khoảng thời gian)
const filterByDateRange = (row, id, filterValues) => {
  if (!filterValues || !filterValues.length) return true;

  const rowDate = new Date(row.getValue(id));
  const [start, end] = filterValues;

  // Đảm bảo start và end đều tồn tại
  if (!start || !end) return true;

  // So sánh ngày (không quan tâm đến giờ)
  const startTime = new Date(start).setHours(0, 0, 0, 0);
  const endTime = new Date(end).setHours(23, 59, 59, 999);
  const rowTime = new Date(rowDate).getTime();

  return rowTime >= startTime && rowTime <= endTime;
};

// Component riêng cho ActionCell
const ActionCell = ({ row, onStatusChange }) => {
  const job = row.original;
  const jobStatus = job.status;

  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [showApproveConfirmation, setShowApproveConfirmation] = useState(false);
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
  const [showHideConfirmation, setShowHideConfirmation] = useState(false);
  const [showUnhideConfirmation, setShowUnhideConfirmation] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Các lý do từ chối job
  const rejectReasons = [
    { value: "inappropriate_content", label: "Inappropriate content" },
    { value: "incomplete_information", label: "Incomplete information" },
    { value: "misleading_information", label: "Misleading information" },
    { value: "violates_terms", label: "Violates terms of service" },
    { value: "spam", label: "Spam or fraudulent job" },
    { value: "duplicate", label: "Duplicate job posting" },
    { value: "company_not_verified", label: "Company not verified" },
    { value: "other", label: "Other reason" },
  ];

  // Danh sách các action sẽ hiển thị, phụ thuộc vào status hiện tại
  const getActions = () => {
    switch (jobStatus) {
      case JOB_STATUS.PENDING:
        return [
          {
            label: "Approve",
            icon: <Check className="size-4 mr-2" />,
            onClick: () => setShowApproveConfirmation(true),
          },
          {
            label: "Reject",
            icon: <X className="size-4 mr-2" />,
            onClick: () => setShowRejectConfirmation(true),
          },
        ];
      case JOB_STATUS.REJECTED:
        return [
          {
            label: "Approve",
            icon: <Check className="size-4 mr-2" />,
            onClick: () => setShowApproveConfirmation(true),
          },
        ];
      case JOB_STATUS.HIDDEN:
        return [
          {
            label: "Unhide",
            icon: <Eye className="size-4 mr-2" />,
            onClick: () => setShowUnhideConfirmation(true),
          },
        ];
      case JOB_STATUS.ACTIVE:
        return [
          {
            label: "Hide",
            icon: <EyeOff className="size-4 mr-2" />,
            onClick: () => setShowHideConfirmation(true),
          },
        ];
      default:
        return [];
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {/* <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(job.jobID)}
          >
            Copy Job ID
          </DropdownMenuItem>
          <DropdownMenuSeparator /> */}
          <DropdownMenuItem onClick={() => setShowJobDetails(true)}>
            <Eye className="size-4 mr-2" />
            View Job Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowCompanyDetails(true)}>
            <Eye className="size-4 mr-2" />
            View Company
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Render các action dựa vào status */}
          {getActions().map((action, index) => (
            <DropdownMenuItem key={index} onClick={action.onClick}>
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Job Details Dialog */}
      <JobDetailsDialog
        job={job}
        open={showJobDetails}
        onOpenChange={setShowJobDetails}
      />

      {/* Company Details Dialog */}
      <CompanyDetailsDialog
        job={job}
        open={showCompanyDetails}
        onOpenChange={setShowCompanyDetails}
      />

      {/* Approve Confirmation Dialog */}
      <ApproveConfirmationDialog
        job={job}
        open={showApproveConfirmation}
        onOpenChange={setShowApproveConfirmation}
        onStatusChange={onStatusChange}
      />

      {/* Reject Confirmation Dialog */}
      <RejectConfirmationDialog
        job={job}
        open={showRejectConfirmation}
        onOpenChange={setShowRejectConfirmation}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        rejectReasons={rejectReasons}
        onStatusChange={onStatusChange}
      />

      {/* Hide Confirmation Dialog */}
      <HideConfirmationDialog
        job={job}
        open={showHideConfirmation}
        onOpenChange={setShowHideConfirmation}
        onStatusChange={onStatusChange}
      />

      {/* Unhide Confirmation Dialog */}
      <UnhideConfirmationDialog
        job={job}
        open={showUnhideConfirmation}
        onOpenChange={setShowUnhideConfirmation}
        onStatusChange={onStatusChange}
      />
    </>
  );
};


// Job Details Dialog
function JobDetailsDialog({ job, open, onOpenChange }) {
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch job details when dialog opens
  useEffect(() => {
    if (open && job) {
      setLoading(true);
      (async () => {
        try {
          const data = await getJobDetails(job.jobID);
          console.log("Fetched job details:", data);
          setJobDetails(data.job);
        } catch (error) {
          toast.error(error.message || "Could not load job details");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [open, job]);


  // Format salary range for display
  const formatSalary = (salary) => {
    if (typeof salary === 'string') {
      return salary;
    }

    const formatter = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    });

    if (jobDetails?.minSalary && jobDetails?.maxSalary) {
      return `${formatter.format(jobDetails.minSalary)} - ${formatter.format(jobDetails.maxSalary)}`;
    } else if (jobDetails?.minSalary) {
      return `From ${formatter.format(jobDetails.minSalary)}`;
    } else if (jobDetails?.maxSalary) {
      return `Up to ${formatter.format(jobDetails.maxSalary)}`;
    } else {
      return "Negotiable";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      console.log("Dialog onOpenChange called with:", value);
      onOpenChange(value);
    }}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Details</DialogTitle>
          <DialogDescription>
            Complete information about this job posting
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : jobDetails ? (
          <div className="py-4 space-y-6">
            {/* Basic Job Info */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">{jobDetails.title}</h3>
              <p className="text-sm text-gray-500">Job ID: {jobDetails.jobID}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                  {jobDetails.workType || "Not specified"}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                  {jobDetails.location || jobDetails.workLocation || "Not specified"}
                </span>
                {jobDetails.priority && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs">
                    Priority
                  </span>
                )}
              </div>
            </div>

            {/* Job Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b py-4">
              <div>
                <p className="text-sm font-medium mb-1">Company</p>
                <p>{jobDetails.companyName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Salary</p>
                <p>{formatSalary(jobDetails.salary)}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Experience Required</p>
                <p>{jobDetails.exp ?? "Not specified"} {jobDetails.exp === 1 ? "year" : jobDetails.exp > 1 ? "years" : ""}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Education Required</p>
                <p>{jobDetails.education || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Application Deadline</p>
                <p>{formatDate(jobDetails.deadline)}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Posted On</p>
                <p>{formatDate(jobDetails.createdAt)}</p>
              </div>
              {jobDetails.level && (
                <div>
                  <p className="text-sm font-medium mb-1">Level</p>
                  <p>{jobDetails.level}</p>
                </div>
              )}
              {jobDetails.numberOfRecruitment && (
                <div>
                  <p className="text-sm font-medium mb-1">Positions Available</p>
                  <p>{jobDetails.numberOfRecruitment}</p>
                </div>
              )}
              {jobDetails.jobPosition && (
                <div>
                  <p className="text-sm font-medium mb-1">Position</p>
                  <p>{jobDetails.jobPosition}</p>
                </div>
              )}
              {jobDetails.industry && (
                <div>
                  <p className="text-sm font-medium mb-1">Industry</p>
                  <p>{jobDetails.industry}</p>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div>
              <h4 className="text-md font-medium mb-2">Job Description</h4>
              <div className="whitespace-pre-line bg-gray-50 p-4 rounded-md">
                <div dangerouslySetInnerHTML={{ __html: jobDetails.description }} />
              </div>
            </div>

            {/* Company Description */}
            {jobDetails.companyDescription && (
              <div>
                <h4 className="text-md font-medium mb-2">About the Company</h4>
                <div className="whitespace-pre-line bg-gray-50 p-4 rounded-md">
                  <div dangerouslySetInnerHTML={{ __html: jobDetails.companyDescription }} />
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(jobDetails.email || jobDetails.phoneNumber || jobDetails.address || jobDetails.companyWebsite) && (
              <div>
                <h4 className="text-md font-medium mb-2">Contact Information</h4>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  {jobDetails.email && <p><span className="font-medium">Email:</span> {jobDetails.email}</p>}
                  {jobDetails.phoneNumber && <p><span className="font-medium">Phone:</span> {jobDetails.phoneNumber}</p>}
                  {jobDetails.address && <p><span className="font-medium">Address:</span> {jobDetails.address}</p>}
                  {jobDetails.companyWebsite && (
                    <p>
                      <span className="font-medium">Website:</span>
                      <a
                        href={jobDetails.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline ml-1"
                      >
                        {jobDetails.companyWebsite}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tags/Skills */}
            {jobDetails.jobDetailTags && jobDetails.jobDetailTags.length > 0 && (
              <div>
                <h4 className="text-md font-medium mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {jobDetails.jobDetailTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                    >
                      {tag.tagName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Status */}
            {jobDetails.status !== undefined && (
              <div className="mt-4">
                <span className={`px-3 py-1 rounded-full text-sm ${jobDetails.status === 1 ? 'bg-green-100 text-green-800' :
                  jobDetails.status === 2 ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                  {jobDetails.status === 1 ? 'Active' : 'Closed'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center">No job information available</div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => {
            console.log("Close button clicked");
            onOpenChange(false);
          }}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Company Details Dialog
export function CompanyDetailsDialog({ job, open, onOpenChange }) {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch company details when dialog opens
  useEffect(() => {
    if (open && job) {
      console.log("Fetching company details for companyID:", job.jobID);
      setLoading(true);
      getJobDetails(job.jobID)
        .then((data) => {
          console.log("Company details received:", data.job);
          setCompanyDetails(data.job);
        })
        .catch((error) => {
          console.error("Error fetching company details:", error);
          toast.error(error.Message || "Could not load company details");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, job]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Company Details</DialogTitle>
          <DialogDescription>
            Information about the company that posted this job
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : companyDetails ? (
          <div className="py-4 space-y-6">
            {/* Company Basic Info */}
            <div className="flex items-start gap-4">
              {companyDetails.avatar ? (
                <img
                  src={companyDetails.avatar}
                  alt={`${companyDetails.companyName} logo`}
                  className="w-20 h-20 object-contain border rounded-md"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-md">
                  <span className="text-gray-500 text-xs">No logo</span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-primary">{companyDetails.companyName}</h3>
                <p className="text-sm text-gray-600">{companyDetails.industry || "Industry not specified"}</p>
                {companyDetails.verified && (
                  <span className="inline-flex items-center mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b py-4">
              <div>
                <p className="text-sm font-medium mb-1">Email</p>
                <p>{companyDetails.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Phone</p>
                <p>{companyDetails.phoneNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Website</p>
                <p>
                  {companyDetails.companyWebsite ? (
                    <a
                      href={companyDetails.companyWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {companyDetails.companyWebsite}
                    </a>
                  ) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Size</p>
                <p>{companyDetails.companySize || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Address</p>
                <p>{companyDetails.address || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Work Location</p>
                <p>{companyDetails.workLocation || "N/A"}</p>
              </div>
            </div>

            {/* Company Description */}
            <div>
              <h4 className="text-md font-medium mb-2">About</h4>
              <div className="whitespace-pre-line bg-gray-50 p-4 rounded-md">
                <div dangerouslySetInnerHTML={{ __html: companyDetails.companyDescription }} />
              </div>
            </div>

            {/* Tags Section */}
            {(companyDetails.tags && companyDetails.tags.length > 0) && (
              <div>
                <h4 className="text-md font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {companyDetails.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Detail Tags Section */}
            {(companyDetails.JobDetailTags && companyDetails.JobDetailTags.length > 0) && (
              <div>
                <h4 className="text-md font-medium mb-2">Job Detail Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {companyDetails.JobDetailTags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="border-t pt-4">
              <h4 className="text-md font-medium mb-2">Additional Information</h4>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-600">Account Created</span>
                  <span className="font-medium">
                    {companyDetails.createdAt
                      ? new Date(companyDetails.createdAt).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">
                    {companyDetails.updatedAt
                      ? new Date(companyDetails.updatedAt).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">No company information available</div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Dialog xác nhận Approve
function ApproveConfirmationDialog({
  job,
  open,
  onOpenChange,
  onStatusChange,
}) {
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    try {
      setLoading(true);
      // Use the imported API function instead of the mock
      await approveJob(job.jobID);

      // Cập nhật status trong table
      onStatusChange(job.jobID, JOB_STATUS.ACTIVE);

      // Đóng dialog và hiển thị thông báo
      onOpenChange(false);
      toast.success(`Job ID ${job.jobID} has been approved successfully.`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Job</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve this job? This job will be visible
            to all users.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="font-medium">Job ID:</div>
            <div>{job.jobID}</div>
            <div className="font-medium">Title:</div>
            <div>{job.title}</div>
            <div className="font-medium">Company:</div>
            <div>{job.company || "N/A"}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant="default"
            onClick={handleApprove}
            loading={loading}
          >
            Approve
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Dialog xác nhận Reject
function RejectConfirmationDialog({
  job,
  open,
  onOpenChange,
  rejectReason,
  setRejectReason,
  rejectReasons,
  onStatusChange,
}) {
  const [loading, setLoading] = useState(false);
  const [otherReasonText, setOtherReasonText] = useState("");

  async function handleReject() {
    if (!rejectReason) {
      toast.error("Please select a reason for rejection.");
      return;
    }

    // Kiểm tra nếu chọn "other" nhưng chưa nhập lý do
    if (rejectReason === "other" && !otherReasonText.trim()) {
      toast.error("Please provide details for the rejection reason.");
      return;
    }

    try {
      setLoading(true);

      // Chuẩn bị reason để gửi đi
      // Nếu là other reason, chỉ gửi nội dung chi tiết
      const reasonToSend =
        rejectReason === "other"
          ? otherReasonText.trim() // Chỉ gửi text, không gửi object
          : rejectReason;

      // Use the imported API function
      await rejectJob(job.jobID, reasonToSend);

      // Cập nhật status trong table
      onStatusChange(job.jobID, JOB_STATUS.REJECTED);

      // Đóng dialog và hiển thị thông báo
      onOpenChange(false);

      // Reset các giá trị
      setRejectReason("");
      setOtherReasonText("");

      toast.success(`Job ID ${job.jobID} has been rejected.`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Job</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject this job? Please select a reason for
            rejection.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="font-medium">Job ID:</div>
            <div>{job.jobID}</div>
            <div className="font-medium">Title:</div>
            <div>{job.title}</div>
          </div>

          <div className="space-y-2">
            <label htmlFor="reject-reason" className="text-sm font-medium">
              Rejection reason:
            </label>
            <Select value={rejectReason} onValueChange={setRejectReason}>
              <SelectTrigger id="reject-reason" className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {rejectReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hiển thị textarea khi chọn "Other reason" */}
          {rejectReason === "other" && (
            <div className="space-y-2">
              <label
                htmlFor="other-reason-text"
                className="text-sm font-medium"
              >
                Please specify the reason:
              </label>
              <textarea
                id="other-reason-text"
                value={otherReasonText}
                onChange={(e) => setOtherReasonText(e.target.value)}
                placeholder="Enter rejection details..."
                className="w-full min-h-[100px] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant="destructive"
            onClick={handleReject}
            loading={loading}
            disabled={
              !rejectReason ||
              (rejectReason === "other" && !otherReasonText.trim())
            }
          >
            Reject
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Dialog xác nhận Hide
function HideConfirmationDialog({ job, open, onOpenChange, onStatusChange }) {
  const [loading, setLoading] = useState(false);

  async function handleHide() {
    try {
      setLoading(true);
      // Use the imported API function
      await hideJob(job.jobID);

      // Cập nhật status trong table
      onStatusChange(job.jobID, JOB_STATUS.HIDDEN);

      // Đóng dialog và hiển thị thông báo
      onOpenChange(false);
      toast.success(`Job ID ${job.jobID} has been hidden from users.`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hide Job</DialogTitle>
          <DialogDescription>
            Are you sure you want to hide this job? The job will no longer be
            visible to users.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="font-medium">Job ID:</div>
            <div>{job.jobID}</div>
            <div className="font-medium">Title:</div>
            <div>{job.title}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant="default"
            onClick={handleHide}
            loading={loading}
          >
            Hide
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Dialog xác nhận Unhide
function UnhideConfirmationDialog({ job, open, onOpenChange, onStatusChange }) {
  const [loading, setLoading] = useState(false);

  async function handleUnhide() {
    try {
      setLoading(true);
      // Use the imported API function
      await unhideJob(job.jobID);

      // Cập nhật status trong table
      onStatusChange(job.jobID, JOB_STATUS.ACTIVE);

      // Đóng dialog và hiển thị thông báo
      onOpenChange(false);
      toast.success(`Job ID ${job.jobID} is now visible to users.`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unhide Job</DialogTitle>
          <DialogDescription>
            Are you sure you want to unhide this job? The job will be visible to
            users again.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="font-medium">Job ID:</div>
            <div>{job.jobID}</div>
            <div className="font-medium">Title:</div>
            <div>{job.title}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant="default"
            onClick={handleUnhide}
            loading={loading}
          >
            Unhide
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// Thay đổi từ định nghĩa cố định sang hàm trả về columns
export const createColumns = (onStatusChange) => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "jobID",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Job ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("jobID")}</div>,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("title")}</div>,
  },
  {
    accessorKey: "education",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Education
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("education")}</div>,
  },
  {
    accessorKey: "workType",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Work Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("workType")}</div>,
    filterFn: filterByMultipleValues, // Sử dụng filter tùy chỉnh
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Location
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("location")}</div>,
    // Custom filter function for multi-location support
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;

      const locations = row.getValue(id);
      if (!locations) return false;

      // Check if any of the selected locations are included in the location string
      return value.some((val) =>
        locations.toLowerCase().includes(val.toLowerCase())
      );
    }, // Sử dụng filter tùy chỉnh
  },
  {
    accessorKey: "salary",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Salary (VND)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      // const salary = parseFloat(row.getValue("salary"));
      // const formatted = new Intl.NumberFormat("vi-VN", {
      //   style: "decimal",
      //   currency: "VND",
      // }).format(salary);

      return (
        <div className="text-left font-medium">{row.getValue("salary")}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div>
          <JobStatusBadge statusCode={row.getValue("status")} />
        </div>
      );
    },
    filterFn: filterByMultipleValues,
  },
  {
    accessorKey: "exp",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Experience (years)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("exp")}</div>,
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Priority
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("priority") ? "Yes" : "No"}</div>,
  },
  {
    accessorKey: "deadline",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Deadline
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {new Date(row.getValue("deadline")).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {new Date(row.getValue("createdAt")).toLocaleDateString()}
      </div>
    ),
    filterFn: filterByDateRange, // Thêm filter function cho date range
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("updatedAt")).toLocaleDateString()}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionCell row={row} onStatusChange={onStatusChange} />,
  },
];
