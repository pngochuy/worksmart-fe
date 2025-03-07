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
import { NavLink } from "react-router-dom";
import { deleteCV } from "@/services/cvServices";
// import { deleteResume } from "./actions";

export const ResumeItem = ({
  resume,
  onDelete,
  isFeatured,
  onSetAsFeatured,
}) => {
  const contentRef = useRef(null);

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: resume?.title || "CV",
  });

  const wasUpdated =
    resume?.updatedAt !== resume?.createdAt && resume?.title != undefined;

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
        <NavLink
          to={`/candidate/my-cv/edit?cvId=${resume?.cvid}`}
          className="inline-block w-full text-center"
        >
          <p className="line-clamp-1 font-semibold">
            {resume?.title || "No title"}
          </p>
          {/* {resume?.description && ( */}
          <p className="line-clamp-2 text-sm">
            {resume?.description || "No description"}
          </p>
          {/* )} */}
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">
              {wasUpdated ? "Updated" : "Created"}
            </span>{" "}
            on {formatDate(resume?.updatedAt, "MMM d, yyyy h:mm a")}
          </p>
        </NavLink>
        <NavLink
          to={`/candidate/my-cv/edit?cvId=${resume?.cvid}`}
          className="relative inline-block w-full"
        >
          <ResumePreview
            // resumeData={resume}
            resumeData={mapToResumeValues(resume)} // trả về giá trị phải đúng tên trường trong mapToResumeValues
            contentRef={contentRef}
            className="overflow-hidden shadow-sm transition-shadow group-hover:shadow-lg"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </NavLink>
      </div>
      <MoreMenu
        cvId={resume?.cvid}
        onPrintClick={reactToPrintFn}
        onSetAsFeatured={onSetAsFeatured}
        isFeatured={isFeatured} // Truyền trạng thái là Featured vào Menu
        onDelete={onDelete}
      />
    </div>
  );
};

function MoreMenu({
  cvId,
  onPrintClick,
  onSetAsFeatured,
  isFeatured,
  onDelete,
}) {
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
              onSetAsFeatured(cvId); // Trigger the feature action
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
        cvId={cvId}
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        onDelete={onDelete}
      />
    </>
  );
}

function DeleteConfirmationDialog({ cvId, open, onOpenChange, onDelete }) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    startTransition(async () => {
      try {
        console.log("cvId: ", cvId);
        // Gửi yêu cầu API để xóa CV
        await deleteCV(cvId);
        onDelete(cvId); // Gọi hàm xóa CV ở ngoài
        onOpenChange(false);
        toast.success("CV deleted successfully");
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
          <DialogTitle>Delete CV?</DialogTitle>
          <DialogDescription>
            This will permanently delete this CV. This action cannot be undone.
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
