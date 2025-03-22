/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  Ban,
  UserX,
  Eye,
  MailCheck,
  FileCheck,
  FileText,
  FileWarning,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import LoadingButton from "@/components/LoadingButton";
import { toast } from "react-toastify";
import { UserVerificationBadge } from "./UserVerificationBadge";
import { UserRoleBadge } from "./UserBadge";
import { 
  banUser, 
  unbanUser,
  approveTaxVerification,
  rejectTaxVerification,
  approveLicenseVerification,
  rejectLicenseVerification,
} from "@/services/adminServices";

// Enum for user roles
export const USER_ROLE = {
  ADMIN: "Admin",
  EMPLOYER: "Employer",
  CANDIDATE: "Candidate",
};

// Enum for verification levels
export const VERIFICATION_LEVEL = {
  NONE: 0,
  EMAIL_VERIFIED: 1,
  TAX_VERIFIED: 2,
  FULLY_VERIFIED: 3,
};

// // Mock API functions
// const banUser = async (userId) => {
//   await new Promise((resolve) => setTimeout(resolve, 500));
//   console.log(`Ban user ${userId}`);
//   return { success: true };
// };

// const unbanUser = async (userId) => {
//   await new Promise((resolve) => setTimeout(resolve, 500));
//   console.log(`Unban user ${userId}`);
//   return { success: true };
// };

// const approveTaxVerification = async (userId) => {
//   await new Promise((resolve) => setTimeout(resolve, 500));
//   console.log(`Approve tax verification for user ${userId}`);
//   return { success: true };
// };

// const rejectTaxVerification = async (userId, reason) => {
//   await new Promise((resolve) => setTimeout(resolve, 500));
//   console.log(
//     `Reject tax verification for user ${userId} with reason: ${reason}`
//   );
//   return { success: true };
// };

// const approveLicenseVerification = async (userId) => {
//   await new Promise((resolve) => setTimeout(resolve, 500));
//   console.log(`Approve license verification for user ${userId}`);
//   return { success: true };
// };

// const rejectLicenseVerification = async (userId, reason) => {
//   await new Promise((resolve) => setTimeout(resolve, 500));
//   console.log(
//     `Reject license verification for user ${userId} with reason: ${reason}`
//   );
//   return { success: true };
// };

// Filter functions
const filterByMultipleValues = (row, id, filterValues) => {
  if (!filterValues || !filterValues.length) return true;
  const rowValue = row.getValue(id);
  return filterValues.includes(rowValue);
};

const filterByDateRange = (row, id, filterValues) => {
  if (!filterValues || !filterValues.length) return true;

  const rowDate = new Date(row.getValue(id));
  const [start, end] = filterValues;

  if (!start || !end) return true;

  const startTime = new Date(start).setHours(0, 0, 0, 0);
  const endTime = new Date(end).setHours(23, 59, 59, 999);
  const rowTime = new Date(rowDate).getTime();

  return rowTime >= startTime && rowTime <= endTime;
};

