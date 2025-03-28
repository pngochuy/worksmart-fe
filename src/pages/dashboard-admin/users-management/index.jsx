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
} from "lucide-react";

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

                  {/* User Table Tabs */}
                  <Tabs defaultValue="all" className="w-full">
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
