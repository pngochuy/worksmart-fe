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
import { Settings, Save, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";

// Hàm lấy settings từ localStorage hoặc dùng giá trị mặc định
const getStoredSettings = () => {
  try {
    const stored = localStorage.getItem("jobLimitSettings");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error);
  }

  // Giá trị mặc định nếu không có trong localStorage
  return {
    maxJobsPerDay: 5,
    updatedAt: new Date().toISOString(),
  };
};

// Hàm lưu settings vào localStorage
const saveSettingsToStorage = (settings) => {
  try {
    localStorage.setItem(
      "jobLimitSettings",
      JSON.stringify({
        ...settings,
        updatedAt: new Date().toISOString(),
      })
    );
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return false;
  }
};

export const JobLimitSettings = () => {
  const [maxJobsPerDay, setMaxJobsPerDay] = useState(
    () => getStoredSettings().maxJobsPerDay
  );
  const [isSaving, setIsSaving] = useState(false);

  // Load từ localStorage khi component mount
  useEffect(() => {
    const settings = getStoredSettings();
    setMaxJobsPerDay(settings.maxJobsPerDay);
  }, []);

  // Handle save settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const parsedValue = parseInt(maxJobsPerDay);
      const success = saveSettingsToStorage({ maxJobsPerDay: parsedValue });

      if (success) {
        toast.success("Job limit settings updated successfully");
      } else {
        toast.error("Failed to update job limit settings");
      }
    } catch (err) {
      console.log("Error updating job limit settings:", err);
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
                              {/* {isLoading && (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              )} */}
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
