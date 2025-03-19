/* eslint-disable react/prop-types */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Circle,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";

export const UserVerificationBadge = ({
  verificationLevel,
  taxVerificationStatus,
  licenseVerificationStatus,
  role,
  className,
}) => {
  // Nếu không phải Employer thì hiển thị N/A
  if (role !== "Employer") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "bg-gray-100 text-gray-800 hover:bg-gray-100/80",
          "rounded-sm px-2 py-1 font-normal flex items-center",
          className
        )}
      >
        <Circle className="w-3 h-3 mr-1" />
        N/A
      </Badge>
    );
  }

  // Xác định badge dựa trên verificationLevel và tax/license status
  const getDetails = () => {
    switch (verificationLevel) {
      case 1:
        return {
          label:
            taxVerificationStatus === "Pending"
              ? "Tax Verification Pending"
              : "Basic Verification",
          variant:
            taxVerificationStatus === "Pending"
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
              : "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
          icon:
            taxVerificationStatus === "Pending" ? (
              <AlertCircle className="w-3 h-3 mr-1" />
            ) : (
              <Circle className="w-3 h-3 mr-1" />
            ),
        };
      case 2:
        return {
          label:
            licenseVerificationStatus === "Pending"
              ? "License Verification Pending"
              : "Tax Verified",
          variant:
            licenseVerificationStatus === "Pending"
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
              : "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
          icon:
            licenseVerificationStatus === "Pending" ? (
              <AlertCircle className="w-3 h-3 mr-1" />
            ) : (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ),
        };
      case 3:
        return {
          label: "Fully Verified",
          variant: "bg-green-100 text-green-800 hover:bg-green-100/80",
          icon: <BadgeCheck className="w-3 h-3 mr-1" />,
        };
      default:
        return {
          label: "Unknown Status",
          variant: "bg-gray-100 text-gray-800 hover:bg-gray-100/80",
          icon: <XCircle className="w-3 h-3 mr-1" />,
        };
    }
  };

  const { label, variant, icon } = getDetails();

  return (
    <Badge
      variant="outline"
      className={cn(
        variant,
        "rounded-sm px-2 py-1 font-normal flex items-center",
        className
      )}
    >
      {icon}
      {label}
    </Badge>
  );
};
