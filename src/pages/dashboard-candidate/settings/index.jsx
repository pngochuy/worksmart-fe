import { useState } from "react";
import {
  Bell,
  Mail,
  Briefcase,
  Building,
  MessageSquare,
  CheckCircle,
  Star,
  Calendar,
  FileText,
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
      // Job Opportunities
      newJobMatches: true,
      savedJobsUpdates: true,
      recommendedJobs: true,

      // Application Status
      applicationReviewed: true,
      interviewInvitation: true,
      applicationRejected: true,

      // Communication
      messageReceived: true,
      employerViewedProfile: true,

      // Events & Reminders
      upcomingInterviews: true,
      applicationDeadlines: false,
      careerEvents: true,
    },
    email: {
      // Job Opportunities
      newJobMatches: true,
      savedJobsUpdates: false,
      recommendedJobs: true,

      // Application Status
      applicationReviewed: true,
      interviewInvitation: true,
      applicationRejected: true,

      // Communication
      messageReceived: true,
      employerViewedProfile: false,

      // Events & Reminders
      upcomingInterviews: true,
      applicationDeadlines: true,
      careerEvents: true,
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
    // Example: await axios.post('/candidate/preferences/notifications', preferences);
  };

  // Notification settings configuration for rendering
  const notificationCategories = [
    {
      id: "jobOpportunities",
      title: "Job Opportunities",
      settings: [
        {
          id: "newJobMatches",
          icon: <Briefcase className="h-5 w-5 text-blue-500" />,
          title: "New Job Matches",
          description: "When new jobs matching your profile are posted",
        },
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
          id: "applicationReviewed",
          icon: <FileText className="h-5 w-5 text-purple-500" />,
          title: "Application Reviewed",
          description: "When an employer reviews your application",
        },
        {
          id: "interviewInvitation",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: "Interview Invitation",
          description: "When you're invited for an interview",
        },
        {
          id: "applicationRejected",
          icon: <CheckCircle className="h-5 w-5 text-red-500" />,
          title: "Application Rejected",
          description: "When your application is not selected",
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
          description: "When you receive messages from employers",
        },
        {
          id: "employerViewedProfile",
          icon: <Building className="h-5 w-5 text-orange-500" />,
          title: "Profile Views",
          description: "When employers view your profile",
        },
      ],
    },
    {
      id: "eventsReminders",
      title: "Events & Reminders",
      settings: [
        {
          id: "upcomingInterviews",
          icon: <Calendar className="h-5 w-5 text-blue-500" />,
          title: "Upcoming Interviews",
          description: "Reminders for scheduled interviews",
        },
        {
          id: "applicationDeadlines",
          icon: <Calendar className="h-5 w-5 text-red-500" />,
          title: "Application Deadlines",
          description: "Reminders for jobs with approaching deadlines",
        },
        {
          id: "careerEvents",
          icon: <Calendar className="h-5 w-5 text-purple-500" />,
          title: "Career Events",
          description: "Updates on career fairs, workshops, and webinars",
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
