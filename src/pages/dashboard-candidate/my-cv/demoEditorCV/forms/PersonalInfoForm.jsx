/* eslint-disable react/prop-types */
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { personalInfoSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { uploadImagesProfile } from "@/services/candidateServices";

export const PersonalInfoForm = ({ resumeData, setResumeData }) => {
  const form = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: resumeData?.firstName || "",
      lastName: resumeData?.lastName || "",
      jobTitle: resumeData?.jobTitle || "",
      address: resumeData?.address || "",
      phone: resumeData?.phone || "",
      email: resumeData?.email || "",
    },
  });

  useEffect(() => {
    form.reset({
      firstName: resumeData?.firstName || "",
      lastName: resumeData?.lastName || "",
      jobTitle: resumeData?.jobTitle || "",
      address: resumeData?.address || "",
      phone: resumeData?.phone || "",
      email: resumeData?.email || "",
    });
  }, [resumeData, form]);

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;
      setResumeData({ ...resumeData, ...values });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  const photoInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const uploadResponse = await uploadImagesProfile(file);
      const imageUrl = uploadResponse.imageUrl;

      if (!imageUrl) {
        throw new Error("No image URL in response");
      }

      setResumeData((prevData) => ({
        ...prevData,
        photo: imageUrl,
      }));

      if (resumeData.id || resumeData.cvid) {
        const cvId = resumeData.id || resumeData.cvid;
        sessionStorage.setItem("cv_avatar_" + cvId, imageUrl);
      }
    } catch (error) {
      alert("Failed to upload photo: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setResumeData({
      ...resumeData,
      photo: "",
    });

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Personal info</h2>
        <p className="text-sm text-muted-foreground">Tell us about yourself.</p>
      </div>
      <Form {...form}>
        <form className="space-y-3">
          <FormField
            control={form.control}
            name="photo"
            render={({ field: { onChange, value, ...fieldValues } }) => (
              <FormItem>
                <FormLabel>Your photo</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      {...fieldValues}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      ref={photoInputRef}
                    />
                  </FormControl>
                  <Button
                    variant="secondary"
                    className="bg-red-700 hover:bg-red-800 text-white"
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={!resumeData.photo || isUploading}
                  >
                    Remove
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};
