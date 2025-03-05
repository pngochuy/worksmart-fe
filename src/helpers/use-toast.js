import { toast } from "react-toastify";
import { Button } from "@/components/ui/button"; // Đảm bảo Button có thể sử dụng

export const showToast = () => {
  const toastId = toast.error(
    <div className="space-y-3">
      <p>Could not save changes.</p>
      <Button
        variant="secondary"
        onClick={() => {
          toast.dismiss(toastId); // Dismiss the current toast
          save(); // Call the save function
        }}
      >
        Retry
      </Button>
    </div>,
    {
      // Options for the toast
      autoClose: false, // Ensures the toast doesn't disappear automatically
      closeOnClick: false, // Ensure user has to click close or retry button
    }
  );
};

const save = () => {
  // Implement save logic
  console.log("Retrying save...");
};
