import { useState, useEffect } from "react";
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
  Edit,
  Tag,
  FolderPlus,
  X,
  Save,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Sample data - replace with your actual data
const initialCategories = [
  {
    id: "1",
    name: "Technology",
    tags: [
      { id: "101", name: "JavaScript" },
      { id: "102", name: "Python" },
      { id: "103", name: "React" },
      { id: "104", name: "Node.js" },
      { id: "105", name: "Data Science" },
    ],
  },
  {
    id: "2",
    name: "Marketing",
    tags: [
      { id: "201", name: "Digital Marketing" },
      { id: "202", name: "Social Media" },
      { id: "203", name: "SEO" },
      { id: "204", name: "Content Strategy" },
    ],
  },
  {
    id: "3",
    name: "Design",
    tags: [
      { id: "301", name: "UI/UX" },
      { id: "302", name: "Graphic Design" },
      { id: "303", name: "Branding" },
    ],
  },
  {
    id: "4",
    name: "Finance",
    tags: [
      { id: "401", name: "Accounting" },
      { id: "402", name: "Investment" },
      { id: "403", name: "Banking" },
      { id: "404", name: "Financial Analysis" },
    ],
  },
];

// Utility function to generate unique IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const CategoryTagsManager = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("all-categories");

  // State for adding new category
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryNameError, setCategoryNameError] = useState("");

  // State for editing category
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // State for adding/editing tag
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tagNameError, setTagNameError] = useState("");
  const [editTagId, setEditTagId] = useState(null);
  const [tagCategoryId, setTagCategoryId] = useState(null);

  // State for confirmation dialogs
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'category' or 'tag'

  // State for notification
  const [notification, setNotification] = useState(null);

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handle tag deletion
  const handleDeleteTag = (categoryId, tagId) => {
    setItemToDelete({ categoryId, tagId });
    setDeleteType("tag");
  };

  // Confirm tag deletion
  const confirmDeleteTag = () => {
    if (!itemToDelete) return;

    const { categoryId, tagId } = itemToDelete;

    setCategories((prevCategories) =>
      prevCategories.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            tags: category.tags.filter((tag) => tag.id !== tagId),
          };
        }
        return category;
      })
    );

    showNotification("Tag deleted successfully");
    setItemToDelete(null);
  };

  // Handle category deletion
  const handleDeleteCategory = (categoryId) => {
    setItemToDelete({ categoryId });
    setDeleteType("category");
  };

  // Confirm category deletion
  const confirmDeleteCategory = () => {
    if (!itemToDelete) return;

    const { categoryId } = itemToDelete;

    setCategories((prevCategories) =>
      prevCategories.filter((category) => category.id !== categoryId)
    );

    if (selectedCategory?.id === categoryId) {
      setSelectedCategory(null);
    }

    showNotification("Category deleted successfully");
    setItemToDelete(null);
  };

  // Handle category selection
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setActiveTab("selected-category");
  };

  // Handle adding new category
  const handleAddCategory = () => {
    // Validate
    if (!newCategoryName.trim()) {
      setCategoryNameError("Category name is required");
      return;
    }

    // Check if category name already exists
    if (
      categories.some(
        (cat) => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      )
    ) {
      setCategoryNameError("A category with this name already exists");
      return;
    }

    const newCategory = {
      id: generateId(),
      name: newCategoryName.trim(),
      tags: [],
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName("");
    setIsAddingCategory(false);
    setCategoryNameError("");
    showNotification("Category added successfully");
  };

  // Start editing category
  const handleEditCategoryStart = (category) => {
    setEditCategoryId(category.id);
    setEditCategoryName(category.name);
  };

  // Save edited category
  const handleEditCategorySave = () => {
    // Validate
    if (!editCategoryName.trim()) {
      setCategoryNameError("Category name is required");
      return;
    }

    // Check for duplicate but allow the same name for the same category
    const isDuplicate = categories.some(
      (cat) =>
        cat.id !== editCategoryId &&
        cat.name.toLowerCase() === editCategoryName.trim().toLowerCase()
    );

    if (isDuplicate) {
      setCategoryNameError("A category with this name already exists");
      return;
    }

    setCategories(
      categories.map((cat) =>
        cat.id === editCategoryId
          ? { ...cat, name: editCategoryName.trim() }
          : cat
      )
    );

    // Update selectedCategory if it's the one being edited
    if (selectedCategory?.id === editCategoryId) {
      setSelectedCategory((prev) => ({
        ...prev,
        name: editCategoryName.trim(),
      }));
    }

    setEditCategoryId(null);
    setEditCategoryName("");
    setCategoryNameError("");
    showNotification("Category updated successfully");
  };

  // Cancel editing category
  const handleEditCategoryCancel = () => {
    setEditCategoryId(null);
    setEditCategoryName("");
    setCategoryNameError("");
  };

  // Start adding tag
  const handleAddTagStart = (categoryId) => {
    setIsAddingTag(true);
    setNewTagName("");
    setTagNameError("");
    setTagCategoryId(categoryId);
    setEditTagId(null);
  };

  // Start editing tag
  const handleEditTagStart = (categoryId, tag) => {
    setIsAddingTag(true);
    setNewTagName(tag.name);
    setTagCategoryId(categoryId);
    setEditTagId(tag.id);
    setTagNameError("");
  };

  // Save tag (add new or update existing)
  const handleSaveTag = () => {
    // Validate
    if (!newTagName.trim()) {
      setTagNameError("Tag name is required");
      return;
    }

    const targetCategory = categories.find((cat) => cat.id === tagCategoryId);
    if (!targetCategory) return;

    // Check for duplicate but allow the same name for the same tag
    const isDuplicate = targetCategory.tags.some(
      (tag) =>
        (editTagId ? tag.id !== editTagId : true) &&
        tag.name.toLowerCase() === newTagName.trim().toLowerCase()
    );

    if (isDuplicate) {
      setTagNameError("A tag with this name already exists in this category");
      return;
    }

    if (editTagId) {
      // Update existing tag
      setCategories(
        categories.map((cat) =>
          cat.id === tagCategoryId
            ? {
                ...cat,
                tags: cat.tags.map((tag) =>
                  tag.id === editTagId
                    ? { ...tag, name: newTagName.trim() }
                    : tag
                ),
              }
            : cat
        )
      );

      // Update selectedCategory if necessary
      if (selectedCategory?.id === tagCategoryId) {
        setSelectedCategory((prev) => ({
          ...prev,
          tags: prev.tags.map((tag) =>
            tag.id === editTagId ? { ...tag, name: newTagName.trim() } : tag
          ),
        }));
      }

      showNotification("Tag updated successfully");
    } else {
      // Add new tag
      const newTag = {
        id: generateId(),
        name: newTagName.trim(),
      };

      setCategories(
        categories.map((cat) =>
          cat.id === tagCategoryId
            ? { ...cat, tags: [...cat.tags, newTag] }
            : cat
        )
      );

      // Update selectedCategory if necessary
      if (selectedCategory?.id === tagCategoryId) {
        setSelectedCategory((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }

      showNotification("Tag added successfully");
    }

    setIsAddingTag(false);
    setNewTagName("");
    setTagCategoryId(null);
    setEditTagId(null);
    setTagNameError("");
  };

  // Cancel adding/editing tag
  const handleCancelTag = () => {
    setIsAddingTag(false);
    setNewTagName("");
    setTagCategoryId(null);
    setEditTagId(null);
    setTagNameError("");
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) => {
    if (!searchTerm) return true;

    const matchesCategory = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const hasTags = category.tags.some((tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesCategory || hasTags;
  });

  // Filter tags based on search term
  const getFilteredTags = (tags) => {
    if (!searchTerm) return tags;
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Calculate total tags count
  const totalTags = categories.reduce(
    (acc, category) => acc + category.tags.length,
    0
  );

  // Set initial selected category if none is selected
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    } else if (categories.length === 0) {
      setSelectedCategory(null);
    } else if (
      selectedCategory &&
      !categories.find((c) => c.id === selectedCategory.id)
    ) {
      // If the selected category was deleted, select the first available
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  // Update selectedCategory when categories change
  useEffect(() => {
    if (selectedCategory) {
      const updatedCategory = categories.find(
        (c) => c.id === selectedCategory.id
      );
      if (
        updatedCategory &&
        JSON.stringify(updatedCategory) !== JSON.stringify(selectedCategory)
      ) {
        setSelectedCategory(updatedCategory);
      }
    }
  }, [categories, selectedCategory]);

  return (
    <Card className=" mx-auto shadow-md">
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
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
        open={itemToDelete !== null && deleteType === "category"}
        onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete &&
              categories.find((c) => c.id === itemToDelete.categoryId) ? (
                <>
                  This will permanently delete the category &quot;
                  {
                    categories.find((c) => c.id === itemToDelete.categoryId)
                      .name
                  }
                  &quot; and all of its{" "}
                  {
                    categories.find((c) => c.id === itemToDelete.categoryId)
                      .tags.length
                  }{" "}
                  tags.
                </>
              ) : (
                "This will permanently delete this category and all of its tags."
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

      <CardHeader className="border-b pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <CardTitle className="text-xl font-bold">
              Categories & Tags
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Manage job categories and associated tags
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <FolderPlus className="h-4 w-4" />
                  <span>New Category</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new category to organize your tags.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-category-name">Category Name</Label>
                    <Input
                      id="new-category-name"
                      placeholder="Enter category name"
                      value={newCategoryName}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value);
                        setCategoryNameError("");
                      }}
                    />
                    {categoryNameError && (
                      <p className="text-sm text-red-500">
                        {categoryNameError}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewCategoryName("");
                        setCategoryNameError("");
                      }}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button onClick={handleAddCategory}>Add Category</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddingTag} onOpenChange={setIsAddingTag}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="default"
                  className="gap-1"
                  onClick={() => {
                    if (selectedCategory) {
                      handleAddTagStart(selectedCategory.id);
                    } else if (categories.length > 0) {
                      handleAddTagStart(categories[0].id);
                    } else {
                      showNotification(
                        "Please create a category first",
                        "error"
                      );
                      return;
                    }
                  }}
                >
                  <Tag className="h-4 w-4" />
                  <span>Add Tag</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editTagId ? "Edit Tag" : "Add New Tag"}
                  </DialogTitle>
                  <DialogDescription>
                    {editTagId
                      ? "Update the tag name."
                      : "Create a new tag for the selected category."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-tag-name">Tag Name</Label>
                    <Input
                      id="new-tag-name"
                      placeholder="Enter tag name"
                      value={newTagName}
                      onChange={(e) => {
                        setNewTagName(e.target.value);
                        setTagNameError("");
                      }}
                    />
                    {tagNameError && (
                      <p className="text-sm text-red-500">{tagNameError}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCancelTag}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTag}>
                    {editTagId ? "Save Changes" : "Add Tag"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-7">
        {/* Left Panel - Categories List */}
        <div className="lg:col-span-2 border-r">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search categories or tags..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
              <span>All Categories</span>
              <Badge variant="default" className="text-xs font-normal">
                {categories.length}
              </Badge>
            </div>
            <ScrollArea className="h-[calc(100vh-280px)] min-h-[300px]">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {categories.length === 0
                    ? "No categories added yet. Create your first category!"
                    : "No categories found matching your search"}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCategories.map((category) => {
                    const filteredTags = getFilteredTags(category.tags);
                    const isEditing = editCategoryId === category.id;

                    return (
                      <div key={category.id} className="group">
                        <div
                          className={`flex items-center justify-between rounded-md px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                            selectedCategory?.id === category.id && !isEditing
                              ? "bg-blue-50 text-blue-700"
                              : ""
                          } ${isEditing ? "bg-gray-100" : ""}`}
                          onClick={() =>
                            !isEditing && handleSelectCategory(category)
                          }
                        >
                          {isEditing ? (
                            <div className="flex-1 flex items-center gap-2">
                              <Input
                                value={editCategoryName}
                                onChange={(e) => {
                                  setEditCategoryName(e.target.value);
                                  setCategoryNameError("");
                                }}
                                placeholder="Category name"
                                className="h-8 text-sm"
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                              {categoryNameError && (
                                <div className="absolute mt-9 text-xs text-red-500 bg-white border p-1 rounded shadow-sm">
                                  {categoryNameError}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {category.name}
                              </span>
                              <Badge
                                variant={
                                  selectedCategory?.id === category.id
                                    ? "default"
                                    : "outline"
                                }
                                className="text-xs"
                              >
                                {category.tags.length}
                              </Badge>
                            </div>
                          )}

                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditCategorySave();
                                      }}
                                      className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                      <Save className="h-4 w-4" />
                                      <span className="sr-only">Save</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Save changes</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditCategoryCancel();
                                      }}
                                      className="h-7 w-7 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                      <span className="sr-only">Cancel</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Cancel</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditCategoryStart(category);
                                      }}
                                      className="h-7 w-7 p-0 text-gray-500 hover:text-blue-500 hover:bg-transparent"
                                    >
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">
                                        Edit category
                                      </span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit category</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCategory(category.id);
                                      }}
                                      className="h-7 w-7 p-0 text-gray-500 hover:text-red-500 hover:bg-transparent"
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
                          )}
                        </div>

                        {/* Show matching tags if search is active */}
                        {searchTerm &&
                          filteredTags.length > 0 &&
                          !isEditing && (
                            <div className="ml-4 mt-1 mb-2">
                              <div className="flex flex-wrap gap-1">
                                {filteredTags.map((tag) => (
                                  <Badge
                                    key={tag.id}
                                    variant="outline"
                                    className="text-xs font-normal bg-gray-50"
                                  >
                                    {tag.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Right Panel - Category Details and Tags */}
        <div className="lg:col-span-5">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b">
              <div className="px-4">
                <TabsList className="h-11 mt-1">
                  <TabsTrigger value="all-categories" className="text-sm">
                    All Tags
                    <Badge className="ml-2 text-xs" variant="default">
                      {totalTags}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="selected-category"
                    className="text-sm"
                    disabled={!selectedCategory}
                  >
                    {selectedCategory ? selectedCategory.name : "Category"} Tags
                    <Badge className="ml-2 text-xs" variant="default">
                      {selectedCategory ? selectedCategory.tags.length : 0}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="all-categories" className="p-0 m-0">
              <div className="p-6">
                {categories.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FolderPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No Categories Yet
                    </h3>
                    <p className="mb-4">
                      Start by creating your first category to organize your
                      tags.
                    </p>
                    <Button onClick={() => setIsAddingCategory(true)}>
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Create Category
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCategories.map((category) => (
                      <Card
                        key={category.id}
                        className="overflow-hidden shadow-sm"
                      >
                        <CardHeader className="p-4 pb-2 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">
                              {category.name}
                            </CardTitle>
                            <div className="flex items-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-gray-500 hover:text-blue-500"
                                      onClick={() =>
                                        handleSelectCategory(category)
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">
                                        Manage tags
                                      </span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Manage tags</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                                      onClick={() =>
                                        handleDeleteCategory(category.id)
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
                          <div className="flex flex-wrap gap-2 mt-2">
                            {getFilteredTags(category.tags).length > 0 ? (
                              getFilteredTags(category.tags).map((tag) => (
                                <div
                                  key={tag.id}
                                  className="group flex items-center bg-gray-100 text-gray-800 text-xs rounded pl-3 pr-2 py-1 max-w-fit hover:bg-gray-200 transition-colors"
                                >
                                  <span className="mr-1">{tag.name}</span>
                                  <button
                                    onClick={() =>
                                      handleDeleteTag(category.id, tag.id)
                                    }
                                    className="text-gray-500 hover:text-red-500 transition-colors ml-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span className="sr-only">Remove tag</span>
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-500 py-1">
                                {searchTerm
                                  ? "No matching tags found"
                                  : "No tags added yet"}
                              </div>
                            )}

                            {!searchTerm && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleAddTagStart(category.id);
                                }}
                                className="rounded h-7 px-2 text-xs gap-1 text-blue-600 border border-dashed border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <PlusCircle className="h-3 w-3" />
                                Add Tag
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="selected-category" className="p-0 m-0">
              {selectedCategory && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {selectedCategory.name}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage tags for this category
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-gray-700"
                        onClick={() =>
                          handleEditCategoryStart(selectedCategory)
                        }
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit Category</span>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleAddTagStart(selectedCategory.id)}
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>Add Tag</span>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                      {getFilteredTags(selectedCategory.tags).length > 0 ? (
                        getFilteredTags(selectedCategory.tags).map((tag) => (
                          <div
                            key={tag.id}
                            className="group flex items-center bg-white border text-gray-800 text-sm rounded-lg pl-4 pr-2 py-2 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                          >
                            <span className="mr-2">{tag.name}</span>
                            <div className="flex items-center gap-1 ml-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-blue-500 hover:bg-transparent"
                                onClick={() =>
                                  handleEditTagStart(selectedCategory.id, tag)
                                }
                              >
                                <Edit className="h-3 w-3" />
                                <span className="sr-only">Edit tag</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteTag(selectedCategory.id, tag.id)
                                }
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-transparent"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span className="sr-only">Remove tag</span>
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="w-full text-center py-8 text-gray-500">
                          {searchTerm
                            ? "No matching tags found"
                            : "No tags added to this category yet"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-medium text-sm text-gray-700 mb-2">
                      Recent Activity
                    </h3>
                    <div className="text-sm text-gray-500 border rounded-md p-4 bg-gray-50">
                      No recent activity for this category
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Card>
  );
};

export default CategoryTagsManager;
