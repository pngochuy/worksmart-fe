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
import { Settings, Save, RefreshCw, Clock } from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchJobLimitSettings,
  updateJobLimitSettings,
} from "@/services/jobServices";

export const JobLimitSettings = () => {
  const [maxJobsPerDay, setMaxJobsPerDay] = useState(1);
  const [updatedAt, setUpdatedAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load từ backend khi component mount
  useEffect(() => {
    const loadJobLimitSettings = async () => {
      try {
        const settings = await fetchJobLimitSettings(); // Gọi API để lấy dữ liệu từ backend
        setMaxJobsPerDay(settings.maxJobsPerDay); // Cập nhật state với giá trị từ backend

        // Set the updatedAt timestamp if available
        if (settings.updatedAt) {
          setUpdatedAt(settings.updatedAt);
        }
      } catch (err) {
        console.error("Error loading job limit settings:", err);
        toast.error("Failed to load job limit settings");
      }
    };

    loadJobLimitSettings();
  }, []); // Chỉ gọi API khi component mount lần đầu

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const parsedValue = parseInt(maxJobsPerDay);
      // Don't include UpdatedAt here - let the backend handle it
      const updatedSettings = { maxJobsPerDay: parsedValue };

      // Call API to update
      const response = await updateJobLimitSettings(updatedSettings);

      // Update local state with returned data (which includes the new timestamp)
      if (response) {
        if (response.maxJobsPerDay) {
          setMaxJobsPerDay(response.maxJobsPerDay);
        }
        if (response.updatedAt) {
          setUpdatedAt(response.updatedAt);
        }
      }

      toast.success("Job limit settings updated successfully");
    } catch (err) {
      console.error("Error updating job limit settings:", err);
      toast.error("Failed to update job limit settings");
    } finally {
      setIsSaving(false);
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
                    {/* Heading and Stats Cards container with less spacing */}
                    <div className="space-y-3">
                      <h2 className="text-3xl font-bold mb-4">Settings</h2>

                      <div className="flex space-x-4 overflow-x-auto pb-2">
                        <Card className="shadow-md">
                          <CardHeader className="bg-slate-50">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg flex items-center">
                                <Settings className="mr-2 h-5 w-5" />
                                Employer Job Creation Limits
                              </CardTitle>
                              {updatedAt && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Last updated: {updatedAt}
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
                                    value={maxJobsPerDay}
                                    onChange={(e) =>
                                      setMaxJobsPerDay(e.target.value)
                                    }
                                    disabled={isSaving}
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
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end border-t bg-slate-50 py-3">
                            <Button
                              onClick={handleSave}
                              disabled={isSaving}
                              className="flex items-center"
                            >
                              {isSaving ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Save Settings
                                </>
                              )}
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
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
