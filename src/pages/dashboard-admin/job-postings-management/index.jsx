/* eslint-disable react/prop-types */
// Index.jsx - Main component for Job Management
import { useState, useEffect } from "react";
import { JobTable } from "./JobTable";
import { getAllJobs } from "@/services/adminServices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Clock, CheckCircle2, XCircle } from "lucide-react";

export const Index = () => {
  const [jobData, setJobData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0,
    hidden: 0,
    fullTime: 0,
    partTime: 0,
    contract: 0,
    internship: 0,
    remote: 0,
    priority: 0,
    nearDeadline: 0,
  });

  // Calculate if a job is near deadline (within 7 days)
  const isNearDeadline = (deadlineDate) => {
    const now = new Date();
    const deadline = new Date(deadlineDate);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  };

  // Function to calculate stats from job data
  const calculateStats = (data) => {
    if (data && data.length > 0) {
      const total = data.length;
      const active = data.filter((job) => job.status === 3).length;
      const pending = data.filter((job) => job.status === 0).length;
      const rejected = data.filter((job) => job.status === 1).length;
      const hidden = data.filter((job) => job.status === 2).length;
      const priority = data.filter((job) => job.priority).length;

      const fullTime = data.filter(
        (job) => job.workType === "Full-Time"
      ).length;
      const partTime = data.filter(
        (job) => job.workType === "Part-Time"
      ).length;
      const contract = data.filter((job) => job.workType === "Contract").length;
      const internship = data.filter(
        (job) => job.workType === "Internship"
      ).length;
      const remote = data.filter((job) => job.workType === "Remote").length;

      const nearDeadline = data.filter(
        (job) => job.status === 3 && isNearDeadline(job.deadline)
      ).length;

      return {
        total,
        active,
        pending,
        rejected,
        hidden,
        fullTime,
        partTime,
        contract,
        internship,
        remote,
        priority,
        nearDeadline,
      };
    }
    return {
      total: 0,
      active: 0,
      pending: 0,
      rejected: 0,
      hidden: 0,
      fullTime: 0,
      partTime: 0,
      contract: 0,
      internship: 0,
      remote: 0,
      priority: 0,
      nearDeadline: 0,
    };
  };

  // Function to update job data and recalculate stats
  const handleJobStatusUpdate = (jobId, updatedData) => {
    // Check if this is a full refresh from the toolbar
    if (updatedData && updatedData.refreshAll && updatedData.newData) {
      setJobData(updatedData.newData);
      setStats(calculateStats(updatedData.newData));
      return;
    }

    // Otherwise, handle normal status update for a single job
    setJobData((prevData) => {
      const updatedJobData = prevData.map((job) =>
        job.jobID === jobId ? { ...job, status: updatedData } : job
      );

      // Recalculate stats with updated data
      setStats(calculateStats(updatedJobData));

      return updatedJobData;
    });
  };

  // Fetch job data from API
  useEffect(() => {
    const fetchJobData = async () => {
      setIsLoading(true);
      try {
        const response = await getAllJobs();
        console.log("response: ", response);
        setJobData(response);
        setStats(calculateStats(response));
      } catch (err) {
        console.error("Error fetching job data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, []);

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer" style={{ padding: "30px 30px" }}>
        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="tabs-box">
                <div className="widget-title mb-4">
                  {/* Heading and Stats Cards container with less spacing */}
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold mb-4">
                      Job Postings Management
                    </h2>

                    {/* Stats Cards in single row with horizontal scrolling */}
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                      <StatsCard
                        title="Total Jobs"
                        value={stats.total}
                        icon={
                          <Briefcase className="h-7 w-7 text-muted-foreground" />
                        }
                      />
                      <StatsCard
                        title="Active Jobs"
                        value={stats.active}
                        icon={
                          <CheckCircle2 className="h-7 w-7 text-green-500" />
                        }
                      />
                      <StatsCard
                        title="Pending Jobs"
                        value={stats.pending}
                        icon={<Clock className="h-7 w-7 text-yellow-500" />}
                        highlight={stats.pending > 0}
                      />
                      <StatsCard
                        title="Rejected Jobs"
                        value={stats.rejected}
                        icon={<XCircle className="h-7 w-7 text-red-500" />}
                      />
                    </div>
                  </div>

                  {/* Job Table Tabs */}
                  <Tabs defaultValue="all" className="w-full mt-6">
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All Jobs</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="pending">
                        Pending
                        {stats.pending > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-yellow-500 rounded-full">
                            {stats.pending}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="near-deadline">
                        Near Deadline
                        {stats.nearDeadline > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full">
                            {stats.nearDeadline}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="work-types">Work Types</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                      <JobTable
                        data={jobData}
                        isLoading={isLoading}
                        onStatusChange={handleJobStatusUpdate}
                      />
                    </TabsContent>

                    <TabsContent value="active">
                      <JobTable
                        data={jobData.filter((job) => job.status === 3)}
                        isLoading={isLoading}
                        onStatusChange={handleJobStatusUpdate}
                      />
                    </TabsContent>

                    <TabsContent value="pending">
                      <JobTable
                        data={jobData.filter((job) => job.status === 0)}
                        isLoading={isLoading}
                        onStatusChange={handleJobStatusUpdate}
                      />
                    </TabsContent>

                    <TabsContent value="priority">
                      <JobTable
                        data={jobData.filter((job) => job.priority)}
                        isLoading={isLoading}
                        onStatusChange={handleJobStatusUpdate}
                      />
                    </TabsContent>

                    <TabsContent value="near-deadline">
                      <JobTable
                        data={jobData.filter(
                          (job) =>
                            job.status === 3 && isNearDeadline(job.deadline)
                        )}
                        isLoading={isLoading}
                        onStatusChange={handleJobStatusUpdate}
                      />
                    </TabsContent>

                    <TabsContent value="work-types">
                      <Tabs defaultValue="full-time" className="w-full mt-4">
                        <TabsList className="mb-4">
                          <TabsTrigger value="full-time">Full-Time</TabsTrigger>
                          <TabsTrigger value="part-time">Part-Time</TabsTrigger>
                          <TabsTrigger value="contract">Contract</TabsTrigger>
                          <TabsTrigger value="internship">
                            Internship
                          </TabsTrigger>
                          <TabsTrigger value="remote">Remote</TabsTrigger>
                        </TabsList>

                        <TabsContent value="full-time">
                          <JobTable
                            data={jobData.filter(
                              (job) => job.workType === "Full-Time"
                            )}
                            isLoading={isLoading}
                            onStatusChange={handleJobStatusUpdate}
                          />
                        </TabsContent>

                        <TabsContent value="part-time">
                          <JobTable
                            data={jobData.filter(
                              (job) => job.workType === "Part-Time"
                            )}
                            isLoading={isLoading}
                            onStatusChange={handleJobStatusUpdate}
                          />
                        </TabsContent>

                        <TabsContent value="contract">
                          <JobTable
                            data={jobData.filter(
                              (job) => job.workType === "Contract"
                            )}
                            isLoading={isLoading}
                            onStatusChange={handleJobStatusUpdate}
                          />
                        </TabsContent>

                        <TabsContent value="internship">
                          <JobTable
                            data={jobData.filter(
                              (job) => job.workType === "Internship"
                            )}
                            isLoading={isLoading}
                            onStatusChange={handleJobStatusUpdate}
                          />
                        </TabsContent>

                        <TabsContent value="remote">
                          <JobTable
                            data={jobData.filter(
                              (job) => job.workType === "Remote"
                            )}
                            isLoading={isLoading}
                            onStatusChange={handleJobStatusUpdate}
                          />
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Rectangular Stats Card Component
const StatsCard = ({ title, value, icon, highlight = false }) => {
  return (
    <Card
      className={`flex-none w-60 ${
        highlight && value > 0 ? "border-yellow-500 border-2" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default Index;
