"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactMarkdown from "react-markdown";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Loader2,
} from "lucide-react";
import { clubSchema, ClubFormData } from "@/lib/validations/club";

export default function PageBuilder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState<{
    [key: string]: boolean;
  }>({});
  const [clubId] = useState("bucc");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      clubId: clubId,
      socialLinks: {},
      carouselImages: [],
    },
  });

  const {
    fields: carouselFields,
    append: appendCarousel,
    remove: removeCarousel,
  } = useFieldArray({
    control,
    name: "carouselImages",
  });

  const watchedValues = watch();

  useEffect(() => {
    const loadClubData = async () => {
      try {
        const response = await fetch(`/api/clubs?clubId=${clubId}`);
        const data = await response.json();

        if (data.club) {
          reset(data.club);
        } else {
          const defaultClub = {
            clubId: clubId,
            clubPhoto: "",
            clubLogo: "",
            clubName: "",
            clubMotto: "",
            aboutSection: "",
            youtubeLink: "",
            activitiesSection: "",
            carouselImages: [],
            whyJoinUsSection: "",
            socialLinks: {},
            registrationFormLink: "",
          };
          reset(defaultClub);
        }
      } catch (error) {
        console.error("Error loading club data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClubData();
  }, [clubId, reset]);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.url;
  };

  const handleImageUpload = async (
    file: File,
    fieldName: keyof ClubFormData
  ) => {
    if (!file) return;

    setUploadingImages((prev) => ({ ...prev, [fieldName]: true }));

    try {
      const imageUrl = await uploadToCloudinary(file);
      setValue(fieldName, imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleCarouselImageUpload = async (file: File) => {
    if (!file) return;

    setUploadingImages((prev) => ({ ...prev, carousel: true }));

    try {
      const imageUrl = await uploadToCloudinary(file);
      appendCarousel({ url: imageUrl, id: Date.now().toString() });
    } catch (error) {
      console.error("Error uploading carousel image:", error);
      alert("Failed to upload carousel image");
    } finally {
      setUploadingImages((prev) => ({ ...prev, carousel: false }));
    }
  };

  const onSubmit = async (data: ClubFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/clubs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save club");
      }

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error instanceof Error ? error.message : "Failed to save club");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ImageUploadField = ({
    fieldName,
    label,
    currentValue,
  }: {
    fieldName: keyof ClubFormData;
    label: string;
    currentValue?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        {currentValue ? (
          <div className="space-y-2">
            <img
              src={currentValue}
              alt={label}
              className="mx-auto h-32 w-32 object-cover rounded-lg"
            />
            <p className="text-sm text-green-600">
              Image uploaded successfully
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-600">
              Click to upload {label.toLowerCase()}
            </p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file, fieldName);
          }}
          className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={uploadingImages[fieldName]}
        />
        {uploadingImages[fieldName] && (
          <div className="flex items-center justify-center mt-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-blue-600">Uploading...</span>
          </div>
        )}
      </div>
      {errors[fieldName] && (
        <p className="text-sm text-red-600">{errors[fieldName]?.message}</p>
      )}
    </div>
  );

  const MarkdownField = ({
    fieldName,
    label,
    placeholder,
  }: {
    fieldName: keyof ClubFormData;
    label: string;
    placeholder: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() =>
            setPreviewMode(previewMode === fieldName ? null : fieldName)
          }
          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
        >
          {previewMode === fieldName ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span>
            {previewMode === fieldName ? "Hide Preview" : "Show Preview"}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <textarea
            {...register(fieldName)}
            placeholder={placeholder}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors[fieldName] && (
            <p className="text-sm text-red-600 mt-1">
              {errors[fieldName]?.message}
            </p>
          )}
        </div>

        {previewMode === fieldName && (
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>
                {(watchedValues[fieldName] as string) || ""}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading club data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Page Builder
            </h1>
            <p className="text-gray-600">
              Update your club&apos;s page information
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Hidden Club ID */}
            <input type="hidden" {...register("clubId")} />

            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ImageUploadField
                  fieldName="clubPhoto"
                  label="Club Cover Photo *"
                  currentValue={watchedValues.clubPhoto}
                />

                <ImageUploadField
                  fieldName="clubLogo"
                  label="Club Logo *"
                  currentValue={watchedValues.clubLogo}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Name *
                  </label>
                  <input
                    {...register("clubName")}
                    type="text"
                    placeholder="Enter club name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.clubName && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.clubName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Motto (Optional)
                  </label>
                  <input
                    {...register("clubMotto")}
                    type="text"
                    placeholder="Enter club motto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Content Sections
              </h2>

              <MarkdownField
                fieldName="aboutSection"
                label="About Section *"
                placeholder="Write about your club using Markdown..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Link (Optional)
                </label>
                <input
                  {...register("youtubeLink")}
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.youtubeLink && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.youtubeLink.message}
                  </p>
                )}
              </div>

              <MarkdownField
                fieldName="activitiesSection"
                label="Activities Section *"
                placeholder="Describe your club activities using Markdown..."
              />

              <MarkdownField
                fieldName="whyJoinUsSection"
                label="Why Join Us Section *"
                placeholder="Explain why people should join your club using Markdown..."
              />
            </div>

            {/* Carousel Images */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Carousel Images
              </h2>

              <div className="space-y-4">
                {carouselFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <img
                      src={field.url}
                      alt={`Carousel ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Image {index + 1}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCarousel(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Plus className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Add carousel image
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCarouselImageUpload(file);
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={uploadingImages.carousel}
                  />
                  {uploadingImages.carousel && (
                    <div className="flex items-center justify-center mt-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="ml-2 text-sm text-blue-600">
                        Uploading...
                      </span>
                    </div>
                  )}
                </div>

                {errors.carouselImages && (
                  <p className="text-sm text-red-600">
                    {errors.carouselImages.message}
                  </p>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Social Links (Optional)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "facebook" as const, label: "Facebook" },
                  { key: "twitter" as const, label: "Twitter" },
                  { key: "website" as const, label: "Website" },
                  { key: "youtube" as const, label: "YouTube" },
                  { key: "discord" as const, label: "Discord" },
                  { key: "instagram" as const, label: "Instagram" },
                  { key: "linkedin" as const, label: "LinkedIn" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <input
                      {...register(`socialLinks.${key}`)}
                      type="url"
                      placeholder={`https://${key}.com/...`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Form Link */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Registration
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Form Link *
                </label>
                <input
                  {...register("registrationFormLink")}
                  type="url"
                  placeholder="https://forms.google.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.registrationFormLink && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.registrationFormLink.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
