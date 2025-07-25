/* eslint-disable react/prop-types */
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { workExperienceSchema } from "@/lib/validations";
import {
  closestCenter,
  DndContext,
  //   DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import { GenerateWorkExperienceButton } from "./GenerateWorkExperienceButton";
import { toast } from "react-toastify";
import { hasActiveSubscription } from "@/services/subscriptionServices";
// import { GenerateWorkExperienceButton } from "./GenerateWorkExperienceButton";

export const WorkExperienceForm = ({ resumeData, setResumeData }) => {
  const [isPremiumUser, setIsPremiumUser] = useState(null);
  const form = useForm({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      workExperiences: resumeData?.workExperiences || [],
    },
  });
  // useEffect(() => {
  //   // When resumeData changes, reset the form with the new values
  //   form.reset({
  //     workExperiences: resumeData?.workExperiences || [],
  //   });
  // }, [resumeData, form]);

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
      setResumeData({
        ...resumeData,
        workExperiences:
          values.workExperiences?.filter((exp) => exp !== undefined) || [],
      });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "workExperiences",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      move(oldIndex, newIndex);
      return arrayMove(fields, oldIndex, newIndex);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Work experience</h2>
        <p className="text-sm text-muted-foreground">
          Add as many work experiences as you like.
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={fields}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, index) => (
                <WorkExperienceItem
                  id={field.id}
                  key={field.id}
                  index={index}
                  form={form}
                  remove={remove}
                  isPremiumUser={isPremiumUser} // Pass the premium user status to the item
                />
              ))}
            </SortableContext>
          </DndContext>
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={() =>
                append({
                  position: "",
                  companyName: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                })
              }
            >
              Add work experience
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

function WorkExperienceItem({ id, form, index, remove, isPremiumUser }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const { setValue, watch } = useFormContext(); // useContext to access the form data
  const [startDate, setStartDate] = useState(""); // local state to store start date value
  const [endDate, setEndDate] = useState(""); // local state to store end date value

  useEffect(() => {
    // Sync local state with form field values
    const workExpValues = watch(`workExperiences.${index}`);
    setStartDate(workExpValues?.startDate || "");
    setEndDate(workExpValues?.endDate || "");
  }, [watch, index]);

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;

    const currentDate = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format

    if (newStartDate > currentDate) {
      // If start date is greater than today, do not allow change
      return;
    }

    setStartDate(newStartDate);
    // Update form value for startDate
    setValue(`workExperiences.${index}.startDate`, newStartDate);

    // If endDate is before startDate, reset endDate
    if (newStartDate && endDate && new Date(newStartDate) > new Date(endDate)) {
      setEndDate(""); // Reset endDate to prevent invalid date
      setValue(`workExperiences.${index}.endDate`, "");
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    const currentDate = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format

    if (newEndDate > currentDate) {
      // If end date is greater than today, do not allow change
      return;
    }

    // Ensure endDate is not earlier than startDate
    if (startDate && new Date(newEndDate) < new Date(startDate)) {
      toast.error("End date cannot be before Start date");
      return;
    }

    setEndDate(newEndDate);
    // Update form value for endDate
    setValue(`workExperiences.${index}.endDate`, newEndDate);

    // Ensure that End date is not earlier than Start date
    // if (startDate && newEndDate && new Date(newEndDate) < new Date(startDate)) {
    //   setEndDate(startDate); // If invalid, set endDate to startDate
    //   setValue(`workExperiences.${index}.endDate`, startDate);
    //   //   alert("End date cannot be before Start date");
    // }
  };

  return (
    <div
      className={cn(
        "space-y-3 rounded-md border bg-background p-3",
        isDragging && "relative z-50 cursor-grab shadow-xl"
      )}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="flex justify-between gap-2">
        <span className="font-semibold">Work experience {index + 1}</span>
        <GripHorizontal
          className="size-5 cursor-grab text-muted-foreground focus:outline-none"
          {...attributes}
          {...listeners}
        />
      </div>
      {/* Smart fill (AI) button  */}
      {isPremiumUser && (
        <div className="flex justify-center">
          <GenerateWorkExperienceButton
            onWorkExperienceGenerated={(exp) =>
              form.setValue(`workExperiences.${index}`, exp)
            }
          />
        </div>
      )}
      <FormField
        control={form.control}
        name={`workExperiences.${index}.position`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Title</FormLabel>
            <FormControl>
              <Input {...field} autoFocus />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`workExperiences.${index}.companyName`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name={`workExperiences.${index}.startDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  //   value={field.value?.slice(0, 10)}
                  value={startDate} // Bind to local state
                  onChange={handleStartDateChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`workExperiences.${index}.endDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  //   value={field.value?.slice(0, 10)}
                  value={endDate} // Bind to local state
                  onChange={handleEndDateChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormDescription>
        Leave <span className="font-semibold">end date</span> empty if you are
        currently working here.
      </FormDescription>
      <FormField
        control={form.control}
        name={`workExperiences.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button variant="destructive" type="button" onClick={() => remove(index)}>
        Remove
      </Button>
    </div>
  );
}