// Component for action cell
const ActionCell = ({ row, onStatusChange }) => {
  const user = row.original;
  const isBanned = user.isBanned;
  const isEmployer = user.role === "Employer";
  const verificationLevel = user.verificationLevel;
  const taxVerificationStatus = user.taxVerificationStatus;
  const licenseVerificationStatus = user.licenseVerificationStatus;

  const [showBanConfirmation, setShowBanConfirmation] = useState(false);
  const [showUnbanConfirmation, setShowUnbanConfirmation] = useState(false);
  const [showTaxVerificationDialog, setShowTaxVerificationDialog] = useState(false);
  const [showLicenseVerificationDialog, setShowLicenseVerificationDialog] = useState(false);

  // Get actions based on user status
  const getActions = () => {
    const actions = [];

    // View action for all users
    actions.push({
      label: "View Profile",
      icon: <Eye className="size-4 mr-2" />,
      onClick: () => console.log("View profile", user.userID),
    });

    // Ban/Unban actions
    if (!isBanned) {
      actions.push({
        label: "Ban User",
        icon: <Ban className="size-4 mr-2" />,
        onClick: () => setShowBanConfirmation(true),
      });
    } else {
      actions.push({
        label: "Unban User",
        icon: <UserX className="size-4 mr-2" />,
        onClick: () => setShowUnbanConfirmation(true),
      });
    }

    // Add Tax Verification action for Employers with pending status
    if (
      isEmployer &&
      taxVerificationStatus === "Pending" &&
      verificationLevel === 1
    ) {
      actions.push({
        label: "Review Tax Info",
        icon: <FileText className="size-4 mr-2" />,
        onClick: () => setShowTaxVerificationDialog(true),
      });
    }

    // Add License Verification action for Employers with pending license and approved tax
    if (
      isEmployer &&
      licenseVerificationStatus === "Pending" &&
      verificationLevel === 2
    ) {
      actions.push({
        label: "Review License",
        icon: <FileCheck className="size-4 mr-2" />,
        onClick: () => setShowLicenseVerificationDialog(true),
      });
    }

    return actions;
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

          {/* Render actions based on user status */}
          {getActions().map((action, index) => (
            <DropdownMenuItem key={index} onClick={action.onClick}>
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Ban Confirmation Dialog */}
      <BanConfirmationDialog
        user={user}
        open={showBanConfirmation}
        onOpenChange={setShowBanConfirmation}
        onStatusChange={onStatusChange}
      />

      {/* Unban Confirmation Dialog */}
      <UnbanConfirmationDialog
        user={user}
        open={showUnbanConfirmation}
        onOpenChange={setShowUnbanConfirmation}
        onStatusChange={onStatusChange}
      />

      {/* Tax Verification Dialog */}
      <TaxVerificationDialog
        user={user}
        open={showTaxVerificationDialog}
        onOpenChange={setShowTaxVerificationDialog}
        onStatusChange={onStatusChange}
      />

      {/* License Verification Dialog */}
      <LicenseVerificationDialog
        user={user}
        open={showLicenseVerificationDialog}
        onOpenChange={setShowLicenseVerificationDialog}
        onStatusChange={onStatusChange}
      />
    </>
  );
};

// Ban Confirmation Dialog
function BanConfirmationDialog({ user, open, onOpenChange, onStatusChange }) {
  const [loading, setLoading] = useState(false);

  async function handleBan() {
    try {
      setLoading(true);
      // Gọi API ban user thông qua service
      const result = await banUser(user.userID);
      onStatusChange(user.userID, { isBanned: true });
      onOpenChange(false);
      toast.success(result.Message || `User ${user.email} has been banned.`);
    } catch (error) {
      console.error(error);
      toast.error(error.Message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Are you sure you want to ban this user? They will no longer be able
            to access the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="font-medium">User ID:</div>
            <div>{user.userID}</div>
            <div className="font-medium">Email:</div>
            <div>{user.email}</div>
            <div className="font-medium">Role:</div>
            <div>{user.role}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant="destructive"
            onClick={handleBan}
            loading={loading}
          >
            Ban User
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Unban Confirmation Dialog
function UnbanConfirmationDialog({ user, open, onOpenChange, onStatusChange }) {
  const [loading, setLoading] = useState(false);

  async function handleUnban() {
    try {
      setLoading(true);
      // Gọi API unban user thông qua service
      const result = await unbanUser(user.userID);
      onStatusChange(user.userID, { isBanned: false });
      onOpenChange(false);
      toast.success(result.Message || `User ${user.email} has been unbanned.`);
    } catch (error) {
      console.error(error);
      toast.error(error.Message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unban User</DialogTitle>
          <DialogDescription>
            Are you sure you want to unban this user? They will be able to
            access the platform again.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="font-medium">User ID:</div>
            <div>{user.userID}</div>
            <div className="font-medium">Email:</div>
            <div>{user.email}</div>
            <div className="font-medium">Role:</div>
            <div>{user.role}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant="default"
            onClick={handleUnban}
            loading={loading}
          >
            Unban User
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Tax Verification Dialog
function TaxVerificationDialog({ user, open, onOpenChange, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("review");
  const [rejectReason, setRejectReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  // Rejection reason options
  const rejectionReasons = [
    { value: "invalid_information", label: "Invalid tax information" },
    { value: "incomplete_information", label: "Incomplete tax information" },
    { value: "mismatch_information", label: "Company information mismatch" },
    { value: "suspicious_activity", label: "Suspicious activity detected" },
    { value: "other", label: "Other reason" },
  ];

  async function handleApprove() {
    try {
      setLoading(true);
      await approveTaxVerification(user.userID);
      onStatusChange(user.userID, {
        verificationLevel: 2,
        taxVerificationStatus: "Approved",
      });
      onOpenChange(false);
      toast.success(
        `Tax information for ${
          user.companyName || user.userName
        } has been verified.`
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectReason) {
      toast.error("Please select a reason for rejection.");
      return;
    }

    if (rejectReason === "Other reason" && !otherReason.trim()) {
      toast.error("Please provide details for the rejection reason.");
      return;
    }

    try {
      setLoading(true);
      const reasonText =
        rejectReason === "Other reason" ? otherReason.trim() : rejectReason;
      await rejectTaxVerification(user.userID, reasonText);

      onStatusChange(user.userID, {
        taxVerificationStatus: "Rejected",
        taxVerificationReason: reasonText,
      });

      onOpenChange(false);
      toast.success(
        `Tax verification for ${
          user.companyName || user.userName
        } has been rejected.`
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tax Verification Review</DialogTitle>
          <DialogDescription>
            Review the tax information provided by{" "}
            {user.companyName || user.userName}.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="review"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="review">Review Information</TabsTrigger>
            <TabsTrigger
              value="reject"
              disabled={activeTab === "reject" && !rejectReason}
            >
              Reject
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="py-4">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Company Information
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-[150px_1fr] gap-2">
                      <div className="font-medium">Company Name:</div>
                      <div>{user.companyName || "N/A"}</div>

                      <div className="font-medium">Tax ID:</div>
                      <div>{user.taxId || "N/A"}</div>

                      <div className="font-medium">Industry:</div>
                      <div>{user.industry || "N/A"}</div>

                      <div className="font-medium">Company Size:</div>
                      <div>{user.companySize || "N/A"}</div>

                      <div className="font-medium">Website:</div>
                      <div>{user.companyWebsite || "N/A"}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-[150px_1fr] gap-2">
                      <div className="font-medium">Contact Person:</div>
                      <div>{user.fullName || "N/A"}</div>

                      <div className="font-medium">Email:</div>
                      <div>{user.email || "N/A"}</div>

                      <div className="font-medium">Phone:</div>
                      <div>{user.phoneNumber || "N/A"}</div>

                      <div className="font-medium">Address:</div>
                      <div>{user.address || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("reject")}
                >
                  Reject
                </Button>
                <LoadingButton
                  variant="default"
                  onClick={handleApprove}
                  loading={loading}
                >
                  Approve
                </LoadingButton>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reject" className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="reject-reason">Rejection Reason:</Label>
                <Select value={rejectReason} onValueChange={setRejectReason}>
                  <SelectTrigger id="reject-reason" className="w-full">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {rejectionReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.label}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {rejectReason === "Other reason" && (
                <div>
                  <Label htmlFor="other-reason">Please specify:</Label>
                  <Textarea
                    id="other-reason"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="min-h-[100px]"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("review")}
                >
                  Back to Review
                </Button>
                <LoadingButton
                  variant="destructive"
                  onClick={handleReject}
                  loading={loading}
                  disabled={
                    !rejectReason ||
                    (rejectReason === "other" && !otherReason.trim())
                  }
                >
                  Confirm Rejection
                </LoadingButton>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Updated PDF Download function for Cloudinary PDFs
function LicenseVerificationDialog({
  user,
  open,
  onOpenChange,
  onStatusChange,
}) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("review");
  const [rejectReason, setRejectReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  // URL of license document (replace with actual URL from user)
  const originalDocumentUrl = user.businessLicenseImage || "";

  // Check if it's a Cloudinary URL
  const isCloudinaryUrl =
    originalDocumentUrl && originalDocumentUrl.includes("cloudinary.com");
  const isPDF =
    originalDocumentUrl && originalDocumentUrl.toLowerCase().endsWith(".pdf");

  // Create preview URL as jpg if it's a PDF from Cloudinary
  // const viewableUrl =
  //   isCloudinaryUrl && isPDF
  //     ? originalDocumentUrl.replace("/upload/", "/upload/f_jpg/")
  //     : originalDocumentUrl;
  
  const viewableUrl = originalDocumentUrl;

  // Properly handle PDF downloading with correct approach
  const downloadDocument = () => {
    if (!originalDocumentUrl) {
      toast.error("No document available to download");
      return;
    }

    try {
      // For Cloudinary PDF, add attachment disposition flag
      if (isCloudinaryUrl && isPDF) {
        // Create a filename from the URL or use a default name
        const filename = originalDocumentUrl.split("/").pop() || "document.pdf";

        // Use fetch to get the PDF with proper headers
        fetch(originalDocumentUrl)
          .then((response) => response.blob())
          .then((blob) => {
            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          })
          .catch((error) => {
            console.error("Download error:", error);
            toast.error("Error downloading file. Please try again.");
          });
      } else {
        // For non-Cloudinary files, open in a new tab
        window.open(originalDocumentUrl, "_blank");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error downloading file. Please try again.");
    }
  };

  // Rejection reason options
  const rejectionReasons = [
    { value: "invalid_license", label: "Invalid business license" },
    { value: "expired_license", label: "Expired business license" },
    { value: "unclear_document", label: "Unclear or unreadable document" },
    {
      value: "mismatched_information",
      label: "Information mismatch with tax details",
    },
    { value: "other", label: "Other reason" },
  ];

  // Open PDF directly (as JPG if from Cloudinary)
  const openViewableDocument = () => {
    if (viewableUrl) {
      window.open(viewableUrl, "_blank");
    } else {
      toast.error("No document available to view");
    }
  };

  // Show PDF in dialog
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  async function handleApprove() {
    try {
      setLoading(true);
      await approveLicenseVerification(user.userID);
      onStatusChange(user.userID, {
        verificationLevel: 3,
        licenseVerificationStatus: "Approved",
      });
      onOpenChange(false);
      toast.success(
        `Business license for ${
          user.companyName || user.userName
        } has been verified.`
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectReason) {
      toast.error("Please select a reason for rejection.");
      return;
    }

    if (rejectReason === "Other reason" && !otherReason.trim()) {
      toast.error("Please provide details for the rejection reason.");
      return;
    }

    try {
      setLoading(true);
      const reasonText =
        rejectReason === "Other reason" ? otherReason.trim() : rejectReason;
      await rejectLicenseVerification(user.userID, reasonText);

      onStatusChange(user.userID, {
        licenseVerificationStatus: "Rejected",
        licenseVerificationReason: reasonText,
      });

      onOpenChange(false);
      toast.success(
        `License verification for ${
          user.companyName || user.userName
        } has been rejected.`
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Business License Verification</DialogTitle>
          <DialogDescription>
            Review the business license provided by{" "}
            {user.companyName || user.userName}.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="review"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="review">Review Information</TabsTrigger>
            <TabsTrigger
              value="reject"
              disabled={activeTab === "reject" && !rejectReason}
            >
              Reject
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="py-4">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Company Information (Verified)
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-[150px_1fr] gap-2">
                      <div className="font-medium">Company Name:</div>
                      <div>{user.companyName || "N/A"}</div>

                      <div className="font-medium">Tax ID:</div>
                      <div>{user.taxId || "N/A"}</div>

                      <div className="font-medium">Industry:</div>
                      <div>{user.industry || "N/A"}</div>

                      <div className="font-medium">Company Size:</div>
                      <div>{user.companySize || "N/A"}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Business License</h3>
                  {originalDocumentUrl ? (
                    <div className="mb-2 space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          onClick={openViewableDocument}
                          className="flex items-center justify-center"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View as File
                        </Button>

                        <Button
                          variant="outline"
                          onClick={downloadDocument}
                          className="flex items-center justify-center"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Download
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => setShowPdfViewer(!showPdfViewer)}
                          // className="w-full"
                        >
                          {showPdfViewer
                            ? "Hide Document"
                            : "Show Document"}
                        </Button>
                      </div>

                      {showPdfViewer && (
                        <div className="border rounded-md p-1">
                          {/* Display PDF as JPG image if user wants to view directly */}
                          <iframe
                            src={viewableUrl}
                            title="PDF Viewer"
                            width="100%"
                            height="500px"
                            frameBorder="0"
                          ></iframe>
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground">
                        <p>
                          You have multiple options to view this document:
                          &quot;View as File&quot; converts the PDF to an file
                          for easy viewing, &quot;View Original&quot; opens the
                          PDF in a new tab, and &quot;Download&quot; allows you
                          to save the file to your device.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed rounded-md text-center">
                      <FileWarning className="h-10 w-10 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        No document has been uploaded by the user
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("reject")}
                >
                  Reject
                </Button>
                <LoadingButton
                  variant="default"
                  onClick={handleApprove}
                  loading={loading}
                  disabled={!originalDocumentUrl}
                >
                  Approve
                </LoadingButton>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reject" className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="reject-reason">Rejection Reason:</Label>
                <Select value={rejectReason} onValueChange={setRejectReason}>
                  <SelectTrigger id="reject-reason" className="w-full">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {rejectionReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.label}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {rejectReason === "Other reason" && (
                <div>
                  <Label htmlFor="other-reason">Please specify:</Label>
                  <Textarea
                    id="other-reason"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="min-h-[100px]"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("review")}
                >
                  Back to Review
                </Button>
                <LoadingButton
                  variant="destructive"
                  onClick={handleReject}
                  loading={loading}
                  disabled={
                    !rejectReason ||
                    (rejectReason === "other" && !otherReason.trim())
                  }
                >
                  Confirm Rejection
                </LoadingButton>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Create columns function
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
    accessorKey: "userID",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        User ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("userID")}</div>,
  },
  {
    accessorKey: "userName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Username
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("userName")}</div>
    ),
  },
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Full Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("fullName") || "-"}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <span>{row.getValue("email")}</span>
        {row.original.isEmailConfirmed && (
          <MailCheck className="ml-2 h-4 w-4 text-green-500" />
        )}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Role
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <UserRoleBadge role={row.getValue("role")} />,
    filterFn: filterByMultipleValues,
  },
  {
    accessorKey: "verificationLevel",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Verification
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <UserVerificationBadge
        verificationLevel={row.getValue("verificationLevel")}
        taxVerificationStatus={row.original.taxVerificationStatus}
        licenseVerificationStatus={row.original.licenseVerificationStatus}
        role={row.original.role}
      />
    ),
    filterFn: (row, id, filterValue) => {
      // Nếu không có filter hoặc filter là mảng rỗng, trả về true
      if (!filterValue || filterValue.length === 0) return true;

      // Lấy giá trị từ row
      const role = row.getValue("role");
      const verificationLevel = row.getValue(id);

      // Nếu không phải Employer, không cần filter
      if (role !== "Employer") return false; // Không hiện nếu role khác Employer

      // Nếu là Employer, kiểm tra verificationLevel có nằm trong filterValue không
      return filterValue.includes(verificationLevel);
    },
  },
  {
    accessorKey: "companyName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Company
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        {row.original.role === "Employer"
          ? row.getValue("companyName") || "-"
          : "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "taxVerificationStatus",
    header: "Tax Status",
    cell: ({ row }) => {
      if (row.original.role !== "Employer") return <div>N/A</div>;

      const status = row.getValue("taxVerificationStatus");

      switch (status) {
        case "Pending":
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-yellow-100 text-yellow-800">
              <AlertCircle className="w-3 h-3 mr-1" />
              Pending
            </span>
          );
        case "Approved":
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-green-100 text-green-800">
              <CheckIcon className="w-3 h-3 mr-1" />
              Approved
            </span>
          );
        case "Rejected":
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-red-100 text-red-800">
              <XIcon className="w-3 h-3 mr-1" />
              Rejected
            </span>
          );
        default:
          return <div>{status || "-"}</div>;
      }
    },
    filterFn: (row, id, filterValue) => {
      // Custom filter function for tax verification status
      if (!filterValue || filterValue.length === 0) return true;
      if (row.getValue("role") !== "Employer") return false;
      return filterValue.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "licenseVerificationStatus",
    header: "License Status",
    cell: ({ row }) => {
      if (row.original.role !== "Employer") return <div>N/A</div>;

      const status = row.getValue("licenseVerificationStatus");

      switch (status) {
        case "Pending":
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-yellow-100 text-yellow-800">
              <AlertCircle className="w-3 h-3 mr-1" />
              Pending
            </span>
          );
        case "Approved":
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-sml text-xs font-medium bg-green-100 text-green-800">
              <CheckIcon className="w-3 h-3 mr-1" />
              Approved
            </span>
          );
        case "Rejected":
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-red-100 text-red-800">
              <XIcon className="w-3 h-3 mr-1" />
              Rejected
            </span>
          );
        default:
          return <div>{status || "-"}</div>;
      }
    },
    filterFn: (row, id, filterValue) => {
      // Custom filter function for license verification status
      if (!filterValue || filterValue.length === 0) return true;
      if (row.getValue("role") !== "Employer") return false;
      return filterValue.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => <div>{row.getValue("phoneNumber") || "-"}</div>,
  },
  {
    accessorKey: "isBanned",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        {row.getValue("isBanned") ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-red-100 text-red-800">
            Banned
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        )}
      </div>
    ),
    filterFn: filterByMultipleValues,
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => <div>{row.getValue("address") || "-"}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Registered At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {new Date(row.getValue("createdAt")).toLocaleDateString()}
      </div>
    ),
    filterFn: filterByDateRange,
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
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

// Import CheckIcon and XIcon từ Lucide
import { CheckIcon, XIcon } from "lucide-react";

export default createColumns;
