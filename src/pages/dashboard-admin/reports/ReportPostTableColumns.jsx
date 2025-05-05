/* eslint-disable react/prop-types */
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "react-toastify";
import { updateReportStatus } from "@/services/adminServices";
import { formatDate } from "@/helpers/formatDateTime";
import { hideJob } from "@/services/jobServices";

// Function to create and return the columns configuration
export const createColumns = (onStatusChange) => {
  return [
    {
      accessorKey: "reportPostID",
      header: "ID",
      enableHiding: true,
    },
    {
      accessorKey: "sender.fullName",
      header: "Reported By",
      id: "senderName",
      cell: ({ row }) => {
        const sender = row.original.sender || {};
        return (
          <div className="font-medium">
            {sender.fullName || sender.userName || "Unknown User"}
          </div>
        );
      },
    },
    {
      accessorKey: "job.title",
      header: "Job",
      id: "jobTitle",
      cell: ({ row }) => {
        const job = row.original.job || {};
        return (
          <div className="max-w-[200px] truncate">
            {job.title || "Unknown Job"}
          </div>
        );
      },
    },
    {
      accessorKey: "reportContent",
      header: "Report Content",
      id: "content",
      cell: ({ row }) => {
        const content = row.original.reportContent || "";
        return (
          <div className="max-w-[300px] truncate">
            {content
              ? content.length > 50
                ? `${content.substring(0, 50)}...`
                : content
              : "No content provided"}
          </div>
        );
      },
    },
    {
      accessorKey: "reportStatus",
      header: "Status",
      id: "reportStatus",
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      cell: ({ row }) => {
        const status = row.getValue("reportStatus");
        return (
          <div>
            {status === "Pending" && (
              <Badge
                variant="outline"
                className="rounded bg-yellow-100 text-yellow-800 border-yellow-300"
              >
                Pending
              </Badge>
            )}
            {status === "Completed" && (
              <Badge
                variant="outline"
                className="rounded bg-green-100 text-green-800 border-green-300"
              >
                Completed
              </Badge>
            )}
            {status === "Rejected" && (
              <Badge
                variant="outline"
                className="rounded bg-red-100 text-red-800 border-red-300"
              >
                Rejected
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Submitted At",
      cell: ({ row }) => {
        return <div>{formatDate(row.getValue("createdAt"))}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return <ActionCell row={row} onStatusChange={onStatusChange} />;
      },
    },
  ];
};

// Action Cell component with view details, accept, and reject actions
const ActionCell = ({ row, onStatusChange }) => {
  const report = row.original;
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // "complete" or "reject"
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleViewDetails = () => {
    setViewDialogOpen(true);
  };

  const openConfirmDialog = (type) => {
    setActionType(type);
    setRejectReason("");
    setConfirmDialogOpen(true);
    setViewDialogOpen(false);
  };

  const handleStatusChange = async () => {
    if (actionType === "reject" && !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsProcessing(true);
    const newStatus = actionType === "complete" ? "Completed" : "Rejected";

    try {
      // Call API to update report status with reason if it's a rejection
      await updateReportStatus(report.reportPostID, {
        status: newStatus,
        reason: actionType === "reject" ? rejectReason : undefined,
      });

      // Use the imported API function
      if (report.job && report.job.jobID) {
        console.log("row:", row);
        console.log("row.original:", row.original);
        console.log("Job ID found in the report object:", report.job.jobID);
        await hideJob(report.job.jobID);
      } else {
        console.warn("Job ID not found in the report object");
      }

      // Update local state via callback
      onStatusChange(report.reportPostID, { reportStatus: newStatus });

      toast.success(
        `Report ${
          actionType === "complete" ? "completed" : "rejected"
        } successfully`
      );
    } catch (error) {
      console.error(
        `Error ${
          actionType === "complete" ? "completing" : "rejecting"
        } report:`,
        error
      );
      toast.error(
        `Failed to ${
          actionType === "complete" ? "complete" : "reject"
        } report. Please try again.`
      );
    } finally {
      setIsProcessing(false);
      setConfirmDialogOpen(false);
    }
  };

  const isPending = report.reportStatus === "Pending";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          {isPending && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openConfirmDialog("complete")}
                disabled={isProcessing}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Complete Report
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openConfirmDialog("reject")}
                disabled={isProcessing}
              >
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                Reject Report
              </DropdownMenuItem>
            </>
          )}

          {report.job && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  window.open(`/job-list/${report.job.jobID}`, "_blank")
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Job Post
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Detailed information about the reported job.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <h3 className="font-medium mb-1">Report ID</h3>
              <p className="text-sm text-gray-500">{report.reportPostID}</p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Reported By</h3>
              <p className="text-sm text-gray-500">
                {report.sender?.fullName ||
                  report.sender?.userName ||
                  "Unknown User"}
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Job Title</h3>
              <p className="text-sm text-gray-500">
                {report.job?.title || "Unknown Job"}
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Status</h3>
              <p className="text-sm">
                {report.reportStatus === "Pending" && (
                  <Badge
                    variant="outline"
                    className="rounded bg-yellow-100 text-yellow-800 border-yellow-300"
                  >
                    Pending
                  </Badge>
                )}
                {report.reportStatus === "Completed" && (
                  <Badge
                    variant="outline"
                    className="rounded bg-green-100 text-green-800 border-green-300"
                  >
                    Completed
                  </Badge>
                )}
                {report.reportStatus === "Rejected" && (
                  <Badge
                    variant="outline"
                    className="rounded bg-red-100 text-red-800 border-red-300"
                  >
                    Rejected
                  </Badge>
                )}
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Submitted At</h3>
              <p className="text-sm text-gray-500">
                {formatDate(report.createdAt)}
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Report Content</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap border p-2 rounded-md bg-gray-50">
                {report.reportContent || "No content provided"}
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            {isPending ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="destructive"
                    onClick={() => openConfirmDialog("reject")}
                    disabled={isProcessing}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => openConfirmDialog("complete")}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                </div>
              </>
            ) : (
              <Button
                variant="default"
                onClick={() => setViewDialogOpen(false)}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {actionType === "complete" ? (
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              )}
              Confirm {actionType === "complete" ? "Completion" : "Rejection"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "complete"
                ? "Are you sure you want to complete this report? This action cannot be undone."
                : "Are you sure you want to reject this report? You'll need to provide a reason."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {actionType === "reject" && (
              <div className="grid gap-2">
                <Label htmlFor="reject-reason" className="font-medium">
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Please provide a reason for rejecting this report"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}

            <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
              <p className="text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                This action cannot be reversed. Please confirm your decision to
                hide job reported.
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false);
                setViewDialogOpen(true);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "complete" ? "default" : "destructive"}
              className={
                actionType === "complete"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
              onClick={handleStatusChange}
              disabled={
                isProcessing ||
                (actionType === "reject" && !rejectReason.trim())
              }
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  {actionType === "complete" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Completion
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Confirm Rejection
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
