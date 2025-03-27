/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { AlertCircle, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { checkReportStatus, reportJob } from "@/services/candidateServices";

const ReportJobButton = ({ jobId, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);

  const [reportStatus, setReportStatus] = useState("None");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already reported this job
    const checkExistingReport = async () => {
      if (jobId) {
        setIsLoading(true);
        try {
          const status = await checkReportStatus(jobId);
          setReportStatus(status);
        } catch (error) {
          console.error("Error checking report status:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkExistingReport();
  }, [jobId]);

  const reportReasons = [
    { value: "inappropriate", label: "Inappropriate or offensive content" },
    { value: "misleading", label: "Misleading information" },
    { value: "scam", label: "Potential scam or fraud" },
    { value: "duplicate", label: "Duplicate job posting" },
    { value: "expired", label: "Job position is no longer available" },
    { value: "other", label: "Other reason" },
  ];

  const handleReport = async () => {
    if (selectedReason === "other" && !customReason.trim()) {
      toast.error("Please provide details for your report");
      return;
    }

    setLoading(true);
    try {
      const reasonDetail =
        selectedReason === "other"
          ? customReason
          : reportReasons.find((reason) => reason.value === selectedReason)
              ?.label || "";

      await reportJob({ jobId, content: reasonDetail });
      toast.success("Job reported successfully. Our team will review it.");
      setIsOpen(false);
      setSelectedReason("");
      setCustomReason("");
      setReportStatus("Pending");
    } catch (error) {
      console.log("Error reporting job: ", error);
      toast.error("Failed to report job. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedReason("");
    setCustomReason("");
  };

  // Render button based on report status
  const renderReportButton = () => {
    switch (reportStatus) {
      case "Pending":
        return (
          <Button
            variant="outline"
            className={cn(
              "text-yellow-600 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-700 flex items-center gap-2 cursor-default",
              className
            )}
          >
            <AlertCircle className="h-4 w-4" />
            Report Pending
          </Button>
        );
      case "Completed":
        return (
          <Button
            variant="outline"
            disabled
            className={cn(
              "text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 flex items-center gap-2 cursor-default opacity-50",
              className
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            Report Resolved
          </Button>
        );
      case "Rejected":
        return (
          <Button
            variant="outline"
            disabled
            className={cn(
              "text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 flex items-center gap-2 cursor-default opacity-50",
              className
            )}
          >
            <XCircle className="h-4 w-4" />
            Report Rejected
          </Button>
        );
      default:
        return (
          <Button
            variant="outline"
            className={cn(
              "text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 flex items-center gap-2",
              className
            )}
            onClick={() => setIsOpen(true)}
            disabled={isLoading}
          >
            <AlertCircle className="h-4 w-4" />
            {isLoading ? "Checking..." : "Report Job"}
          </Button>
        );
    }
  };

  return (
    <>
      {renderReportButton()}

      {reportStatus === "None" && (
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Report This Job</DialogTitle>
              <DialogDescription>
                Please select a reason why you&apos;re reporting this job. Our
                team will review your report within 24-48 hours.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-reason">Reason for reporting</Label>
                <Select
                  value={selectedReason}
                  onValueChange={setSelectedReason}
                >
                  <SelectTrigger id="report-reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedReason === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-reason">Please specify</Label>
                  <Textarea
                    id="custom-reason"
                    placeholder="Please provide specific details about why you're reporting this job"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReport}
                disabled={
                  loading ||
                  !selectedReason ||
                  (selectedReason === "other" && !customReason.trim())
                }
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-5 animate-spin mr-1" />{" "}
                    <span>Submitting</span>
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ReportJobButton;
