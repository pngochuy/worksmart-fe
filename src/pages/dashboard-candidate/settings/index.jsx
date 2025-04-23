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
import {
  Card,
  CardContent,
  CardDescription,
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

  const [loadingToggles, setLoadingToggles] = useState({});
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

  const handleToggleChange = async (category, setting) => {
    try {
      const toggleKey = `${category}-${setting}`;
      setLoadingToggles((prev) => ({
        ...prev,
        [toggleKey]: true,
      }));

      const newValue = !notificationPreferences[category][setting];

      setNotificationPreferences((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: newValue,
        },
      }));

      const apiData = {
        notificationSettingID: settingId,
        userID: userId,

        savedJobsUpdates: notificationPreferences.realTime.savedJobsUpdates,
        recommendedJobs: notificationPreferences.realTime.recommendedJobs,
        applicationApproved:
          notificationPreferences.realTime.applicationApproved,
        applicationApply: notificationPreferences.realTime.applicationApply,
        applicationRejected:
          notificationPreferences.realTime.applicationRejected,
        applicationDeadlines:
          notificationPreferences.realTime.applicationDeadlines,

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

      if (category === "realTime") {
        apiData[setting] = newValue;
      } else if (category === "email") {
        apiData[`email${setting.charAt(0).toUpperCase() + setting.slice(1)}`] =
          newValue;
      }

      await updateNotificationSetting(userId, apiData);

      toast.success(
        `${setting
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())} notifications ${
          newValue ? "enabled" : "disabled"
        }.`
      );
    } catch (error) {
      console.error(`Failed to update ${setting} setting:`, error);

      setNotificationPreferences((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: !prev[category][setting],
        },
      }));

      toast.error(`Failed to update notification setting. Please try again.`);
    } finally {
      const toggleKey = `${category}-${setting}`;
      setLoadingToggles((prev) => ({
        ...prev,
        [toggleKey]: false,
      }));
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
                              {category.settings.map((setting) => {
                                const toggleKey = `realTime-${setting.id}`;
                                const isToggleLoading =
                                  loadingToggles[toggleKey];

                                return (
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
                                      disabled={isToggleLoading}
                                      className={`rounded-xl ${
                                        isToggleLoading ? "opacity-70" : ""
                                      }`}
                                    />
                                  </div>
                                );
                              })}
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
                              {category.settings.map((setting) => {
                                const toggleKey = `email-${setting.id}`;
                                const isToggleLoading =
                                  loadingToggles[toggleKey];

                                return (
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
                                      disabled={isToggleLoading}
                                      className={`rounded-xl ${
                                        isToggleLoading ? "opacity-70" : ""
                                      }`}
                                    />
                                  </div>
                                );
                              })}
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
