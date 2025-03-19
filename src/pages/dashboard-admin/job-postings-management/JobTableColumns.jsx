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
import { useState } from "react";
import LoadingButton from "@/components/LoadingButton";
import { toast } from "react-toastify";
// Import real API functions
import { approveJob, rejectJob } from "../../../services/adminServices";
import { hideJob, unhideJob } from "@/services/jobServices";

// Enum for job statuses
export const JOB_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  HIDDEN: 3,
  ACTIVE: 4,
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
      case JOB_STATUS.APPROVED:
        return [
          {
            label: "Hide",
            icon: <EyeOff className="size-4 mr-2" />,
            onClick: () => setShowHideConfirmation(true),
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
          <DropdownMenuItem>View Job Details</DropdownMenuItem>
          <DropdownMenuItem>View Company</DropdownMenuItem>
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
      onStatusChange(job.jobID, JOB_STATUS.APPROVED);

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
