/* eslint-disable react/prop-types */
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  ExternalLink,
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
import { useState } from "react";
import { toast } from "react-toastify";
import { updateReportStatus } from "@/services/adminServices";

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleViewDetails = () => {
    setViewDialogOpen(true);
  };

  const handleStatusChange = async (newStatus) => {
    setIsProcessing(true);
    try {
      // Call API to update report status
      await updateReportStatus(report.reportPostID, { status: newStatus });

      // Update local state via callback
      onStatusChange(report.reportPostID, { reportStatus: newStatus });

      toast.success(`Report ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error(`Error ${newStatus.toLowerCase()} report:`, error);
      toast.error(
        `Failed to ${newStatus.toLowerCase()} report. Please try again.`
      );
    } finally {
      setIsProcessing(false);
      setViewDialogOpen(false);
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
                onClick={() => handleStatusChange("Completed")}
                disabled={isProcessing}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Complete Report
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange("Rejected")}
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
                  window.open(`/jobs/${report.job.jobID}`, "_blank")
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
                    onClick={() => handleStatusChange("Rejected")}
                    disabled={isProcessing}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => handleStatusChange("Completed")}
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
    </>
  );
};
