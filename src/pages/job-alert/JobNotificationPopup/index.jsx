<html lang="en">
  <head>
    <meta charSet="UTF-8" />
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <title>Tạo thông báo việc làm</title>
    <script src="https://cdn.tailwindcss.com" />
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
      rel="stylesheet"
    />
  </head>
  <body className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
    <div
      aria-labelledby="modal-title"
      aria-modal="true"
      className="bg-white rounded-xl shadow-lg max-w-4xl w-full p-6 relative font-sans"
      role="dialog">
      <button
        aria-label="Close"
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        type="button">
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6 18L18 6M6 6l12 12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <h2
        className="text-center text-xl font-extrabold text-slate-900 mb-6"
        id="modal-title">
        Tạo thông báo việc làm
      </h2>
      <form action="#" className="space-y-6" method="POST">
        <div>
          <label
            className="block text-sm font-medium text-gray-900 mb-1"
            htmlFor="keyword">
            Từ khoá tìm kiếm <span className="text-red-600">*</span>
          </label>
          <input
            className="block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:text-sm"
            defaultValue="KOC Maketing - Tại Hồ Chí Minh - Thu Nhập Hấp Dẫn"
            id="keyword"
            name="keyword"
            required
            type="text"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-900 mb-1"
              htmlFor="city">
              Tỉnh/Thành phố
            </label>
            <select
              className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:text-sm"
              id="city"
              name="city">
              <option>Hồ Chí Minh</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-900 mb-1"
              htmlFor="district">
              Quận/Huyện
            </label>
            <select
              className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:text-sm"
              id="district"
              name="district">
              <option>Quận 7 - TP HCM</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-900 mb-1"
              htmlFor="salary">
              Mức lương
            </label>
            <select
              className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:text-sm"
              id="salary"
              name="salary">
              <option>Thoả thuận</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-900 mb-1"
              htmlFor="experience">
              Kinh nghiệm
            </label>
            <select
              className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:text-sm"
              id="experience"
              name="experience">
              <option>2 năm</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-900 mb-1"
              htmlFor="specialization">
              Vị trí chuyên môn
            </label>
            <select
              className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:text-sm"
              id="specialization"
              name="specialization">
              <option>Tất cả vị trí chuyên môn</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-900 mb-1"
              htmlFor="worktype">
              Hình thức làm việc
            </label>
            <select
              className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:text-sm"
              id="worktype"
              name="worktype">
              <option>Toàn thời gian</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <fieldset>
            <legend className="text-sm font-medium text-gray-900 mb-2">
              Tuần suất nhận thông báo
            </legend>
            <div className="flex items-center space-x-4">
              <label
                className="inline-flex items-center cursor-pointer text-gray-900 text-sm"
                htmlFor="daily">
                <input
                  className="form-radio text-green-600 border-gray-300 focus:ring-green-600"
                  defaultChecked
                  defaultValue="daily"
                  id="daily"
                  name="frequency"
                  type="radio"
                />
                <span className="ml-2">Hằng ngày</span>
              </label>
              <label
                className="inline-flex items-center cursor-pointer text-gray-900 text-sm"
                htmlFor="weekly">
                <input
                  className="form-radio text-green-600 border-gray-300 focus:ring-green-600"
                  defaultValue="weekly"
                  id="weekly"
                  name="frequency"
                  type="radio"
                />
                <span className="ml-2">Hằng tuần</span>
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium text-gray-900 mb-2">
              Nhận thông báo qua
            </legend>
            <div className="flex items-center space-x-4">
              <label
                className="inline-flex items-center cursor-pointer text-gray-900 text-sm"
                htmlFor="email">
                <input
                  className="form-radio text-green-600 border-gray-300 focus:ring-green-600"
                  defaultValue="email"
                  id="email"
                  name="notification_method"
                  type="radio"
                />
                <span className="ml-2">Email</span>
              </label>
              <label
                className="inline-flex items-center cursor-pointer text-gray-900 text-sm"
                htmlFor="app">
                <input
                  className="form-radio text-green-600 border-gray-300 focus:ring-green-600"
                  defaultValue="app"
                  id="app"
                  name="notification_method"
                  type="radio"
                />
                <span className="ml-2">Ứng dụng</span>
              </label>
              <label
                className="inline-flex items-center cursor-pointer text-gray-900 text-sm"
                htmlFor="both">
                <input
                  className="form-radio text-green-600 border-gray-300 focus:ring-green-600"
                  defaultChecked
                  defaultValue="both"
                  id="both"
                  name="notification_method"
                  type="radio"
                />
                <span className="ml-2">Cả hai</span>
              </label>
            </div>
          </fieldset>
        </div>
        <div className="flex justify-between mt-6 space-x-4">
          <button
            className="flex-1 rounded-md border border-gray-300 bg-gray-100 py-3 text-base font-semibold text-slate-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            type="button">
            Hủy
          </button>
          <button
            className="flex-1 rounded-md bg-green-600 py-3 text-base font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            type="submit">
            Tạo mới
          </button>
        </div>
      </form>
    </div>
  </body>
</html>;
