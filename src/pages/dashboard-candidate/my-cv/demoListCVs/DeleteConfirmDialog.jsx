/* eslint-disable react/prop-types */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";

const DeleteConfirmDialog = ({
  isOpen,
  setIsOpen,
  onConfirmDelete,
  isDeleting,
  cvName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirm Deletion
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium">&quot;{cvName}&quot;</span>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3">
          <p className="text-sm text-gray-600">
            Once deleted, you will not be able to recover this CV and all
            information associated with it will be permanently removed.
          </p>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="destructive"
            onClick={onConfirmDelete}
            loading={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete CV
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
