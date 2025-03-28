import { useEffect, useState } from "react";
import axios from "axios";
import {
  fetchNotificationTags,
  deleteNotificationTagByCategory,
  deleteNotificationTagByCategoryAndEmail,
  deleteNotificationTagByCategoryAndEmailAndTag, // Add this import
  GetTagByUserEmail,
  addNotificationTag,
} from "@/services/notificationJobTagServices";
import { fetchTagsByCategory } from "@/services/tagServices";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trash2,
  PlusCircle,
  Search,
  FolderPlus,
  AlertCircle,
  Mail,
  Plus,
  ArrowLeft,
  Check,
  Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Select from "react-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom Category Dropdown for the notification dialog
const NotificationCategoryDropdown = ({
  selectedCategory,
  setSelectedCategory,
  categories,
}) => {
  const categoryOptions = categories.map((category) => ({
    value: category.category,
    label: category.category,
  }));

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: "100%",
    }),
    control: (provided) => ({
      ...provided,
      minHeight: "40px",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      border: "1px solid #e0e0e0",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    }),
  };

  return (
    <Select
      placeholder="Select Category"
      styles={customStyles}
      options={categoryOptions}
      onChange={(selected) => setSelectedCategory(selected)}
      value={selectedCategory}
      isSearchable
      className="mb-4"
    />
  );
};

// Custom Tag Dropdown for the notification dialog
const NotificationTagDropdown = ({
  selectedCategory,
  selectedTags,
  setSelectedTags,
  existingTagIds = [],
}) => {
  const [tagOptions, setTagOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      if (selectedCategory) {
        setIsLoading(true);
        try {
          const data = await fetchTagsByCategory(selectedCategory.value);
          const options = data.map((tag) => ({
            value: tag.tagID,
            label: tag.tagName,
            isDisabled: existingTagIds.includes(tag.tagID),
          }));
          setTagOptions(options);
        } catch (error) {
          console.error("Error fetching tags:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setTagOptions([]);
      }
    };

    fetchTags();
  }, [selectedCategory, existingTagIds]);

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: "100%",
    }),
    control: (provided) => ({
      ...provided,
      minHeight: "40px",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      border: "1px solid #e0e0e0",
    }),
    valueContainer: (provided) => ({
      ...provided,
      display: "flex",
      flexWrap: "wrap",
      overflowX: "auto",
      overflowY: "auto",
      maxHeight: "100px",
      scrollbarWidth: "thin",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#f0f0f0",
      borderRadius: "6px",
      padding: "4px 6px",
      margin: "2px 4px 2px 0",
      alignItems: "center",
      border: "1px solid #e0e0e0",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      fontSize: "12px",
      maxWidth: "200px",
      whiteSpace: "nowrap",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      cursor: "pointer",
      marginLeft: "4px",
      borderRadius: "4px",
      ":hover": {
        backgroundColor: "#ff4d4d",
        color: "white",
      },
    }),
    option: (provided, { isDisabled }) => ({
      ...provided,
      cursor: isDisabled ? "not-allowed" : "default",
      opacity: isDisabled ? 0.5 : 1,
      backgroundColor: isDisabled ? "#f9f9f9" : provided.backgroundColor,
    }),
  };

  return (
    <Select
      options={tagOptions}
      styles={customStyles}
      value={selectedTags}
      onChange={(selected) => setSelectedTags(selected || [])}
      placeholder={
        isLoading
          ? "Loading tags..."
          : !selectedCategory
          ? "Select a category first"
          : "Select Tags"
      }
      isMulti
      isSearchable
      isDisabled={!selectedCategory || isLoading}
      noOptionsMessage={() =>
        !selectedCategory
          ? "Please select a category first"
          : existingTagIds.length === tagOptions.length
          ? "All tags in this category are already assigned to this email"
          : "No tags available"
      }
    />
  );
};

