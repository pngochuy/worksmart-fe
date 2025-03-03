/* eslint-disable react/prop-types */
import LoadingButton from "@/components/LoadingButton";
import { ResumePreview } from "@/components/ResumePreview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";
import { mapToResumeValues } from "@/lib/utils";
import { formatDate } from "date-fns";
import { MoreVertical, Printer, Star, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { useReactToPrint } from "react-to-print";
// import { deleteResume } from "./actions";

export const ResumeItem = ({ resume }) => {
  const contentRef = useRef(null);
  const [isFeatured, setIsFeatured] = useState(false); // Trạng thái lưu trữ CV có phải là "featured" hay không

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: resume?.title || "Resume",
  });

  const wasUpdated = resume?.updatedAt !== resume?.createdAt;

  // Hàm xử lý khi "Set as Featured"
  async function handleSetAsFeatured(resumeId) {
    try {
      console.log("resumeId: ", resumeId);
      // Đảo ngược trạng thái featured
      setIsFeatured((prevState) => !prevState);
      // Gửi yêu cầu API để cập nhật CV này là "featured"
      // await axios.post("/api/feature-resume", { resumeId });
      toast.success(
        isFeatured
          ? "Resume removed from featured"
          : "Resume set as featured successfully."
      );
    } catch (error) {
      console.log("error: ", error);
      toast.error("Failed to set resume as featured.");
    }
  }

  return (
    <div
      className={`group relative rounded-lg border border-transparent p-3 transition-colors hover:border-border ${
        isFeatured
          ? "bg-yellow-100 border-yellow-500"
          : "bg-white-100 border-white-500"
      }`} // Thêm màu nền và viền khi là featured
      style={{ backgroundColor: isFeatured ? "#fff3b0" : "#f7f7f7" }} // Cập nhật màu nền nếu là CV featured
    >
      <div className="space-y-3">
        <a
          href={`/demo-edit-cv?resumeId=${resume?.id}`}
          className="inline-block w-full text-center"
        >
          <p className="line-clamp-1 font-semibold">
            {resume?.title || "No title"}
          </p>
          {resume?.description && (
            <p className="line-clamp-2 text-sm">{resume?.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {/* {wasUpdated ? "Updated" : "Created"} on{" "} */}
            {/* {formatDate(resume?.updatedAt, "MMM d, yyyy h:mm a")} */}
            MMM d, yyyy h:mm a
          </p>
        </a>
        <a
          href={`/demo-edit-cv?resumeId=${resume?.id}`}
          className="relative inline-block w-full"
        >
          <ResumePreview
            // resumeData={resume}
            resumeData={mapToResumeValues(resume)} // trả về giá trị phải đúng tên trường trong mapToResumeValues
            contentRef={contentRef}
            className="overflow-hidden shadow-sm transition-shadow group-hover:shadow-lg"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </a>
      </div>
      <MoreMenu
        resumeId={resume?.id}
        onPrintClick={reactToPrintFn}
        onSetAsFeatured={handleSetAsFeatured}
        isFeatured={isFeatured} // Truyền trạng thái là Featured vào Menu
      />
    </div>
  );
};

function MoreMenu({ resumeId, onPrintClick, onSetAsFeatured, isFeatured }) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0.5 top-0.5 transition-all group-hover:bg-slate-200"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => {
              onSetAsFeatured(resumeId); // Trigger the feature action
            }}
          >
            <Star className="size-4" />
            {isFeatured ? "Featured" : "Set as Featured"}
            {/* Hiển thị trạng thái Featured */}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={onPrintClick}
          >
            <Printer className="size-4" />
            Print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteConfirmationDialog
        resumeId={resumeId}
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      />
    </>
  );
}

function DeleteConfirmationDialog({ resumeId, open, onOpenChange }) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    startTransition(async () => {
      try {
        // await deleteResume(resumeId);
        onOpenChange(false);
      } catch (error) {
        console.error(error);
        toast("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete resume?</DialogTitle>
          <DialogDescription>
            This will permanently delete this resume. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <LoadingButton
            variant="destructive"
            onClick={handleDelete}
            loading={isPending}
          >
            Delete
          </LoadingButton>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
