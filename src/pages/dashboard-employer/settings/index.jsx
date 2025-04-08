import { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  Briefcase,
  Users,
  MessageSquare,
  CheckCircle,
  BarChart2,
  TrendingUp,
  Eye,
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
      newApplications: true,
      applicationStatusUpdates: true,
      jobSubmission: true,
      jobApproved: true,
      jobRejected: true,
      messagesReceived: true,
      profileViews: false,
      weeklyReports: true,
      performanceAlerts: true,
    },
    email: {
      newApplications: true,
      applicationStatusUpdates: true,
      jobSubmission: false,
      jobApproved: true,
      jobRejected: true,
      messagesReceived: false,
      profileViews: false,
      weeklyReports: true,
      performanceAlerts: true,
    },
  });

  const [loading, setLoading] = useState(false);
  const [settingId, setSettingId] = useState(null);
  const userId = getUserLoginData().userID;

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        setLoading(true);
        const data = await getNotificationSettingById(userId);
        console.log("Notification settings data:", data);
        setSettingId(data.notificationSettingID);

        setNotificationPreferences({
          realTime: {
            newApplications: data.newApplications ?? true,
            applicationStatusUpdates: data.applicationStatusUpdates ?? true,
            jobSubmission: data.jobSubmission ?? true,
            jobApproved: data.jobApproved ?? true,
            jobRejected: data.jobRejected ?? true,
            messagesReceived: data.messagesReceived ?? true,
            profileViews: data.profileViews ?? false,
            weeklyReports: data.weeklyReports ?? true,
            performanceAlerts: data.performanceAlerts ?? true,
          },
          email: {
            newApplications: data.emailNewApplications ?? true,
            applicationStatusUpdates:
              data.emailApplicationStatusUpdates ?? true,
            jobSubmission: data.emailJobSubmission ?? false,
            jobApproved: data.emailJobApproved ?? true,
            jobRejected: data.emailJobRejected ?? true,
            messagesReceived: data.emailMessagesReceived ?? false,
            profileViews: data.emailProfileViews ?? false,
            weeklyReports: data.emailWeeklyReports ?? true,
            performanceAlerts: data.emailPerformanceAlerts ?? true,
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

  const handleToggleChange = (category, setting) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting],
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const apiData = {
        notificationSettingID: settingId,
        userID: userId,
        newApplications: notificationPreferences.realTime.newApplications,
        applicationStatusUpdates:
          notificationPreferences.realTime.applicationStatusUpdates,
        jobSubmission: notificationPreferences.realTime.jobSubmission,
        jobApproved: notificationPreferences.realTime.jobApproved,
        jobRejected: notificationPreferences.realTime.jobRejected,
        messagesReceived: notificationPreferences.realTime.messagesReceived,
        profileViews: notificationPreferences.realTime.profileViews,
        weeklyReports: notificationPreferences.realTime.weeklyReports,
        performanceAlerts: notificationPreferences.realTime.performanceAlerts,
        emailNewApplications: notificationPreferences.email.newApplications,
        emailApplicationStatusUpdates:
          notificationPreferences.email.applicationStatusUpdates,
        emailJobSubmission: notificationPreferences.email.jobSubmission,
        emailJobApproved: notificationPreferences.email.jobApproved,
        emailJobRejected: notificationPreferences.email.jobRejected,
        emailMessagesReceived: notificationPreferences.email.messagesReceived,
        emailProfileViews: notificationPreferences.email.profileViews,
        emailWeeklyReports: notificationPreferences.email.weeklyReports,
        emailPerformanceAlerts: notificationPreferences.email.performanceAlerts,
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
      id: "applications",
      title: "Applications",
      settings: [
        {
          id: "newApplications",
          icon: <Users className="h-5 w-5 text-blue-500" />,
          title: "New Applications",
          description: "When candidates apply to your job postings",
        },
        {
          id: "applicationStatusUpdates",
          icon: <CheckCircle className="h-5 w-5 text-purple-500" />,
          title: "Application Status Updates",
          description: "When there are changes to application statuses",
        },
      ],
    },
    {
      id: "jobManagement",
      title: "Job Management",
      settings: [
        {
          id: "jobSubmission",
          icon: <Briefcase className="h-5 w-5 text-indigo-500" />,
          title: "Job Submission",
          description: "When you submit a new job posting",
        },
        {
          id: "jobApproved",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: "Job Approved",
          description: "When admin approves your job posting",
        },
        {
          id: "jobRejected",
          icon: <CheckCircle className="h-5 w-5 text-red-500" />,
          title: "Job Rejected",
          description: "When admin rejects your job posting",
        },
      ],
    },
    {
      id: "communication",
      title: "Communication",
      settings: [
        {
          id: "messagesReceived",
          icon: <MessageSquare className="h-5 w-5 text-green-500" />,
          title: "Messages Received",
          description: "When you receive new messages from candidates",
        },
        {
          id: "profileViews",
          icon: <Eye className="h-5 w-5 text-orange-500" />,
          title: "Profile Views",
          description: "When candidates view your company profile",
        },
      ],
    },
    {
      id: "analytics",
      title: "Analytics & Reports",
      settings: [
        {
          id: "weeklyReports",
          icon: <BarChart2 className="h-5 w-5 text-blue-500" />,
          title: "Weekly Reports",
          description: "Weekly summary of your job postings and applications",
        },
        {
          id: "performanceAlerts",
          icon: <TrendingUp className="h-5 w-5 text-yellow-500" />,
          title: "Performance Alerts",
          description:
            "When your job postings perform significantly above or below average",
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
