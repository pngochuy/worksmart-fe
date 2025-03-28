import { BriefcaseBusiness } from "lucide-react";

const EmptySimilarJobs = () => {
  return (
    <div className="border rounded-md p-6 text-center bg-gray-50">
      <div className="flex justify-center mb-4">
        <BriefcaseBusiness className="h-12 w-12 text-gray-400" />
      </div>
      <h5 className="text-lg font-medium text-gray-800 mb-2">
        No similar jobs found
      </h5>
      <p className="text-gray-600 mb-4">
        We couldn&apos;t find any similar jobs at the moment. Please check back
        later or explore other job categories.
      </p>
      <a
        href="/job-list"
        className="text-blue-600 hover:underline inline-flex items-center"
      >
        Browse all jobs <span className="ml-1">→</span>
      </a>
    </div>
  );
};

export default EmptySimilarJobs;
