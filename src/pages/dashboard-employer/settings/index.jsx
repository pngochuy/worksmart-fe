import { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  Briefcase,
  Users,
  CheckCircle,
  BarChart2,
  TrendingUp,
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
  // State cho notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState({
    realTime: {
      // Applications
      newApplications: true,
      applicationStatusUpdates: true,

      // Job Management
      jobSubmission: true,
      jobApproved: true,
      jobRejected: true,

      // Analytics
      weeklyReports: true,
      performanceAlerts: true,
    },
    email: {
      // Applications
      newApplications: true,
      applicationStatusUpdates: true,

      // Job Management
      jobSubmission: false,
      jobApproved: true,
      jobRejected: true,

      // Analytics
      weeklyReports: true,
      performanceAlerts: true,
    },
  });

  // Thêm state theo dõi loading cho từng toggle
  const [loadingToggles, setLoadingToggles] = useState({});
  const [loading, setLoading] = useState(false);
  const [settingId, setSettingId] = useState(null);
  const userId = getUserLoginData().userID;

  // Lấy notification settings khi component được mount
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        setLoading(true);
        const data = await getNotificationSettingById(userId);
        console.log("Notification settings data:", data);
        setSettingId(data.notificationSettingID);

        // Map dữ liệu API sang cấu trúc state
        setNotificationPreferences({
          realTime: {
            // Applications
            newApplications: data.newApplications ?? true,
            applicationStatusUpdates: data.applicationStatusUpdates ?? true,

            // Job Management
            jobSubmission: data.jobSubmission ?? true,
            jobApproved: data.jobApproved ?? true,
            jobRejected: data.jobRejected ?? true,

            // Analytics
            weeklyReports: data.weeklyReports ?? true,
            performanceAlerts: data.performanceAlerts ?? true,
          },
          email: {
            // Applications
            newApplications: data.emailNewApplications ?? true,
            applicationStatusUpdates:
              data.emailApplicationStatusUpdates ?? true,

            // Job Management
            jobSubmission: data.emailJobSubmission ?? false,
            jobApproved: data.emailJobApproved ?? true,
            jobRejected: data.emailJobRejected ?? true,

            // Analytics
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

  // Cập nhật hàm xử lý toggle để gọi API ngay lập tức
  const handleToggleChange = async (category, setting) => {
    // Tạo khóa duy nhất cho toggle
    const toggleKey = `${category}-${setting}`;

    try {
      // Đánh dấu toggle đang được cập nhật
      setLoadingToggles((prev) => ({
        ...prev,
        [toggleKey]: true,
      }));

      // Cập nhật state local trước để UI phản hồi ngay
      const newValue = !notificationPreferences[category][setting];
      setNotificationPreferences((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: newValue,
        },
      }));

      // Chuẩn bị dữ liệu API
      const apiData = {
        notificationSettingID: settingId,
        userID: userId,

        // Real-time Notifications
        newApplications: notificationPreferences.realTime.newApplications,
        applicationStatusUpdates:
          notificationPreferences.realTime.applicationStatusUpdates,
        jobSubmission: notificationPreferences.realTime.jobSubmission,
        jobApproved: notificationPreferences.realTime.jobApproved,
        jobRejected: notificationPreferences.realTime.jobRejected,
        weeklyReports: notificationPreferences.realTime.weeklyReports,
        performanceAlerts: notificationPreferences.realTime.performanceAlerts,

        // Email Notifications
        emailNewApplications: notificationPreferences.email.newApplications,
        emailApplicationStatusUpdates:
          notificationPreferences.email.applicationStatusUpdates,
        emailJobSubmission: notificationPreferences.email.jobSubmission,
        emailJobApproved: notificationPreferences.email.jobApproved,
        emailJobRejected: notificationPreferences.email.jobRejected,
        emailWeeklyReports: notificationPreferences.email.weeklyReports,
        emailPerformanceAlerts: notificationPreferences.email.performanceAlerts,
      };

      // Cập nhật giá trị mới vào dữ liệu API
      if (category === "realTime") {
        apiData[setting] = newValue;
      } else if (category === "email") {
        apiData[`email${setting.charAt(0).toUpperCase() + setting.slice(1)}`] =
          newValue;
      }

      // Gọi API update
      await updateNotificationSetting(userId, apiData);

      // Hiển thị thông báo thành công
      toast.success(
        `${setting
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())} notifications ${
          newValue ? "enabled" : "disabled"
        }.`
      );
    } catch (error) {
      console.error(`Failed to update ${setting} setting:`, error);

      // Khôi phục giá trị cũ nếu có lỗi
      setNotificationPreferences((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: !prev[category][setting],
        },
      }));

      toast.error("Failed to update notification setting. Please try again.");
    } finally {
      // Xóa trạng thái loading cho toggle
      setLoadingToggles((prev) => ({
        ...prev,
        [toggleKey]: false,
      }));
    }
  };

  // Các cấu hình danh mục thông báo - không đổi
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
                                // Tạo khóa toggle và kiểm tra trạng thái loading
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
                                // Tạo khóa toggle và kiểm tra trạng thái loading
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
