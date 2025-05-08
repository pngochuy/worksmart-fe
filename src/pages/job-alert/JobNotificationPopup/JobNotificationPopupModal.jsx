import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { toast } from "react-toastify";
import SalaryRangeDropdown from "../../job-list/SalaryRangeDropdown";
import Select from "react-select";
import { vietnamProvinces } from "../../../helpers/getLocationVN";

const customSelectStyles = {
  container: (provided) => ({
    ...provided,
    width: "250px",
  }),
  control: (provided) => ({
    ...provided,
    width: "250px",
    minWidth: "250px",
  }),
  menu: (provided) => ({
    ...provided,
    width: "250px",
    minWidth: "250px",
  }),
  option: (provided) => ({
    ...provided,
    width: "100%",
  }),
  singleValue: (provided) => ({
    ...provided,
    width: "100%",
  }),
};

const experienceOptions = [
  { value: "No experience", label: "No experience" },
  { value: "Under 1 year", label: "Under 1 year" },
  { value: "2 years", label: "2 years" },
  { value: "3 years", label: "3 years" },
  { value: "4 years", label: "4 years" },
  { value: "5 years", label: "5 years" },
  { value: "Over 5 years", label: "Over 5 years" },
];

const workTypeOptions = [
  { value: "Full-time", label: "Full-time" },
  { value: "Remote", label: "Remote" },
  { value: "Part-time", label: "Part-time" },
];

const notificationMethodOptions = [
  { value: "email", label: "Email" },
  { value: "app", label: "App" },
  { value: "both", label: "Both" },
];

const JobNotificationPopupModal = ({ isOpen, onClose, defaultKeyword }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [keyword, setKeyword] = useState(defaultKeyword || "");
  const [city, setCity] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [experience, setExperience] = useState(experienceOptions[2]); // default 2 years
  const [worktype, setWorktype] = useState(workTypeOptions[0]);
  const [frequency, setFrequency] = useState("daily");
  const [notificationMethod, setNotificationMethod] = useState(
    notificationMethodOptions[2]
  ); // default both

  useEffect(() => {
    setKeyword(defaultKeyword || "");
  }, [defaultKeyword]);

  useEffect(() => {
    const provinceOptions = vietnamProvinces.map((province) => ({
      value: province.name,
      label: province.name,
    }));
    setCityOptions(provinceOptions);
  }, []);

  const handleProvinceChange = (selectedOption) => {
    setCity(selectedOption.value);
  };

  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra tính hợp lệ của các trường
    if (!keyword) {
      toast.error("Please enter a keyword.");
      return;
    }

    if (!city) {
      toast.error("Please select a province/city.");
      return;
    }

    if (!selectedOption) {
      toast.error("Please select a salary range");
      return;
    }

    if (!experience) {
      toast.error("Please select your experience level.");
      return;
    }

    if (!worktype) {
      toast.error("Please select the work type.");
      return;
    }

    if (!notificationMethod) {
      toast.error("Please select a notification method.");
      return;
    }

    const userId = userID;

    const formatSalary = (salary) => {
      if (!salary) return "";
      return salary.toLocaleString("en-US"); // Chuyển số thành chuỗi có dấu phẩy
    };

    const formattedMinSalary = formatSalary(Number(minSalary));
    const formattedMaxSalary = formatSalary(Number(maxSalary));
    const salaryRange =
      formattedMinSalary && formattedMaxSalary
        ? `${formattedMinSalary} - ${formattedMaxSalary}`
        : "";
    const payload = {
      keyword,
      province: city,
      salaryRange: selectedOption?.value,
      experience: experience.value,
      jobType: worktype.value || null,
      frequency: frequency || null,
      notificationMethod: notificationMethod.value,
      userId: userId,
    };

    const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/JobAlert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        onClose(); // close modal
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error when calling API: ", error);
      toast.error("Error when calling API");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-6 bg-white rounded-xl shadow-lg font-sans mx-auto">
        <DialogHeader>
          <DialogTitle>Create Job Alert</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="keyword"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Search Keyword <span className="text-red-600">*</span>
            </label>
            <input
              id="keyword"
              name="keyword"
              type="text"
              required
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search Keyword"
              className="w-full max-w-xl rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Province/City
              </label>
              <Select
                options={cityOptions}
                styles={customSelectStyles}
                placeholder="Select a city"
                value={cityOptions.find((c) => c.value === city)}
                onChange={handleProvinceChange}
                isSearchable
              />
            </div>

            <div>
              <label
                htmlFor="salary"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                Salary
              </label>
              <SalaryRangeDropdown
                selectedOption={selectedOption}
                setSearchParams={({ MinSalary, MaxSalary }) => {
                  setMinSalary(MinSalary);
                  setMaxSalary(MaxSalary);

                  // Gán giá trị đúng cho selectedOption
                  setSelectedOption({
                    value: `${MinSalary}-${MaxSalary}`, // Lưu giá trị chuỗi MinSalary-MaxSalary
                    label: `${MinSalary.toLocaleString()} - ${MaxSalary.toLocaleString()}`, // Lưu label cho dropdown
                  });
                }}
              />
            </div>
            <div>
              <label
                htmlFor="experience"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                Experience
              </label>
              <Select
                options={experienceOptions}
                styles={customSelectStyles}
                value={experience}
                onChange={setExperience}
                placeholder="Select experience"
                isSearchable={false}
              />
            </div>
            <div>
              <label
                htmlFor="worktype"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                Work Type
              </label>
              <Select
                options={workTypeOptions}
                styles={customSelectStyles}
                value={worktype}
                onChange={setWorktype}
                placeholder="Select work type"
                isSearchable={false}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Notification Method
              </label>
              <div className="flex items-center space-x-6">
                {notificationMethodOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      id={option.value}
                      name="notificationMethod"
                      value={option.value}
                      checked={notificationMethod.value === option.value}
                      onChange={() => setNotificationMethod(option)}
                      className="mr-2"
                    />
                    <label htmlFor={option.value} className="text-sm">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 bg-gray-100 py-3 text-base font-semibold text-slate-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-blue-600 py-3 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Create Alert
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobNotificationPopupModal;
