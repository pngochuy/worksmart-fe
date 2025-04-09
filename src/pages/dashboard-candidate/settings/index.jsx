import { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  Briefcase,
  Star,
  CheckCircle,
  Calendar,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import {
  getNotificationSettingById,
  updateNotificationSetting,
} from "../../../services/notificationSettingService";
import { getUserLoginData } from "../../../helpers/decodeJwt";

export const Index = () => {
  const [notificationPreferences, setNotificationPreferences] = useState({
    realTime: {
      // Job Opportunities
      savedJobsUpdates: true,
      recommendedJobs: true,

      // Application Status
      applicationApproved: true,
      applicationApply: true,
      applicationRejected: true,

      // Deadlines
      applicationDeadlines: true,
    },
    email: {
      // Job Opportunities
      savedJobsUpdates: true,
      recommendedJobs: true,

      // Application Status
      applicationApproved: true,
      applicationApply: true,
      applicationRejected: true,

      // Deadlines
      applicationDeadlines: true,
    },
  });

  const [loading, setLoading] = useState(false);
  const [settingId, setSettingId] = useState(null);
  const userId = getUserLoginData().userID;

  // Fetch notification settings on component mount
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        setLoading(true);
        const data = await getNotificationSettingById(userId);
        console.log("Notification settings data:", data);
        setSettingId(data.notificationSettingID);

        setNotificationPreferences({
          realTime: {
            // Job Opportunities
            savedJobsUpdates: data.savedJobsUpdates ?? true,
            recommendedJobs: data.recommendedJobs ?? true,

            // Application Status
            applicationApproved: data.applicationApproved ?? true,
            applicationApply: data.applicationApply ?? true,
            applicationRejected: data.applicationRejected ?? true,

            // Deadlines
            applicationDeadlines: data.applicationDeadlines ?? true,
          },
          email: {
            // Job Opportunities
            savedJobsUpdates: data.emailSavedJobsUpdates ?? true,
            recommendedJobs: data.emailRecommendedJobs ?? true,

            // Application Status
            applicationApproved: data.emailApplicationApproved ?? true,
            applicationApply: data.emailApplicationApply ?? true,
            applicationRejected: data.emailApplicationRejected ?? true,

            // Deadlines
            applicationDeadlines: data.emailApplicationDeadlines ?? true,
          },
        });
      } catch (error) {
        console.error("Failed to fetch notification settings:", error);
        toast.error(
          "Failed to load notification settings. Using default values."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationSettings();
  }, [userId]);

  // Handle toggle changes
  const handleToggleChange = (category, setting) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting],
      },
    }));
  };

  // Handle form submission - map our state back to API format
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const apiData = {
        notificationSettingID: settingId,
        userID: userId,

        // Real-time Notifications
        savedJobsUpdates: notificationPreferences.realTime.savedJobsUpdates,
        recommendedJobs: notificationPreferences.realTime.recommendedJobs,
        applicationApproved:
          notificationPreferences.realTime.applicationApproved,
        applicationApply: notificationPreferences.realTime.applicationApply,
        applicationRejected:
          notificationPreferences.realTime.applicationRejected,
        applicationDeadlines:
          notificationPreferences.realTime.applicationDeadlines,

        // Email Notifications
        emailSavedJobsUpdates: notificationPreferences.email.savedJobsUpdates,
        emailRecommendedJobs: notificationPreferences.email.recommendedJobs,
        emailApplicationApproved:
          notificationPreferences.email.applicationApproved,
        emailApplicationApply: notificationPreferences.email.applicationApply,
        emailApplicationRejected:
          notificationPreferences.email.applicationRejected,
        emailApplicationDeadlines:
          notificationPreferences.email.applicationDeadlines,
      };

      await updateNotificationSetting(userId, apiData);
      toast.success(
        "Your notification preferences have been updated successfully."
      );
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      toast.error(
        "Failed to update notification preferences. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const notificationCategories = [
    {
      id: "jobOpportunities",
      title: "Job Opportunities",
      settings: [
        {
          id: "savedJobsUpdates",
          icon: <Star className="h-5 w-5 text-yellow-500" />,
          title: "Saved Jobs Updates",
          description: "When there are updates to jobs you've saved",
        },
        {
          id: "recommendedJobs",
          icon: <Briefcase className="h-5 w-5 text-indigo-500" />,
          title: "Recommended Jobs",
          description: "Weekly personalized job recommendations",
        },
      ],
    },
    {
      id: "applicationStatus",
      title: "Application Status",
      settings: [
        {
          id: "applicationApply",
          icon: <FileText className="h-5 w-5 text-blue-500" />,
          title: "Application Apply",
          description: "When you apply for a new job",
        },
        {
          id: "applicationApproved",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: "Application Approved",
          description: "When your application is approved by an employer",
        },
        {
          id: "applicationRejected",
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          title: "Application Rejected",
          description: "When your application is not selected",
        },
      ],
    },
    {
      id: "deadlines",
      title: "Deadlines",
      settings: [
        {
          id: "applicationDeadlines",
          icon: <Calendar className="h-5 w-5 text-red-500" />,
          title: "Application Deadlines",
          description: "Reminders for jobs with approaching deadlines",
        },
      ],
    },
  ];

  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box mb-4">
            <h3 className="text-2xl font-bold">Settings</h3>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <Card className="applicants-widget ls-widget shadow-sm border rounded-lg">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">
                      Notifications
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Manage how you receive notifications
                    </CardDescription>
                  </div>
                </CardHeader>

                {loading ? (
                  <CardContent className="pt-6 text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">
                      Loading your notification preferences...
                    </p>
                  </CardContent>
                ) : (
                  <>
                    <CardContent className="pt-6">
                      <div className="grid gap-8">
                        {/* Real-time notifications section */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Bell className="h-5 w-5 text-indigo-600" />
                            <h4 className="text-lg font-medium">
                              Real-time Notifications
                            </h4>
                          </div>

                          <div className="space-y-6">
                            {notificationCategories.map((category) => (
                              <div
                                key={`realtime-category-${category.id}`}
                                className="space-y-4"
                              >
                                <h5 className="font-medium text-sm text-gray-600 uppercase tracking-wider">
                                  {category.title}
                                </h5>
                                {category.settings.map((setting) => (
                                  <div
                                    key={`realtime-${setting.id}`}
                                    className="flex items-center justify-between py-2"
                                  >
                                    <div className="flex items-center gap-3">
                                      {setting.icon}
                                      <div>
                                        <p className="font-medium">
                                          {setting.title}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {setting.description}
                                        </p>
                                      </div>
                                    </div>
                                    <Switch
                                      checked={
                                        notificationPreferences.realTime[
                                          setting.id
                                        ]
                                      }
                                      onCheckedChange={() =>
                                        handleToggleChange(
                                          "realTime",
                                          setting.id
                                        )
                                      }
                                      className="rounded-xl"
                                    />
                                  </div>
                                ))}
                                {category.id !==
                                  notificationCategories[
                                    notificationCategories.length - 1
                                  ].id && <Separator className="my-2" />}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Email notifications section */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Mail className="h-5 w-5 text-indigo-600" />
                            <h4 className="text-lg font-medium">
                              Email Notifications
                            </h4>
                          </div>

                          <div className="space-y-6">
                            {notificationCategories.map((category) => (
                              <div
                                key={`email-category-${category.id}`}
                                className="space-y-4"
                              >
                                <h5 className="font-medium text-sm text-gray-600 uppercase tracking-wider">
                                  {category.title}
                                </h5>
                                {category.settings.map((setting) => (
                                  <div
                                    key={`email-${setting.id}`}
                                    className="flex items-center justify-between py-2"
                                  >
                                    <div className="flex items-center gap-3">
                                      {setting.icon}
                                      <div>
                                        <p className="font-medium">
                                          {setting.title}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {setting.description}
                                        </p>
                                      </div>
                                    </div>
                                    <Switch
                                      checked={
                                        notificationPreferences.email[
                                          setting.id
                                        ]
                                      }
                                      onCheckedChange={() =>
                                        handleToggleChange("email", setting.id)
                                      }
                                      className="rounded-xl"
                                    />
                                  </div>
                                ))}
                                {category.id !==
                                  notificationCategories[
                                    notificationCategories.length - 1
                                  ].id && <Separator className="my-2" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="border-t pt-4 mt-6 flex justify-end">
                      <Button
                        onClick={handleSubmit}
                        className="bg-indigo-600 hover:bg-indigo-700"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Preferences"}
                      </Button>
                    </CardFooter>
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
