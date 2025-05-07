import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { toast } from "react-toastify";

const JobNotificationPopupModal = ({ isOpen, onClose, defaultKeyword }) => {
  const [keyword, setKeyword] = useState(defaultKeyword || "");
  const [city, setCity] = useState("Ho Chi Minh City");
  const [district, setDistrict] = useState("");

  const [salary, setSalary] = useState("Negotiable");
  const [experience, setExperience] = useState("2 years");
  const [specialization, setSpecialization] = useState("All specializations");
  const [worktype, setWorktype] = useState("Full-time");
  const [frequency, setFrequency] = useState("daily");
  const [notificationMethod, setNotificationMethod] = useState("both");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    setKeyword(defaultKeyword || "");
  }, [defaultKeyword]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error("Failed to load province list:", error);
      }
    };

    fetchProvinces();
  }, []);

  const handleProvinceChange = async (e) => {
    const selectedCode = e.target.value;
    const selectedProvince = provinces.find(
      (p) => p.code === parseInt(selectedCode)
    );
    setCity(selectedProvince.name);
    setDistrict("");
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/p/${selectedCode}?depth=2`
      );
      const data = await response.json();
      setDistricts(data.districts || []);
    } catch (error) {
      console.error("Error loading districts:", error);
    }
  };

  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || null;
  //const userRole = user?.role || null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = userID;

    const payload = {
      keyword,
      province: city,
      district: district,
      salaryRange: salary,
      experience: experience,
      jobPosition: specialization,
      jobType: worktype || null,
      frequency: frequency || null,
      notificationMethod: notificationMethod,
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
        onClose(); // đóng modal
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
      <DialogContent className="max-w-4xl p-6 bg-white rounded-xl shadow-lg font-sans">
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
              className="block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                Province/City
              </label>
              <select
                id="city"
                name="city"
                onChange={handleProvinceChange}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 sm:text-sm"
              >
                <option value="">Select a province/city</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="district"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                District
              </label>
              <select
                id="district"
                name="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 sm:text-sm"
              >
                <option value="">Select a district</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="salary"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                Salary
              </label>
              <select
                id="salary"
                name="salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 sm:text-sm"
              >
                <option value="20 - 25 million">20 - 25 million</option>
                <option value="25 - 30 million">25 - 30 million</option>
                <option value="30 - 50 million">30 - 50 million</option>
                <option value="Over 50 million">Over 50 million</option>
                <option value="Negotiable">Negotiable</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="experience"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                Experience
              </label>
              <select
                id="experience"
                name="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 sm:text-sm"
              >
                <option>No experience</option>
                <option>Under 1 year</option>
                <option>2 years</option>
                <option>3 years</option>
                <option>4 years</option>
                <option>5 years</option>
                <option>Over 5 years</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="worktype"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                Work Type
              </label>
              <select
                id="worktype"
                name="worktype"
                value={worktype}
                onChange={(e) => setWorktype(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 sm:text-sm"
              >
                <option>Full-time</option>
              </select>
            </div>
            <div>
              <fieldset>
                <legend className="text-sm font-medium text-gray-900 mb-2">
                  Notification Method
                </legend>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-x-6">
                  <label
                    htmlFor="email"
                    className="inline-flex items-center cursor-pointer text-gray-900 text-sm"
                  >
                    <input
                      id="email"
                      name="notification_method"
                      type="radio"
                      value="email"
                      checked={notificationMethod === "email"}
                      onChange={() => setNotificationMethod("email")}
                      className="form-radio text-blue-600 border-gray-300 focus:ring-blue-600"
                    />
                    <span className="ml-2">Email</span>
                  </label>

                  <label
                    htmlFor="app"
                    className="inline-flex items-center cursor-pointer text-gray-900 text-sm"
                  >
                    <input
                      id="app"
                      name="notification_method"
                      type="radio"
                      value="app"
                      checked={notificationMethod === "app"}
                      onChange={() => setNotificationMethod("app")}
                      className="form-radio text-blue-600 border-gray-300 focus:ring-blue-600"
                    />
                    <span className="ml-2">App</span>
                  </label>

                  <label
                    htmlFor="both"
                    className="inline-flex items-center cursor-pointer text-gray-900 text-sm"
                  >
                    <input
                      id="both"
                      name="notification_method"
                      type="radio"
                      value="both"
                      checked={notificationMethod === "both"}
                      onChange={() => setNotificationMethod("both")}
                      className="form-radio text-blue-600 border-gray-300 focus:ring-blue-600"
                    />
                    <span className="ml-2">Both</span>
                  </label>
                </div>
              </fieldset>
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
