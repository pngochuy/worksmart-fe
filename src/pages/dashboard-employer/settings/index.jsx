import { useState } from "react";
import {
  Bell,
  Mail,
  Briefcase,
  Users,
  MessageSquare,
  CheckCircle,
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

export const Index = () => {
  // Initialize state for notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState({
    realTime: {
      // Applications
      newApplications: true,
      applicationStatus: true,

      // Job Management
      jobSubmitted: true,
      jobApproval: true,
      jobRejection: true,

      // Communication
      messageReceived: true,

      // Analytics
      profileViews: false,
      weeklyReport: true,
      performanceAlert: true,
    },
    email: {
      // Applications
      newApplications: true,
      applicationStatus: true,

      // Job Management
      jobSubmitted: false,
      jobApproval: true,
      jobRejection: true,

      // Communication
      messageReceived: false,

      // Analytics
      profileViews: false,
      weeklyReport: true,
      performanceAlert: true,
    },
  });

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

  // Handle form submission
  const handleSubmit = () => {
    // This function would be replaced with your API call
    saveNotificationPreferences(notificationPreferences);

    // Show success toast
    toast.success(
      "Your notification preferences have been updated successfully."
    );

    return notificationPreferences;
  };

  // This is a placeholder for your API function
  const saveNotificationPreferences = (preferences) => {
    // Return the current notification preferences
    console.log("Submitting notification preferences:", preferences);
    // Replace this with your API call
    // Example: await axios.post('/employer/preferences/notifications', preferences);
  };

  // Notification settings configuration for rendering
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
          id: "applicationStatus",
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
          id: "jobSubmitted",
          icon: <Briefcase className="h-5 w-5 text-indigo-500" />,
          title: "Job Submission",
          description: "When you submit a new job posting",
        },
        {
          id: "jobApproval",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: "Job Approved",
          description: "When admin approves your job posting",
        },
        {
          id: "jobRejection",
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
          id: "messageReceived",
          icon: <MessageSquare className="h-5 w-5 text-green-500" />,
          title: "Messages Received",
          description: "When you receive new messages from candidates",
        },
      ],
    },
    {
      id: "analytics",
      title: "Analytics & Reports",
      settings: [
        {
          id: "profileViews",
          icon: <Users className="h-5 w-5 text-orange-500" />,
          title: "Profile Views",
          description: "When candidates view your company profile",
        },
        {
          id: "weeklyReport",
          icon: <Briefcase className="h-5 w-5 text-blue-500" />,
          title: "Weekly Reports",
          description: "Weekly summary of your job postings and applications",
        },
        {
          id: "performanceAlert",
          icon: <Bell className="h-5 w-5 text-yellow-500" />,
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
                                    notificationPreferences.realTime[setting.id]
                                  }
                                  onCheckedChange={() =>
                                    handleToggleChange("realTime", setting.id)
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
                                    notificationPreferences.email[setting.id]
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
                  >
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
