/* eslint-disable react/prop-types */
import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
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

// Mock API function for demonstration
export const reportJob = async (candidateId, jobId, reasonDetail) => {
  try {
    // Simulate API call
    console.log("Reporting job:", {
      candidateId,
      jobId,
      reasonDetail,
    });

    // In a real application, this would be an actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "Job reported successfully" });
      }, 1000);
    });
  } catch (error) {
    console.error("Error reporting job:", error);
    throw error;
  }
};

const ReportJobButton = ({ jobId, userId, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);

  const reportReasons = [
    { value: "inappropriate", label: "Inappropriate or offensive content" },
    { value: "misleading", label: "Misleading information" },
    { value: "scam", label: "Potential scam or fraud" },
    { value: "duplicate", label: "Duplicate job posting" },
    { value: "expired", label: "Job position is no longer available" },
    { value: "other", label: "Other reason" },
  ];

  const handleReport = async () => {
    if (!selectedReason) {
      toast.error("Please select a reason for reporting this job");
      return;
    }

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

      await reportJob(userId, jobId, selectedReason, reasonDetail);
      toast.success("Job reported successfully. Our team will review it.");
      setIsOpen(false);
      setSelectedReason("");
      setCustomReason("");
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

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 flex items-center gap-2",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <AlertCircle className="h-4 w-4" />
        Report Job
      </Button>

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
              <Select value={selectedReason} onValueChange={setSelectedReason}>
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
    </>
  );
};

export default ReportJobButton;
