import React from "react";

const ApplicationStatus = ({ status, rejectionReason }) => {
  return (
    <>
      {status === "Pending" && (
        <div className="application-pending">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-yellow-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8V12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 16H12.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Application Pending
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>Your application is being reviewed by the employer.</p>
                </div>
                {/* Đã tách nút Withdraw ra ngoài */}
              </div>
            </div>
          </div>
        </div>
      )}

      {status === "Rejected" && (
        <div className="application-rejected">
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-red-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 9L9 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 9L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Application Rejected
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>
                    Unfortunately, your application was not selected for this
                    position.
                  </p>
                  {rejectionReason && (
                    <p className="mt-1 font-medium">
                      Reason: {rejectionReason}
                    </p>
                  )}
                </div>
                {/* Đã tách nút Apply Again ra ngoài */}
              </div>
            </div>
          </div>
        </div>
      )}

      {status === "Approved" && (
        <div className="application-accepted">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-green-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 4L12 14.01L9 11.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-green-800">
                  Application Accepted
                </h3>
                <div className="mt-1 text-sm text-green-700">
                  <p>Congratulations! Your application has been accepted.</p>
                  <p className="mt-1">
                    The employer might contact you soon for further steps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplicationStatus;
