/* eslint-disable react/prop-types */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Object ánh xạ từ giá trị số sang tên trạng thái
const JobStatusMap = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
  3: "Hidden",
  4: "Active",
};

export const JobStatusBadge = ({ statusCode, className }) => {
  // Lấy tên trạng thái từ mã số
  const statusName = JobStatusMap[statusCode] || "Unknown";

  // Xác định variant dựa trên mã số
  const getVariant = () => {
    switch (statusCode) {
      case 0: // Pending
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
      case 1: // Approved
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case 2: // Rejected
        return "bg-red-100 text-red-800 hover:bg-red-100/80";
      case 3: // Hidden
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
      case 4: // Active
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        getVariant(),
        "rounded-sm px-2 py-1 font-normal",
        className
      )}
    >
      {statusName}
    </Badge>
  );
};
