/* eslint-disable react/prop-types */
// Index.jsx - Main component for User Management
import { useState, useEffect } from "react";
import { UserTable } from "./UserTable";
import { getAllUsers } from "@/services/adminServices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  UserX,
  Briefcase,
  User as UserIcon,
  AlertCircle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { toast } from "react-toastify";

export const Index = () => {
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    banned: 0,
    employers: 0,
    candidates: 0,
    pendingVerifications: 0,
  });
  // State để theo dõi tab hiện tại
  const [activeTab, setActiveTab] = useState("all");

  // Function to calculate stats from user data
  const calculateStats = (data) => {
    if (data && data.length > 0) {
      const total = data.length;
      const active = data.filter((user) => !user.isBanned).length;
      const banned = data.filter((user) => user.isBanned).length;
      const employers = data.filter((user) => user.role === "Employer").length;
      const candidates = data.filter(
        (user) => user.role === "Candidate"
      ).length;

      // Count pending verifications (tax or license) for employers
      const pendingVerifications = data.filter(
        (user) =>
          user.role === "Employer" &&
          (user.taxVerificationStatus === "Pending" ||
            user.licenseVerificationStatus === "Pending")
      ).length;

      return {
        total,
        active,
        banned,
        employers,
        candidates,
        pendingVerifications,
      };
    }
    return {
      total: 0,
      active: 0,
      banned: 0,
      employers: 0,
      candidates: 0,
      pendingVerifications: 0,
    };
  };

  // Function to update user data and recalculate stats
  const handleUserDataUpdate = (userId, updatedData) => {
    // Check if this is a full refresh from the toolbar
    if (updatedData && updatedData.refreshAll && updatedData.newData) {
      setUserData(updatedData.newData);
      setStats(calculateStats(updatedData.newData));
      return;
    }

    // Otherwise, handle normal status update for a single user
    setUserData((prevData) => {
      const updatedUserData = prevData.map((user) =>
        user.userID === userId ? { ...user, ...updatedData } : user
      );

      // Recalculate stats with updated data
      setStats(calculateStats(updatedUserData));

      return updatedUserData;
    });
  };

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await getAllUsers();
        console.log("response: ", response);
        setUserData(response);
        setStats(calculateStats(response));
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Hàm export Excel
  const handleExportExcel = () => {
    try {
      // Lấy dữ liệu người dùng dựa trên tab đang active
      let dataToExport = [];
      let filename = "All_Users";

      switch (activeTab) {
        case "employers":
          dataToExport = userData.filter((user) => user.role === "Employer");
          filename = "Employers";
          break;
        case "candidates":
          dataToExport = userData.filter((user) => user.role === "Candidate");
          filename = "Candidates";
          break;
        case "pending-verification":
          dataToExport = userData.filter(
            (user) =>
              user.role === "Employer" &&
              (user.taxVerificationStatus === "Pending" ||
                user.licenseVerificationStatus === "Pending")
          );
          filename = "Pending_Verifications";
          break;
        default:
          dataToExport = userData;
          filename = "All_Users";
      }

      // Tạo workbook mới
      const wb = XLSX.utils.book_new();

      // Format dữ liệu người dùng cho Excel
      const formattedData = dataToExport.map((user) => ({
        "User ID": user.userID,
        "Full Name": user.fullName || "",
        Email: user.email || "",
        Phone: user.phoneNumber || "",
        Role: user.role || "",
        Status: user.isBanned ? "Banned" : "Active",
        "Verification Level": user.verificationLevel || 0,
        "Tax Verification": user.taxVerificationStatus || "N/A",
        "License Verification": user.licenseVerificationStatus || "N/A",
        "Registered Date": user.createdAt
          ? format(new Date(user.createdAt), "dd/MM/yyyy")
          : "",
      }));

      // Tạo worksheet từ dữ liệu đã format
      const ws = XLSX.utils.json_to_sheet(formattedData);

      // Thiết lập độ rộng cột
      ws["!cols"] = [
        { wch: 10 }, // User ID
        { wch: 25 }, // Full Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 12 }, // Role
        { wch: 10 }, // Status
        { wch: 18 }, // Verification Level
        { wch: 18 }, // Tax Verification
        { wch: 18 }, // License Verification
        { wch: 15 }, // Registered Date
      ];

      // Style cho dòng header
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[address]) continue;

        ws[address].s = {
          fill: { fgColor: { rgb: "4472C4" }, patternType: "solid" },
          font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
          alignment: {
            vertical: "center",
            horizontal: "center",
            wrapText: true,
          },
          border: {
            top: { style: "medium", color: { rgb: "000000" } },
            bottom: { style: "medium", color: { rgb: "000000" } },
            left: { style: "medium", color: { rgb: "000000" } },
            right: { style: "medium", color: { rgb: "000000" } },
          },
        };
      }

      // Style cho các dòng dữ liệu với màu sắc xen kẽ
      for (let R = 1; R <= range.e.r; ++R) {
        const isAlternateRow = R % 2 === 1;
        const rowColor = isAlternateRow ? "F2F2F2" : "FFFFFF";

        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellAddress]) continue;

          ws[cellAddress].s = {
            fill: { fgColor: { rgb: rowColor }, patternType: "solid" },
            alignment: { vertical: "center", wrapText: true },
            border: {
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } },
            },
          };

          // Định dạng đặc biệt cho các ô Status
          if (C === 5) {
            // Status column
            const status = ws[cellAddress].v;
            let fillColor;

            if (status === "Active") {
              fillColor = "92D050"; // Green
            } else if (status === "Banned") {
              fillColor = "FF9999"; // Light red
            }

            if (fillColor) {
              ws[cellAddress].s = {
                ...ws[cellAddress].s,
                fill: { fgColor: { rgb: fillColor }, patternType: "solid" },
                font: { bold: true, color: { rgb: "FFFFFF" } },
                alignment: { vertical: "center", horizontal: "center" },
              };
            }
          }

          // Định dạng đặc biệt cho các ô Verification
          if (C === 7 || C === 8) {
            // Tax & License Verification columns
            const status = ws[cellAddress].v;
            let fillColor;

            if (status === "Approved") {
              fillColor = "92D050"; // Green
            } else if (status === "Pending") {
              fillColor = "FFC000"; // Amber
            } else if (status === "Rejected") {
              fillColor = "FF9999"; // Light red
            }

            if (fillColor) {
              ws[cellAddress].s = {
                ...ws[cellAddress].s,
                fill: { fgColor: { rgb: fillColor }, patternType: "solid" },
                font: { bold: true },
                alignment: { vertical: "center", horizontal: "center" },
              };
            }
          }
        }
      }

      // Thêm autofilter cho toàn bộ dữ liệu
      ws["!autofilter"] = { ref: `A1:J${formattedData.length + 1}` };

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, "Users");

      // Tạo tên file với ngày hiện tại
      const currentDate = format(new Date(), "yyyy-MM-dd");
      const exportFilename = `${filename}_${currentDate}.xlsx`;

      // Xuất file Excel
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, exportFilename);

      // Hiển thị thông báo thành công
      toast.success(
        `Exported ${dataToExport.length} users to Excel successfully`
      );
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export users to Excel. Please try again.");
    }
  };

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer" style={{ padding: "30px 30px" }}>
        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="tabs-box">
                <div className="widget-title mb-4">
                  <h2 className="text-3xl font-bold mb-4">User Management</h2>

                  {/* Stats Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-6">
                    <StatsCard
                      title="Total Users"
                      value={stats.total}
                      icon={<Users className="h-6 w-6 text-muted-foreground" />}
                    />
                    <StatsCard
                      title="Active Users"
                      value={stats.active}
                      icon={<UserCheck className="h-6 w-6 text-green-500" />}
                    />
                    <StatsCard
                      title="Banned Users"
                      value={stats.banned}
                      icon={<UserX className="h-6 w-6 text-red-500" />}
                    />
                    <StatsCard
                      title="Employers"
                      value={stats.employers}
                      icon={<Briefcase className="h-6 w-6 text-blue-500" />}
                    />
                    <StatsCard
                      title="Candidates"
                      value={stats.candidates}
                      icon={<UserIcon className="h-6 w-6 text-purple-500" />}
                    />
                    <StatsCard
                      title="Pending Verifications"
                      value={stats.pendingVerifications}
                      icon={<AlertCircle className="h-6 w-6 text-yellow-500" />}
                      highlight={stats.pendingVerifications > 0}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-6">
                    <Button
                      onClick={handleExportExcel}
                      disabled={isLoading || userData.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Excel
                    </Button>
                  </div>
                  {/* User Table Tabs */}
                  <Tabs
                    defaultValue="all"
                    className="w-full"
                    onValueChange={(value) => setActiveTab(value)}
                  >
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All Users</TabsTrigger>
                      <TabsTrigger value="employers">Employers</TabsTrigger>
                      <TabsTrigger value="candidates">Candidates</TabsTrigger>
                      <TabsTrigger value="pending-verification">
                        Pending Verification
                        {stats.pendingVerifications > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {stats.pendingVerifications}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                      <UserTable
                        data={userData}
                        isLoading={isLoading}
                        onStatusChange={handleUserDataUpdate}
                      />
                    </TabsContent>

                    <TabsContent value="employers">
                      <UserTable
                        data={userData.filter(
                          (user) => user.role === "Employer"
                        )}
                        isLoading={isLoading}
                        onStatusChange={handleUserDataUpdate}
                      />
                    </TabsContent>

                    <TabsContent value="candidates">
                      <UserTable
                        data={userData.filter(
                          (user) => user.role === "Candidate"
                        )}
                        isLoading={isLoading}
                        onStatusChange={handleUserDataUpdate}
                      />
                    </TabsContent>

                    <TabsContent value="pending-verification">
                      <UserTable
                        data={userData.filter(
                          (user) =>
                            user.role === "Employer" &&
                            (user.taxVerificationStatus === "Pending" ||
                              user.licenseVerificationStatus === "Pending")
                        )}
                        isLoading={isLoading}
                        onStatusChange={handleUserDataUpdate}
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

export default Index;
