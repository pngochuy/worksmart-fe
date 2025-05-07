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

const workTypeOptions = [{ value: "Full-time", label: "Full-time" }];

const notificationMethodOptions = [
  { value: "email", label: "Email" },
  { value: "app", label: "App" },
  { value: "both", label: "Both" },
];

const JobNotificationPopupModal = ({ isOpen, onClose, defaultKeyword }) => {
  const [keyword, setKeyword] = useState(defaultKeyword || "");
  const [city, setCity] = useState("Ho Chi Minh City");
  const [district, setDistrict] = useState("");

  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [experience, setExperience] = useState(experienceOptions[2]); // default 2 years
  const [specialization, setSpecialization] = useState("All specializations");
  const [worktype, setWorktype] = useState(workTypeOptions[0]);
  const [frequency, setFrequency] = useState("daily");
  const [notificationMethod, setNotificationMethod] = useState(
    notificationMethodOptions[2]
  ); // default both
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);

  useEffect(() => {
    setKeyword(defaultKeyword || "");
  }, [defaultKeyword]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await response.json();
        setProvinces(data);
        const options = data.map((item) => ({
          value: item.code,
          label: item.name,
        }));
        setCityOptions(options);
      } catch (error) {
        console.error("Failed to load province list:", error);
      }
    };

    fetchProvinces();
  }, []);

  const handleProvinceChange = async (selectedOption) => {
    setCity(selectedOption.label);
    setDistrict("");
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/p/${selectedOption.value}?depth=2`
      );
      const data = await response.json();
      const districtOpts = data.districts.map((d) => ({
        value: d.name,
        label: d.name,
      }));
      setDistrictOptions(districtOpts);
    } catch (error) {
      console.error("Error loading districts:", error);
    }
  };

  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = userID;

    const salaryRange =
      minSalary && maxSalary ? minSalary + "-" + maxSalary : "";

    const payload = {
      keyword,
      province: city,
      district: district,
      salaryRange: salaryRange,
      experience: experience.value,
      jobPosition: specialization,
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
                placeholder="Select a province/city"
                onChange={handleProvinceChange}
                isSearchable
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                District
              </label>
              <Select
                options={districtOptions}
                styles={customSelectStyles}
                placeholder="Select a district"
                value={
                  districtOptions.find((opt) => opt.value === district) || null
                }
                onChange={(option) => setDistrict(option.value)}
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
                setSearchParams={({ MinSalary, MaxSalary }) => {
                  setMinSalary(MinSalary);
                  setMaxSalary(MaxSalary);
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
