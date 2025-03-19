/* eslint-disable react/prop-types */
// UserRoleBadge.jsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShieldCheck, User, Briefcase } from "lucide-react";

export const UserRoleBadge = ({ role, className }) => {
  // Xác định variant dựa trên role
  const getVariant = () => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
      case "Employer":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      case "Candidate":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    }
  };

  // Icon dựa trên role
  const getIcon = () => {
    switch (role) {
      case "Admin":
        return <ShieldCheck className="w-3 h-3 mr-1" />;
      case "Employer":
        return <Briefcase className="w-3 h-3 mr-1" />;
      case "Candidate":
        return <User className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        getVariant(),
        "rounded-sm px-2 py-1 font-normal flex items-center",
        className
      )}
    >
      {getIcon()}
      {role}
    </Badge>
  );
};
