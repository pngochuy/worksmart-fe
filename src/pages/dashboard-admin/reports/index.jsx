/* eslint-disable react/prop-types */
// ReportPostIndex.jsx - Main component for Report Post Management
import { useState, useEffect } from "react";
import { getAllReportPosts } from "@/services/adminServices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, Clock, CheckCircle, XCircle } from "lucide-react";
import { ReportPostTable } from "./ReportPostTable";

export const Index = () => {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    rejected: 0,
  });

  // Function to calculate stats from report data
  const calculateStats = (data) => {
    if (data && data.length > 0) {
      const total = data.length;
      const pending = data.filter(
        (report) => report.reportStatus === "Pending"
      ).length;
      const completed = data.filter(
        (report) => report.reportStatus === "Completed"
      ).length;
      const rejected = data.filter(
        (report) => report.reportStatus === "Rejected"
      ).length;

      return {
        total,
        pending,
        completed,
        rejected,
      };
    }
    return {
      total: 0,
      pending: 0,
      completed: 0,
      rejected: 0,
    };
  };

  // Function to update report data and recalculate stats
  const handleReportDataUpdate = (reportId, updatedData) => {
    // Check if this is a full refresh from the toolbar
    if (updatedData && updatedData.refreshAll && updatedData.newData) {
      setReportData(updatedData.newData);
      setStats(calculateStats(updatedData.newData));
      return;
    }

    // Otherwise, handle normal status update for a single report
    setReportData((prevData) => {
      const updatedReportData = prevData.map((report) =>
        report.reportPostID === reportId
          ? { ...report, ...updatedData }
          : report
      );

      // Recalculate stats with updated data
      setStats(calculateStats(updatedReportData));

      return updatedReportData;
    });
  };

  // Fetch report data from API
  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const response = await getAllReportPosts();
        console.log("Report data:", response);
        setReportData(response);
        setStats(calculateStats(response));
      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, []);

  return (
    <section className="report-dashboard">
      <div className="dashboard-outer" style={{ padding: "30px 30px" }}>
        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="tabs-box">
                <div className=" mb-4" style={{ padding: "20px 30px 30px" }}>
                  <h2 className="text-3xl font-bold mb-4">Report Management</h2>
                  {/* Stats Cards */}
                  <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4 mb-6">
                    <StatsCard
                      title="Total Reports"
                      value={stats.total}
                      icon={
                        <FileWarning className="h-6 w-6 text-muted-foreground" />
                      }
                    />
                    <StatsCard
                      title="Pending"
                      value={stats.pending}
                      icon={<Clock className="h-6 w-6 text-yellow-500" />}
                      highlight={stats.pending > 0}
                    />
                    <StatsCard
                      title="Completed"
                      value={stats.completed}
                      icon={<CheckCircle className="h-6 w-6 text-green-500" />}
                    />
                    <StatsCard
                      title="Rejected"
                      value={stats.rejected}
                      icon={<XCircle className="h-6 w-6 text-red-500" />}
                    />
                  </div>

                  {/* Report Table Tabs */}
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All Reports</TabsTrigger>
                      <TabsTrigger value="pending">
                        Pending
                        {stats.pending > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-yellow-500 rounded-full">
                            {stats.pending}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                      <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                      <ReportPostTable
                        data={reportData}
                        isLoading={isLoading}
                        onStatusChange={handleReportDataUpdate}
                      />
                    </TabsContent>

                    <TabsContent value="pending">
                      <ReportPostTable
                        data={reportData.filter(
                          (report) => report.reportStatus === "Pending"
                        )}
                        isLoading={isLoading}
                        onStatusChange={handleReportDataUpdate}
                      />
                    </TabsContent>

                    <TabsContent value="completed">
                      <ReportPostTable
                        data={reportData.filter(
                          (report) => report.reportStatus === "Completed"
                        )}
                        isLoading={isLoading}
                        onStatusChange={handleReportDataUpdate}
                      />
                    </TabsContent>

                    <TabsContent value="rejected">
                      <ReportPostTable
                        data={reportData.filter(
                          (report) => report.reportStatus === "Rejected"
                        )}
                        isLoading={isLoading}
                        onStatusChange={handleReportDataUpdate}
                      />
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

// Stats Card Component
const StatsCard = ({ title, value, icon, highlight = false }) => {
  return (
    <Card
      className={highlight && value > 0 ? "border-yellow-500 border-2" : ""}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};
