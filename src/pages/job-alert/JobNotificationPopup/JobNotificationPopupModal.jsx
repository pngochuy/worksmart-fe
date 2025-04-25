import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";


const JobNotificationPopupModal = ({ isOpen, onClose, defaultKeyword }) => {
  const [keyword, setKeyword] = useState(defaultKeyword || "");
  const [city, setCity] = useState("Hồ Chí Minh");
  const [district, setDistrict] = useState("Quận 7 - TP HCM");
  const [salary, setSalary] = useState("Thoả thuận");
  const [experience, setExperience] = useState("2 năm");
  const [specialization, setSpecialization] = useState("Tất cả vị trí chuyên môn");
  const [worktype, setWorktype] = useState("Toàn thời gian");
  const [frequency, setFrequency] = useState("daily");
  const [notificationMethod, setNotificationMethod] = useState("both");

  useEffect(() => {
    setKeyword(defaultKeyword || "");
  }, [defaultKeyword]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission logic, e.g., call backend API to create job alert
    alert("Đã gửi yêu cầu nhận việc làm tương tự với từ khoá: " + keyword);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-6 bg-white rounded-xl shadow-lg font-sans">
        <DialogHeader>
          <DialogTitle>Tạo thông báo việc làm</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-900 mb-1">
              Từ khoá tìm kiếm <span className="text-red-600">*</span>
            </label>
            <input
              id="keyword"
              name="keyword"
              type="text"
              required
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-900 mb-1">Tỉnh/Thành phố</label>
              <select
                id="city"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:text-sm"
              >
                <option>Hồ Chí Minh</option>
              </select>
            </div>
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-900 mb-1">Quận/Huyện</label>
              <select
                id="district"
                name="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:text-sm"
              >
                <option>Quận 7 - TP HCM</option>
              </select>
            </div>
            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-900 mb-1">Mức lương</label>
              <select
                id="salary"
                name="salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:text-sm"
              >
                <option>Thoả thuận</option>
              </select>
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-900 mb-1">Kinh nghiệm</label>
              <select
                id="experience"
                name="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:text-sm"
              >
                <option>2 năm</option>
              </select>
            </div>
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-900 mb-1">Vị trí chuyên môn</label>
              <select
                id="specialization"
                name="specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:text-sm"
              >
                <option>Tất cả vị trí chuyên môn</option>
              </select>
            </div>
            <div>
              <label htmlFor="worktype" className="block text-sm font-medium text-gray-900 mb-1">Hình thức làm việc</label>
              <select
                id="worktype"
                name="worktype"
                value={worktype}
                onChange={(e) => setWorktype(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:text-sm"
              >
                <option>Toàn thời gian</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <fieldset>
              <legend className="text-sm font-medium text-gray-900 mb-2">Tuần suất nhận thông báo</legend>
              <div className="flex items-center space-x-4">
                <label htmlFor="daily" className="inline-flex items-center cursor-pointer text-gray-900 text-sm">
                  <input
                    id="daily"
                    name="frequency"
                    type="radio"
                    value="daily"
                    checked={frequency === "daily"}
                    onChange={() => setFrequency("daily")}
                    className="form-radio text-green-600 border-gray-300 focus:ring-green-600"
                  />
                  <span className="ml-2">Hằng ngày</span>
                </label>
                <label htmlFor="weekly" className="inline-flex items-center cursor-pointer text-gray-900 text-sm">
                  <input
                    id="weekly"
                    name="frequency"
                    type="radio"
                    value="weekly"
                    checked={frequency === "weekly"}
                    onChange={() => setFrequency("weekly")}
                    className="form-radio text-green-600 border-gray-300 focus:ring-green-600"
                  />
                  <span className="ml-2">Hằng tuần</span>
                </label>
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-medium text-gray-900 mb-2">Nhận thông báo qua</legend>
              <div className="flex items-center space-x-4">
                <label htmlFor="email" className="inline-flex items-center cursor-pointer text-gray-900 text-sm">
                  <input
                    id="email"
                    name="notification_method"
                    type="radio"
                    value="email"
                    checked={notificationMethod === "email"}
                    onChange={() => setNotificationMethod("email")}
                    className="form-radio text-green-600 border-gray-300 focus:ring-green-600"
                  />
                  <span className="ml-2">Email</span>
                </label>
                <label htmlFor="app" className="inline-flex items-center cursor-pointer text-gray-900 text-sm">
                  <input
                    id="app"
                    name="notification_method"
                    type="radio"
                    value="app"
                    checked={notificationMethod === "app"}
                    onChange={() => setNotificationMethod("app")}
                    className="form-radio text-green-600 border-gray-300 focus:ring-green-600"
                  />
                  <span className="ml-2">Ứng dụng</span>
                </label>
                <label htmlFor="both" className="inline-flex items-center cursor-pointer text-gray-900 text-sm">
                  <input
                    id="both"
                    name="notification_method"
                    type="radio"
                    value="both"
                    checked={notificationMethod === "both"}
                    onChange={() => setNotificationMethod("both")}
                    className="form-radio text-green-600 border-gray-300 focus:ring-green-600"
                  />
                  <span className="ml-2">Cả hai</span>
                </label>
              </div>
            </fieldset>
          </div>
          <div className="flex justify-between mt-6 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 bg-gray-100 py-3 text-base font-semibold text-slate-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-green-600 py-3 text-base font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            >
              Tạo mới
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobNotificationPopupModal;
