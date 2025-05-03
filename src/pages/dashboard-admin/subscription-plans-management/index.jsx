import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Save,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Check,
  X,
  FileText,
  Grid,
  List,
  RefreshCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Import service functions
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "@/services/packageServices";

// Define validation schemas
const employerPackageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  durationInDays: z.number().min(1, "Duration must be at least 1 day"),
  jobPostLimitPerDay: z
    .number()
    .min(0, "Job post limit must be a positive number"),
  featuredJobPostLimit: z
    .number()
    .min(0, "Featured job limit must be a positive number"),
  accessToPremiumCandidates: z.boolean().default(false),
});

const candidatePackageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  durationInDays: z.number().min(1, "Duration must be at least 1 day"),
  cvLimit: z.number().min(0, "CV limit must be a positive number"),
  highlightProfile: z.boolean().default(false),
  accessToExclusiveJobs: z.boolean().default(false),
});

export const Index = () => {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("employer");
  const [viewMode, setViewMode] = useState("card");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  // Thêm state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPackageId, setDeletingPackageId] = useState(null);

  // Setup form validation with React Hook Form
  const employerForm = useForm({
    resolver: zodResolver(employerPackageSchema),
    defaultValues: {
      name: "",
      price: 0,
      durationInDays: 7,
      jobPostLimitPerDay: 0,
      featuredJobPostLimit: 0,
      accessToPremiumCandidates: false,
    },
  });

  const candidateForm = useForm({
    resolver: zodResolver(candidatePackageSchema),
    defaultValues: {
      name: "",
      price: 0,
      durationInDays: 7,
      cvLimit: 0,
      highlightProfile: false,
      accessToExclusiveJobs: false,
    },
  });

  // Fetch packages when component mounts
  useEffect(() => {
    fetchPackages();
  }, []);

  // Function to fetch packages from API
  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const data = await getPackages();
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to load packages");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle creating a new package
  const handleCreatePackage = async (data) => {
    try {
      // Prepare package data based on the active tab
      const packageData =
        activeTab === "employer"
          ? {
              name: data.name,
              price: data.price,
              durationInDays: data.durationInDays,
              jobPostLimitPerDay: data.jobPostLimitPerDay,
              featuredJobPostLimit: data.featuredJobPostLimit,
              accessToPremiumCandidates: data.accessToPremiumCandidates,
              cvLimit: null,
              highlightProfile: null,
              accessToExclusiveJobs: null,
            }
          : {
              name: data.name,
              price: data.price,
              durationInDays: data.durationInDays,
              jobPostLimitPerDay: null,
              featuredJobPostLimit: null,
              accessToPremiumCandidates: null,
              cvLimit: data.cvLimit,
              highlightProfile: data.highlightProfile,
              accessToExclusiveJobs: data.accessToExclusiveJobs,
            };

      await createPackage(packageData);
      toast.success("Package created successfully");
      fetchPackages();
      setIsDialogOpen(false);
      resetForms();
    } catch (error) {
      console.error("Error creating package:", error);
      toast.error("Failed to create package");
    }
  };

  // Function to handle updating an existing package
  const handleUpdatePackage = async (data) => {
    try {
      // Add the packageID to the data being sent
      const packageData = {
        packageID: editingPackage.packageID,
        ...data,
      };

      // Add the null fields based on package type
      if (activeTab === "employer") {
        packageData.cvLimit = null;
        packageData.highlightProfile = null;
        packageData.accessToExclusiveJobs = null;
      } else {
        packageData.jobPostLimitPerDay = null;
        packageData.featuredJobPostLimit = null;
        packageData.accessToPremiumCandidates = null;
      }

      await updatePackage(packageData);
      toast.success("Package updated successfully");
      fetchPackages();
      setIsDialogOpen(false);
      setEditingPackage(null);
      resetForms();
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error("Failed to update package");
    }
  };

  // Hàm mở dialog confirm
  const openDeleteDialog = (packageId) => {
    setDeletingPackageId(packageId);
    setIsDeleteDialogOpen(true);
  };

  // Hàm xóa
  const confirmDelete = async () => {
    try {
      await deletePackage(deletingPackageId);
      toast.success("Package deleted successfully");
      fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error("Failed to delete package");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingPackageId(null);
    }
  };

  // Function to open edit dialog with package data
  const openEditDialog = (pkg) => {
    setEditingPackage(pkg);

    // Set the active tab based on the package type
    if (pkg.jobPostLimitPerDay !== null) {
      setActiveTab("employer");
      employerForm.reset({
        name: pkg.name,
        price: pkg.price,
        durationInDays: pkg.durationInDays,
        jobPostLimitPerDay: pkg.jobPostLimitPerDay,
        featuredJobPostLimit: pkg.featuredJobPostLimit,
        accessToPremiumCandidates: pkg.accessToPremiumCandidates,
      });
    } else {
      setActiveTab("candidate");
      candidateForm.reset({
        name: pkg.name,
        price: pkg.price,
        durationInDays: pkg.durationInDays,
        cvLimit: pkg.cvLimit,
        highlightProfile: pkg.highlightProfile,
        accessToExclusiveJobs: pkg.accessToExclusiveJobs,
      });
    }

    setIsDialogOpen(true);
  };

  // Function to open create dialog
  const openCreateDialog = () => {
    setEditingPackage(null);
    resetForms();
    setIsDialogOpen(true);
  };

  // Function to reset form values
  const resetForms = () => {
    employerForm.reset({
      name: "",
      price: 0,
      durationInDays: 7,
      jobPostLimitPerDay: 0,
      featuredJobPostLimit: 0,
      accessToPremiumCandidates: false,
    });

    candidateForm.reset({
      name: "",
      price: 0,
      durationInDays: 7,
      cvLimit: 0,
      highlightProfile: false,
      accessToExclusiveJobs: false,
    });
  };

  // Function to sort packages by price in ascending order
  const sortPackagesByPrice = (packagesToSort) => {
    return [...packagesToSort].sort((a, b) => a.price - b.price);
  };
  // Filter and sort packages by type
  const employerPackages = sortPackagesByPrice(
    packages.filter((pkg) => pkg.jobPostLimitPerDay !== null)
  );
  const candidatePackages = sortPackagesByPrice(
    packages.filter((pkg) => pkg.cvLimit !== null)
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Determine package level for styling
  const getPackageLevel = (pkg) => {
    if (pkg.name.toLowerCase().includes("premium")) return "premium";
    if (pkg.name.toLowerCase().includes("standard")) return "standard";
    return "basic";
  };

  // Get package card styling based on level
  const getPackageCardClass = (level) => {
    switch (level) {
      case "premium":
        return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200";
      case "standard":
        return "bg-gradient-to-br from-green-50 to-green-100 border-green-200";
      default:
        return "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200";
    }
  };

  // Get badge styling based on package level
  const getPackageBadgeClass = (level) => {
    switch (level) {
      case "premium":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "standard":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold flex items-center text-gray-800">
          <Package className="mr-2 h-6 w-6" /> Package Management
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex rounded-md border border-input">
            <Button
              variant="ghost"
              className={`px-3 ${viewMode === "card" ? "bg-slate-100" : ""}`}
              onClick={() => setViewMode("card")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className={`px-3 ${viewMode === "table" ? "bg-slate-100" : ""}`}
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Package
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <Tabs
        defaultValue="employer"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="employer" className="flex items-center">
            <Briefcase className="mr-2 h-4 w-4" /> Employer Packages
          </TabsTrigger>
          <TabsTrigger value="candidate" className="flex items-center">
            <User className="mr-2 h-4 w-4" /> Candidate Packages
          </TabsTrigger>
        </TabsList>

        {/* Employer Packages Tab */}
        <TabsContent value="employer">
          {viewMode === "table" ? (
            <Card>
              <CardHeader className="bg-slate-50">
                <CardTitle>Employer Packages</CardTitle>
                <CardDescription>
                  Manage subscription packages for employers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Job Post Limit</TableHead>
                      <TableHead>Featured Jobs</TableHead>
                      <TableHead>Premium Access</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : employerPackages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No employer packages found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      employerPackages.map((pkg) => (
                        <TableRow key={pkg.packageID}>
                          <TableCell>{pkg.packageID}</TableCell>
                          <TableCell className="font-medium">
                            {pkg.name}
                          </TableCell>
                          <TableCell>{formatCurrency(pkg.price)}</TableCell>
                          <TableCell>{pkg.durationInDays} days</TableCell>
                          <TableCell>
                            {pkg.jobPostLimitPerDay} per day
                          </TableCell>
                          <TableCell>{pkg.featuredJobPostLimit}</TableCell>
                          <TableCell>
                            {pkg.accessToPremiumCandidates ? (
                              <Check className="text-green-500" />
                            ) : (
                              <X className="text-red-500" />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openEditDialog(pkg)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => openDeleteDialog(pkg.packageID)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : employerPackages.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  No employer packages found.
                </div>
              ) : (
                employerPackages.map((pkg) => {
                  const level = getPackageLevel(pkg);
                  return (
                    <Card
                      key={pkg.packageID}
                      className={`border-2 overflow-hidden shadow-md hover:shadow-lg transition-shadow ${getPackageCardClass(
                        level
                      )}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <Badge
                            variant="outline"
                            className={getPackageBadgeClass(level)}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Badge>
                          <div className="space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(pkg)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => openDeleteDialog(pkg.packageID)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-2xl mt-2">
                          {pkg.name}
                        </CardTitle>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">
                            {formatCurrency(pkg.price)}
                          </span>
                          <span className="text-slate-500 ml-2">
                            / {pkg.durationInDays} days
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 mt-4">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                            <span>
                              <strong>{pkg.jobPostLimitPerDay}</strong> job
                              postings per day
                            </span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                            <span>
                              <strong>{pkg.featuredJobPostLimit}</strong>{" "}
                              featured job slots
                            </span>
                          </li>
                          {/* <li className="flex items-start">
                            {pkg.accessToPremiumCandidates ? (
                              <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                            )}
                            <span>Access to premium candidates</span>
                          </li> */}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          variant={level === "premium" ? "default" : "outline"}
                          onClick={() => openEditDialog(pkg)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit Package
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </TabsContent>

        {/* Candidate Packages Tab */}
        <TabsContent value="candidate">
          {viewMode === "table" ? (
            <Card>
              <CardHeader className="bg-slate-50">
                <CardTitle>Candidate Packages</CardTitle>
                <CardDescription>
                  Manage subscription packages for job seekers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>CV Limit</TableHead>
                      <TableHead>Highlight Profile</TableHead>
                      <TableHead>Exclusive Jobs</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : candidatePackages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No candidate packages found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      candidatePackages.map((pkg) => (
                        <TableRow key={pkg.packageID}>
                          <TableCell>{pkg.packageID}</TableCell>
                          <TableCell className="font-medium">
                            {pkg.name}
                          </TableCell>
                          <TableCell>{formatCurrency(pkg.price)}</TableCell>
                          <TableCell>{pkg.durationInDays} days</TableCell>
                          <TableCell>{pkg.cvLimit}</TableCell>
                          <TableCell>
                            {pkg.highlightProfile ? (
                              <Check className="text-green-500" />
                            ) : (
                              <X className="text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {pkg.accessToExclusiveJobs ? (
                              <Check className="text-green-500" />
                            ) : (
                              <X className="text-red-500" />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openEditDialog(pkg)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => openDeleteDialog(pkg.packageID)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : candidatePackages.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  No candidate packages found.
                </div>
              ) : (
                candidatePackages.map((pkg) => {
                  const level = getPackageLevel(pkg);
                  return (
                    <Card
                      key={pkg.packageID}
                      className={`border-2 overflow-hidden shadow-md hover:shadow-lg transition-shadow ${getPackageCardClass(
                        level
                      )}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <Badge
                            variant="outline"
                            className={getPackageBadgeClass(level)}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Badge>
                          <div className="space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(pkg)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => openDeleteDialog(pkg.packageID)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-2xl mt-2">
                          {pkg.name}
                        </CardTitle>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">
                            {formatCurrency(pkg.price)}
                          </span>
                          <span className="text-slate-500 ml-2">
                            / {pkg.durationInDays} days
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 mt-4">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                            <span>
                              Create up to <strong>{pkg.cvLimit}</strong> CVs
                            </span>
                          </li>
                          {/* <li className="flex items-start">
                            {pkg.highlightProfile ? (
                              <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                            )}
                            <span>Highlighted profile in search results</span>
                          </li> */}
                          {/* <li className="flex items-start">
                            {pkg.accessToExclusiveJobs ? (
                              <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                            )}
                            <span>Access to exclusive job listings</span>
                          </li> */}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          variant={level === "premium" ? "default" : "outline"}
                          onClick={() => openEditDialog(pkg)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit Package
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog for creating/editing packages */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Edit Package" : "Create New Package"}
            </DialogTitle>
            <DialogDescription>
              {editingPackage
                ? "Update the package details below."
                : "Fill in the details to create a new package."}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="employer" className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4" /> Employer Package
              </TabsTrigger>
              <TabsTrigger value="candidate" className="flex items-center">
                <User className="mr-2 h-4 w-4" /> Candidate Package
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employer">
              <Form {...employerForm}>
                <form
                  onSubmit={employerForm.handleSubmit(
                    editingPackage ? handleUpdatePackage : handleCreatePackage
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={employerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Employer Premium"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={employerForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (VND)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
                              <Input
                                type="number"
                                placeholder="0"
                                className="pl-8"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={employerForm.control}
                      name="durationInDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (Days)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
                              <Input
                                type="number"
                                placeholder="30"
                                className="pl-8"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={employerForm.control}
                      name="jobPostLimitPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Post Limit Per Day</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={employerForm.control}
                      name="featuredJobPostLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Featured Job Post Limit</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* <FormField
                    control={employerForm.control}
                    name="accessToPremiumCandidates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Access to Premium Candidates
                          </FormLabel>
                          <FormDescription>
                            Allow employers to view and contact premium
                            candidate profiles.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  /> */}

                  <DialogFooter>
                    <Button type="submit" className="mt-4">
                      <Save className="mr-2 h-4 w-4" />
                      {editingPackage ? "Update Package" : "Create Package"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="candidate">
              <Form {...candidateForm}>
                <form
                  onSubmit={candidateForm.handleSubmit(
                    editingPackage ? handleUpdatePackage : handleCreatePackage
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={candidateForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Candidate Premium"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={candidateForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (VND)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
                              <Input
                                type="number"
                                placeholder="0"
                                className="pl-8"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={candidateForm.control}
                      name="durationInDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (Days)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
                              <Input
                                type="number"
                                placeholder="30"
                                className="pl-8"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={candidateForm.control}
                    name="cvLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CV Limit</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileText className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              type="number"
                              placeholder="0"
                              className="pl-8"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Maximum number of CVs a candidate can create with this
                          package.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={candidateForm.control}
                    name="highlightProfile"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Highlight Profile
                          </FormLabel>
                          <FormDescription>
                            Make candidate profiles stand out in search results.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  /> */}

                  {/* <FormField
                    control={candidateForm.control}
                    name="accessToExclusiveJobs"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Access to Exclusive Jobs
                          </FormLabel>
                          <FormDescription>
                            Allow candidates to view and apply to premium job
                            listings.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  /> */}

                  <DialogFooter>
                    <Button type="submit" className="mt-4">
                      <Save className="mr-2 h-4 w-4" />
                      {editingPackage ? "Update Package" : "Create Package"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this package? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
