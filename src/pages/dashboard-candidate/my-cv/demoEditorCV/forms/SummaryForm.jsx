/* eslint-disable react/prop-types */
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import GenerateSummaryButton from "./GenerateSummaryButton";
import { summarySchema } from "@/lib/validations";
import GenerateSummaryButton from "./GenerateSummaryButton";
import { hasActiveSubscription } from "@/services/subscriptionServices";

export const SummaryForm = ({ resumeData, setResumeData }) => {
  const [isPremiumUser, setIsPremiumUser] = useState(null);
  const form = useForm({
    resolver: zodResolver(summarySchema),
    defaultValues: {
      summary: resumeData?.summary || "",
    },
  });
  useEffect(() => {
    const fetchSubscription = async () => {
      const userActiveSubscription = await hasActiveSubscription();
      // Check if user has premium access
      const isPremiumUser =
        userActiveSubscription?.hasActiveSubscription === true &&
        userActiveSubscription?.package?.name?.includes("Premium");
      setIsPremiumUser(isPremiumUser);
    };

    fetchSubscription();
  }, []);

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;
      setResumeData({ ...resumeData, ...values });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Professional summary</h2>
        <p className="text-sm text-muted-foreground">
          Write a short introduction for your cv or let the AI generate one from
          your entered data.
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-3">
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Professional summary</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="A brief, engaging text about yourself"
                  />
                </FormControl>
                <FormMessage />
                {isPremiumUser && (
                  <GenerateSummaryButton
                    resumeData={resumeData}
                    onSummaryGenerated={(summary) =>
                      form.setValue("summary", summary)
                    }
                  />
                )}
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};
