import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRandomPremiumJob } from "@/services/jobServices";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Star,
  Briefcase,
  MapPin,
  CalendarDays,
  CheckCircle2,
  Building,
} from "lucide-react";

export const PremiumJobPromotion = () => {
  const [premiumJob, setPremiumJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userLoginData"));

  useEffect(() => {
    const fetchPremiumJob = async () => {
      try {
        setIsLoading(true);
        const job = await getRandomPremiumJob();
        setPremiumJob(job);
      } catch (error) {
        console.error("Error fetching premium job:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPremiumJob();
  }, []);

  const handleViewJob = () => {
    if (premiumJob?.jobID) {
      navigate(`/job-list/${premiumJob.jobID}`);
    }
  };

  const handleUpgradeToPremium = () => {
    navigate(`/${user.role}/package-list`);
  };

  return (
    <Card className="border shadow-sm rounded-lg overflow-hidden">
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gray-200 animate-pulse rounded-full"></div>
              <div className="h-6 bg-gray-200 animate-pulse rounded w-2/3"></div>
            </div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 animate-pulse rounded w-full mt-4"></div>
          </div>
        ) : premiumJob ? (
          <div>
            <div className="relative p-5">
              {/* Priority Badge - Adjusted position and size */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1 bg-amber-400 text-white px-2 py-1 rounded text-xs">
                  <Star className="h-3 w-3" fill="currentColor" />
                  <span className="font-semibold">PREMIUM</span>
                </div>
              </div>

              {/* Company Avatar and Job Title */}
              <div className="flex items-center gap-3 mb-4 pr-20">
                <Avatar className="h-12 w-12 border rounded-full">
                  <AvatarImage
                    src={premiumJob.avatar || premiumJob.companyLogo}
                    alt={premiumJob.title}
                  />
                  <AvatarFallback>{premiumJob.title.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-gray-800">
                  {premiumJob.title}
                </h2>
              </div>

              {/* Job Details - Better spacing */}
              <div className="grid grid-cols-1 gap-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {premiumJob.worktype || "Full-Time"}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {premiumJob.location || "Da Nang, Ho Chi Minh"}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Building className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {premiumJob.companyName || "Unknown Company"}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {premiumJob.exp > 0
                      ? `${premiumJob.exp} years of experience`
                      : `No experience required`}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <CalendarDays className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-sm truncate">
                    Deadline:{" "}
                    {new Date(premiumJob.deadline).toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>

              {/* Salary Range - More appropriate size */}
              <div className="text-xl font-bold text-emerald-700 mb-3">
                {premiumJob.salary || "25,000,000 - 35,000,000"}
              </div>

              {/* Action Button */}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 mt-2"
                onClick={handleViewJob}
              >
                Apply
              </Button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Call to Action - Better spacing */}
            <div className="bg-gray-50 p-4 text-center">
              <p className="text-xs text-gray-600 mb-2">
                Are you an employer? Premium jobs will be featured prominently
                and attract more quality candidates!
              </p>
              <Button
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-50 text-sm py-1 h-auto"
                onClick={handleUpgradeToPremium}
              >
                Upgrade to Premium now
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-gray-800 text-sm">
                Premium Job
              </h3>
            </div>
            <p className="text-xs text-gray-600">
              Get instant notifications when a suitable job is posted. Stand out
              as a priority candidate.
            </p>
            <Button
              variant="secondary"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-auto py-1.5 text-sm"
              onClick={handleUpgradeToPremium}
            >
              Upgrade to Premium
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
