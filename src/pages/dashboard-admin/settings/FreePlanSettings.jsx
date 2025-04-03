import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Save,
  RefreshCw,
  Clock,
  User,
  Briefcase,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchFreePlanSettings,
  updateEmployerFreePlan,
  updateCandidateFreePlan,
} from "@/services/adminServices";

export const FreePlanSettings = () => {
  const [settings, setSettings] = useState({
    employerFreePlan: {
      maxJobsPerDay: 1,
      defaultFeaturedJob: 0,
      updatedAt: "",
    },
    candidateFreePlan: {
      maxCVsPerDay: 1,
      updatedAt: "",
    },
  });
  const [isSavingEmployer, setIsSavingEmployer] = useState(false);
  const [isSavingCandidate, setIsSavingCandidate] = useState(false);
  const [activeTab, setActiveTab] = useState("employer");

  // Load from backend when component mounts
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await fetchFreePlanSettings();
      setSettings({
        employerFreePlan: {
          maxJobsPerDay: data.employerFreePlan.maxJobsPerDay,
          defaultFeaturedJob: data.employerFreePlan.defaultFeaturedJob,
          updatedAt: data.employerFreePlan.updatedAt,
        },
        candidateFreePlan: {
          maxCVsPerDay: data.candidateFreePlan.maxCVsPerDay,
          updatedAt: data.candidateFreePlan.updatedAt,
        },
      });
    } catch (err) {
      console.error("Error loading free plan settings:", err);
      toast.error("Failed to load free plan settings");
    }
  };

  const handleEmployerChange = (field, value) => {
    setSettings({
      ...settings,
      employerFreePlan: {
        ...settings.employerFreePlan,
        [field]: value,
      },
    });
  };

  const handleCandidateChange = (field, value) => {
    setSettings({
      ...settings,
      candidateFreePlan: {
        ...settings.candidateFreePlan,
        [field]: value,
      },
    });
  };

  const saveEmployerSettings = async () => {
    setIsSavingEmployer(true);
    try {
      const response = await updateEmployerFreePlan({
        maxJobsPerDay: parseInt(settings.employerFreePlan.maxJobsPerDay),
        defaultFeaturedJob: parseInt(
          settings.employerFreePlan.defaultFeaturedJob
        ),
      });

      setSettings({
        ...settings,
        employerFreePlan: {
          ...settings.employerFreePlan,
          updatedAt: response.updatedAt,
        },
      });

      toast.success("Employer free plan settings updated successfully");
    } catch (err) {
      console.error("Error updating employer settings:", err);
      toast.error("Failed to update employer settings");
    } finally {
      setIsSavingEmployer(false);
    }
  };

  const saveCandidateSettings = async () => {
    setIsSavingCandidate(true);
    try {
      const response = await updateCandidateFreePlan({
        maxCVsPerDay: parseInt(settings.candidateFreePlan.maxCVsPerDay),
      });

      setSettings({
        ...settings,
        candidateFreePlan: {
          ...settings.candidateFreePlan,
          updatedAt: response.updatedAt,
        },
      });

      toast.success("Candidate free plan settings updated successfully");
    } catch (err) {
      console.error("Error updating candidate settings:", err);
      toast.error("Failed to update candidate settings");
    } finally {
      setIsSavingCandidate(false);
    }
  };

  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer" style={{ padding: "30px 30px" }}>
          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title mb-4">
                    <div className="space-y-3">
                      <h2 className="text-3xl font-bold mb-4">
                        Free Plan Settings
                      </h2>

                      <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                      >
                        <TabsList className="mb-4">
                          <TabsTrigger
                            value="employer"
                            className="flex items-center"
                          >
                            <Briefcase className="mr-2 h-4 w-4" />
                            Employer Settings
                          </TabsTrigger>
                          <TabsTrigger
                            value="candidate"
                            className="flex items-center"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Candidate Settings
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="employer">
                          <Card className="shadow-md">
                            <CardHeader className="bg-slate-50">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center">
                                  <Settings className="mr-2 h-5 w-5" />
                                  Employer Job Creation Limits
                                </CardTitle>
                                {settings.employerFreePlan.updatedAt && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="mr-1 h-3 w-3" />
                                    Last updated:{" "}
                                    {settings.employerFreePlan.updatedAt}
                                  </div>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="space-y-4">
                                <div>
                                  <label
                                    htmlFor="maxJobsPerDay"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Maximum Jobs Per Day
                                  </label>
                                  <div className="flex items-center">
                                    <Input
                                      id="maxJobsPerDay"
                                      type="number"
                                      min="1"
                                      max="100"
                                      value={
                                        settings.employerFreePlan.maxJobsPerDay
                                      }
                                      onChange={(e) =>
                                        handleEmployerChange(
                                          "maxJobsPerDay",
                                          e.target.value
                                        )
                                      }
                                      disabled={isSavingEmployer}
                                      className="w-24 mr-2"
                                    />
                                    <span className="text-sm text-gray-500">
                                      jobs per employer
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">
                                    Set the maximum number of job postings an
                                    employer can create in a single day
                                  </p>
                                </div>

                                <div>
                                  <label
                                    htmlFor="defaultFeaturedJob"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Default Featured Jobs
                                  </label>
                                  <div className="flex items-center">
                                    <Input
                                      id="defaultFeaturedJob"
                                      type="number"
                                      min="0"
                                      max="10"
                                      value={
                                        settings.employerFreePlan
                                          .defaultFeaturedJob
                                      }
                                      onChange={(e) =>
                                        handleEmployerChange(
                                          "defaultFeaturedJob",
                                          e.target.value
                                        )
                                      }
                                      disabled={isSavingEmployer}
                                      className="w-24 mr-2"
                                    />
                                    <span className="text-sm text-gray-500">
                                      featured jobs
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">
                                    Set the number of featured job slots free
                                    employers get by default
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t bg-slate-50 py-3">
                              <Button
                                onClick={saveEmployerSettings}
                                disabled={isSavingEmployer}
                                className="flex items-center"
                              >
                                {isSavingEmployer ? (
                                  <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Employer Settings
                                  </>
                                )}
                              </Button>
                            </CardFooter>
                          </Card>
                        </TabsContent>

                        <TabsContent value="candidate">
                          <Card className="shadow-md">
                            <CardHeader className="bg-slate-50">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center">
                                  <Settings className="mr-2 h-5 w-5" />
                                  Candidate CV Creation Limits
                                </CardTitle>
                                {settings.candidateFreePlan.updatedAt && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="mr-1 h-3 w-3" />
                                    Last updated:{" "}
                                    {settings.candidateFreePlan.updatedAt}
                                  </div>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="space-y-4">
                                <div>
                                  <label
                                    htmlFor="maxCVsPerDay"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Maximum CVs Per Day
                                  </label>
                                  <div className="flex items-center">
                                    <Input
                                      id="maxCVsPerDay"
                                      type="number"
                                      min="1"
                                      max="100"
                                      value={
                                        settings.candidateFreePlan.maxCVsPerDay
                                      }
                                      onChange={(e) =>
                                        handleCandidateChange(
                                          "maxCVsPerDay",
                                          e.target.value
                                        )
                                      }
                                      disabled={isSavingCandidate}
                                      className="w-24 mr-2"
                                    />
                                    <span className="text-sm text-gray-500">
                                      CVs per candidate
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">
                                    Set the maximum number of CVs a candidate
                                    can create in a single day
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t bg-slate-50 py-3">
                              <Button
                                onClick={saveCandidateSettings}
                                disabled={isSavingCandidate}
                                className="flex items-center"
                              >
                                {isSavingCandidate ? (
                                  <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Candidate Settings
                                  </>
                                )}
                              </Button>
                            </CardFooter>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
