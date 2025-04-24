/* eslint-disable react/prop-types */
// components/ApplicationStatus.jsx
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatDateTimeNotIncludeTime } from "@/helpers/formatDateTime";

const ApplicationStatus = ({ status, applyDate }) => {
  // Define status types and their corresponding UI elements
  const statusConfig = {
    Pending: {
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      title: "Application Pending",
      className: "bg-amber-50 border-amber-200 text-amber-800",
      description: "Your application is being reviewed by the employer.",
    },
    Approved: {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      title: "Application Approved",
      className: "bg-green-50 border-green-200 text-green-800",
      description: "Congratulations! Your application has been approved.",
    },
    Rejected: {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      title: "Application Rejected",
      className: "bg-red-50 border-red-200 text-red-800",
      description:
        "Unfortunately, your application was not selected for this position.",
    },
    "Interview Invited": {
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      title: "Interview Invited",
      className: "bg-blue-50 border-blue-200 text-blue-800",
      description:
        "Congratulations! You've been invited for an interview. Check your email for details.",
    },
  };

  // Use the status directly if it exists in our config, otherwise default to Pending
  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <div className={`p-4 border rounded-md ${config.className}`}>
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">{config.icon}</div>
        <div>
          <h4 className="font-medium text-sm">{config.title}</h4>
          <p className="text-xs mt-1">{config.description}</p>
          {applyDate && (
            <p className="text-xs mt-2">
              Applied on {formatDateTimeNotIncludeTime(applyDate)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;
