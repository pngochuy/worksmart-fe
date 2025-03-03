/* eslint-disable react/prop-types */
import LoadingButton from "@/components/LoadingButton";
import { useState } from "react";
import { generateSummary } from "./action";
import { toast } from "react-toastify";
import { WandSparklesIcon } from "lucide-react";

export default function GenerateSummaryButton({
  resumeData,
  onSummaryGenerated,
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);
      const aiResponse = await generateSummary(resumeData);
      onSummaryGenerated(aiResponse);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoadingButton
      variant="outline"
      type="button"
      onClick={handleClick}
      loading={loading}
    >
      <WandSparklesIcon className="size-4" />
      Generate (AI)
    </LoadingButton>
  );
}