const CategoryTagsManager = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // State for confirmation dialogs
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  // State for notification
  const [notification, setNotification] = useState(null);
  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userId = user?.userID || null;

  // New state for multi-step add tag dialog
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [existingTagIds, setExistingTagIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all-categories");

  // Fetch notification categories and tags from API
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchNotificationTags(userId);
        setCategories(data || []);
      } catch (err) {
        console.error("Error fetching notification tags:", err);
        setError("Failed to load notification categories and tags");
        showNotification("Failed to load notification categories", "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchCategoriesAndTags();
    }
  }, [userId]);

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handle tag deletion
  const handleDeleteTag = (categoryIndex, emailIndex, tagId) => {
    setItemToDelete({ categoryIndex, emailIndex, tagId });
    setDeleteType("tag");
  };

  // Confirm tag deletion
  const confirmDeleteTag = async () => {
    if (!itemToDelete) return;

    const { categoryIndex, emailIndex, tagId } = itemToDelete;
    const category = categories[categoryIndex];
    const email = category.emailTags[emailIndex].email;
    const categoryId = category.id || category.category; // Use appropriate ID based on your data structure

    setIsLoading(true);
    try {
      // Call the API to delete the tag
      await deleteNotificationTagByCategoryAndEmailAndTag(
        userId,
        categoryId,
        email,
        tagId
      );

      // Update local state after successful API call
      setCategories((prevCategories) => {
        const newCategories = [...prevCategories];
        const emailTags = [...newCategories[categoryIndex].emailTags];
        const tags = emailTags[emailIndex].tags.filter(
          (tag) => tag.tagID !== tagId
        );

        emailTags[emailIndex] = {
          ...emailTags[emailIndex],
          tags,
        };

        // If no tags left, consider handling empty tags case
        newCategories[categoryIndex] = {
          ...newCategories[categoryIndex],
          emailTags,
        };

        return newCategories;
      });

      showNotification("Tag deleted successfully");
    } catch (err) {
      console.error("Error deleting tag:", err);
      showNotification(
        `Failed to delete tag: ${err.message || "Unknown error"}`,
        "error"
      );
    } finally {
      setIsLoading(false);
      setItemToDelete(null);
    }
  };

  // Handle email deletion
  const handleDeleteEmail = (categoryIndex, emailIndex) => {
    const category = categories[categoryIndex];
    const email = category.emailTags[emailIndex].email;
    const categoryId = category.id || category.category; // Use category name if id doesn't exist
    setItemToDelete({
      categoryIndex,
      emailIndex,
      categoryId,
      email,
    });
    setDeleteType("email");
  };

  // Confirm email deletion
  const confirmDeleteEmail = async () => {
    if (!itemToDelete) return;

    const { categoryIndex, emailIndex, categoryId, email } = itemToDelete;

    setIsLoading(true);
    try {
      await deleteNotificationTagByCategoryAndEmail(userId, categoryId, email);

      // Update local state after successful API call
      setCategories((prevCategories) => {
        const newCategories = [...prevCategories];
        const emailTags = newCategories[categoryIndex].emailTags.filter(
          (_, idx) => idx !== emailIndex
        );

        newCategories[categoryIndex] = {
          ...newCategories[categoryIndex],
          emailTags,
        };

        return newCategories;
      });

      showNotification("Email deleted successfully");
    } catch (err) {
      console.error("Error deleting email:", err);
      showNotification(
        `Failed to delete email: ${err.message || "Unknown error"}`,
        "error"
      );
    } finally {
      setIsLoading(false);
      setItemToDelete(null);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = (categoryIndex) => {
    const category = categories[categoryIndex];
    const categoryId = category.id || category.category; // Use category name if id doesn't exist
    setItemToDelete({ categoryIndex, categoryId });
    setDeleteType("category");
  };

  // Confirm category deletion
  const confirmDeleteCategory = async () => {
    if (!itemToDelete) return;

    const { categoryIndex, categoryId } = itemToDelete;

    setIsLoading(true);
    try {
      console.log("Deleting category with ID:", categoryId); // Add logging
      await deleteNotificationTagByCategory(userId, categoryId);

      // Update local state after successful API call
      setCategories((prevCategories) =>
        prevCategories.filter((_, idx) => idx !== categoryIndex)
      );

      showNotification("Category deleted successfully");
    } catch (err) {
      console.error("Error deleting category:", err);
      showNotification(
        `Failed to delete category: ${err.message || "Unknown error"}`,
        "error"
      );
    } finally {
      setIsLoading(false);
      setItemToDelete(null);
    }
  };

  // Handle add tag dialog open
  const handleOpenAddTagDialog = () => {
    setIsAddingTag(true);
    setCurrentStep(1);
    setNewEmail("");
    setEmailError("");
    setSelectedCategory(null);
    setSelectedTags([]);
    setExistingTagIds([]);
  };

  // Validate and proceed to next step
  const handleProceedToStep2 = async () => {
    // Email validation
    if (!newEmail.trim()) {
      setEmailError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch existing tag IDs for this email
      const existingTagsData = await GetTagByUserEmail(userId, newEmail.trim());
      setExistingTagIds(existingTagsData || []);

      // If all successful, proceed to next step
      setCurrentStep(2);
    } catch (err) {
      console.error("Error checking existing tags:", err);
      showNotification("Failed to check existing tags", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back to email step
  const handleBackToEmailStep = () => {
    setCurrentStep(1);
  };

  // Handle save tags
  const handleSaveTags = async () => {
    if (!newEmail || selectedTags.length === 0) {
      showNotification("Please select at least one tag", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Format data for API
      const tagIds = selectedTags.map((tag) => tag.value);

      await addNotificationTag(userId, tagIds, newEmail.trim());

      // Refresh categories after adding
      const updatedData = await fetchNotificationTags(userId);
      setCategories(updatedData || []);

      setIsAddingTag(false);
      showNotification("Tags added successfully");
    } catch (err) {
      console.error("Error adding tags:", err);
      showNotification(
        `Failed to add tags: ${err.message || "Unknown error"}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) => {
    if (!searchTerm) return true;

    const matchesCategory = category.category
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const hasMatchingEmails = category.emailTags.some(
      (emailTag) =>
        emailTag.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emailTag.tags.some((tag) =>
          tag.tagName.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return matchesCategory || hasMatchingEmails;
  });

  // Get filtered emails for a category
  const getFilteredEmails = (emailTags) => {
    if (!searchTerm) return emailTags;
    return emailTags.filter(
      (emailTag) =>
        emailTag.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emailTag.tags.some((tag) =>
          tag.tagName.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  };

  // Get filtered tags for an email
  const getFilteredTags = (tags) => {
    if (!searchTerm) return tags;
    return tags.filter((tag) =>
      tag.tagName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Calculate total tags count
  const totalTags = categories.reduce(
    (acc, category) =>
      acc +
      category.emailTags.reduce(
        (emailAcc, emailTag) => emailAcc + emailTag.tags.length,
        0
      ),
    0
  );

  return (
    <Card className="mx-auto shadow-md">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && !notification && (
        <div className="absolute top-4 right-4 z-50 max-w-md">
          <Alert className="bg-red-50 border-red-300">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="absolute top-4 right-4 z-50 max-w-md">
          <Alert
            className={
              notification.type === "error"
                ? "bg-red-50 border-red-300"
                : "bg-green-50 border-green-300"
            }
          >
            <AlertCircle
              className={
                notification.type === "error"
                  ? "h-4 w-4 text-red-500"
                  : "h-4 w-4 text-green-500"
              }
            />
            <AlertDescription
              className={
                notification.type === "error"
                  ? "text-red-700"
                  : "text-green-700"
              }
            >
              {notification.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Delete Confirmation Dialogs */}
      <AlertDialog
        open={itemToDelete !== null && deleteType === "tag"}
        onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this tag.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTag}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={itemToDelete !== null && deleteType === "email"}
        onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete &&
                categories[itemToDelete.categoryIndex]?.emailTags[
                  itemToDelete.emailIndex
                ] && (
                  <>
                    This will permanently delete the email &quot;
                    {
                      categories[itemToDelete.categoryIndex].emailTags[
                        itemToDelete.emailIndex
                      ].email
                    }
                    &quot; and all of its{" "}
                    {
                      categories[itemToDelete.categoryIndex].emailTags[
                        itemToDelete.emailIndex
                      ].tags.length
                    }{" "}
                    tags.
                  </>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEmail}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={itemToDelete !== null && deleteType === "category"}
        onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete && categories[itemToDelete.categoryIndex] && (
                <>
                  This will permanently delete the category &quot;
                  {categories[itemToDelete.categoryIndex].category}
                  &quot; and all of its{" "}
                  {categories[itemToDelete.categoryIndex].emailTags.length}{" "}
                  emails and associated tags.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Add Tag Dialog */}
      <Dialog
        open={isAddingTag}
        onOpenChange={(open) => !open && setIsAddingTag(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentStep === 1
                ? "Add Notification Email"
                : "Subscribe to Job Tags"}
            </DialogTitle>
            <DialogDescription>
              {currentStep === 1
                ? "Enter an email address to receive job notifications"
                : "Select job categories and tags you're interested in"}
            </DialogDescription>
          </DialogHeader>

          {currentStep === 1 ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="notification-email">Email Address</Label>
                <Input
                  id="notification-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setEmailError("");
                  }}
                  className="w-full"
                />
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="notification-email"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email: {newEmail}</span>
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-select">Select Category</Label>
                <NotificationCategoryDropdown
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  categories={categories}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags-select">Select Tags</Label>
                <NotificationTagDropdown
                  selectedCategory={selectedCategory}
                  selectedTags={selectedTags}
                  setSelectedTags={setSelectedTags}
                  existingTagIds={existingTagIds}
                />
                {existingTagIds.length > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Note: Tags you've already subscribed to for this email are
                    disabled.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            {currentStep === 1 ? (
              <>
                <Button variant="outline" onClick={() => setIsAddingTag(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProceedToStep2} disabled={isLoading}>
                  Next
                  {isLoading && (
                    <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleBackToEmailStep}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleSaveTags}
                  disabled={
                    !selectedCategory ||
                    selectedTags.length === 0 ||
                    isSubmitting
                  }
                  className="flex items-center gap-1"
                >
                  {isSubmitting ? (
                    <>
                      Saving...
                      <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Tags
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CardHeader className="border-b pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <CardTitle className="text-xl font-bold">
              Manage Job Notification Subscriptions for Tags You're Interested
              In
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Manage notification categories, emails and associated tags
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              className="gap-1"
              onClick={handleOpenAddTagDialog}
            >
              <Tag className="h-4 w-4" />
              <span>Add Tag Subscription</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="p-6">
        {/* Search input stays outside the Tabs component */}
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search categories, emails or tags..."
            className="pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ textIndent: "20px" }}
          />
        </div>

        {/* Wrap everything in Tabs component */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="all-categories" className="text-sm">
              All Categories <Badge className="ml-2">{categories.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="all-tags" className="text-sm">
              All Tags <Badge className="ml-2">{totalTags}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Loading and empty states */}
          {isLoading && categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="mx-auto h-12 w-12 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin mb-4"></div>
              <h3 className="text-lg font-medium mb-2">
                Loading categories...
              </h3>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No Tag Subscriptions Yet
              </h3>
              <p className="mb-4">
                Add tag subscriptions to receive job notifications by email.
              </p>
              <Button onClick={handleOpenAddTagDialog}>
                <Tag className="h-4 w-4 mr-2" />
                Add Tag Subscription
              </Button>
            </div>
          ) : (
            /* Move both TabsContent components inside the Tabs component */
            <>
              <TabsContent value="all-categories" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCategories.map((category, categoryIndex) => (
                    <Card
                      key={categoryIndex}
                      className="overflow-hidden shadow-sm"
                    >
                      <CardHeader className="p-4 pb-2 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-medium">
                            {category.category}
                          </CardTitle>
                          <div className="flex items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                                    onClick={() =>
                                      handleDeleteCategory(categoryIndex)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">
                                      Delete category
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete category</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        {getFilteredEmails(category.emailTags).length > 0 ? (
                          getFilteredEmails(category.emailTags).map(
                            (emailTag, emailIndex) => (
                              <div key={emailIndex} className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <Mail className="h-3.5 w-3.5 text-gray-500" />
                                    <span>{emailTag.email}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteEmail(
                                          categoryIndex,
                                          emailIndex
                                        )
                                      }
                                      className="h-6 px-2 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      <span className="sr-only">
                                        Delete Email
                                      </span>
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1 pl-5">
                                  {getFilteredTags(emailTag.tags).length > 0 ? (
                                    getFilteredTags(emailTag.tags).map(
                                      (tag) => (
                                        <div
                                          key={tag.tagID}
                                          className="group flex items-center bg-gray-100 text-gray-800 text-xs rounded pl-3 pr-2 py-1 max-w-fit hover:bg-gray-200 transition-colors"
                                        >
                                          <span className="mr-1">
                                            {tag.tagName}
                                          </span>
                                          <button
                                            onClick={() =>
                                              handleDeleteTag(
                                                categoryIndex,
                                                emailIndex,
                                                tag.tagID
                                              )
                                            }
                                            className="text-gray-500 hover:text-red-500 transition-colors ml-1"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                            <span className="sr-only">
                                              Remove tag
                                            </span>
                                          </button>
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <div className="text-xs text-gray-500">
                                      {searchTerm
                                        ? "No matching tags found"
                                        : "No tags found"}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="flex justify-between items-center mt-3">
                            <div className="text-sm text-gray-500">
                              No emails added yet
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleOpenAddTagDialog}
                              className="h-7 px-2 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <PlusCircle className="h-3 w-3" />
                              Add Email
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="all-tags" className="mt-0">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-medium mb-4">
                    All Tag Subscriptions
                  </h3>
                  <div className="space-y-6">
                    {filteredCategories.map((category) => (
                      <div key={category.category} className="space-y-4">
                        <h4 className="text-md font-medium border-b pb-2">
                          {category.category}
                        </h4>
                        <div className="pl-4 space-y-4">
                          {getFilteredEmails(category.emailTags).map(
                            (emailTag, i) => (
                              <div key={i} className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  {emailTag.email}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1 pl-5">
                                  {getFilteredTags(emailTag.tags).length > 0 ? (
                                    getFilteredTags(emailTag.tags).map(
                                      (tag) => (
                                        <div
                                          key={tag.tagID}
                                          className="group flex items-center bg-gray-100 text-gray-800 text-xs rounded pl-3 pr-2 py-1 max-w-fit hover:bg-gray-200 transition-colors"
                                        >
                                          <span className="mr-1">
                                            {tag.tagName}
                                          </span>
                                          <button
                                            onClick={() =>
                                              handleDeleteTag(
                                                filteredCategories.indexOf(
                                                  category
                                                ),
                                                category.emailTags.indexOf(
                                                  emailTag
                                                ),
                                                tag.tagID
                                              )
                                            }
                                            className="text-gray-500 hover:text-red-500 transition-colors ml-1"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                            <span className="sr-only">
                                              Remove tag
                                            </span>
                                          </button>
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <div className="text-xs text-gray-500">
                                      {searchTerm
                                        ? "No matching tags found"
                                        : "No tags found"}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </Card>
  );
};

export default CategoryTagsManager;
