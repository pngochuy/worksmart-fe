/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Check,
  X,
  Award,
  FileText,
  Star,
  TrendingUp,
  Loader,
  Clock,
  AlertCircle,
  CreditCard,
  Lock,
  Cpu,
} from "lucide-react";
import { getUserLoginData } from "@/helpers/decodeJwt";
import { createPaymentLink, getPackages } from "@/services/employerServices";
import { toast } from "react-toastify";

const PackagePurchase = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingPackages, setFetchingPackages] = useState(true);
  const [candidatePackages, setCandidatePackages] = useState([]);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Get user information
    const userData = getUserLoginData();
    setUserInfo(userData);

    // Fetch packages from API
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setFetchingPackages(true);
    setError(null);
    try {
      const packagesData = await getPackages();
      console.log("Package data:", packagesData);

      // Filter only Candidate packages
      const candidatePkgs = packagesData
        .filter((pkg) => pkg.name.includes("Candidate"))
        .map((pkg) => mapPackageData(pkg));

      setCandidatePackages(candidatePkgs);
    } catch (err) {
      console.error("Error fetching packages:", err);
      setError("Failed to load packages. Please try again later.");
    } finally {
      setFetchingPackages(false);
    }
  };

  // Map raw package data to UI format with features
  const mapPackageData = (pkg) => {
    const packageData = {
      id: pkg.packageID,
      name: pkg.name,
      price: pkg.price,
      duration: pkg.durationInDays,
      features: [
        {
          text:
            pkg.cvLimit === 999
              ? "Unlimited CV Uploads"
              : `${pkg.cvLimit} CV Uploads`,
          available: true,
          icon: <FileText size={16} className="text-blue-500 mr-2" />,
        },
        // {
        //   text: pkg.highlightProfile ? "Highlighted Profile" : "Basic Profile",
        //   available: pkg.highlightProfile,
        //   icon: <Star size={16} className="text-yellow-500 mr-2" />,
        // },
        // {
        //   text: "Access to Exclusive Jobs",
        //   available: pkg.accessToExclusiveJobs,
        //   icon: <Lock size={16} className="text-green-500 mr-2" />,
        // },
        // {
        //   text: "Priority in Job Applications",
        //   available: pkg.name.includes("Premium"),
        //   icon: <TrendingUp size={16} className="text-purple-500 mr-2" />,
        // },
        {
          text: "AI CV Assistant",
          available: pkg.name.includes("Premium"),
          icon: <Cpu size={16} className="text-orange-500 mr-2" />,
        },
      ],
      popular: pkg.name.includes("Plus"),
      bestValue: pkg.name.includes("Premium"),
      color: getPackageColor(pkg.name),
      tagline: getPackageTagline(pkg.name),
    };

    return packageData;
  };

  // Helper functions for package display text
  const getPackageColor = (name) => {
    if (name.includes("Premium")) return "green";
    if (name.includes("Standard")) return "purple";
    return "blue"; // For Basic
  };

  const getPackageTagline = (name) => {
    if (name.includes("Premium"))
      return "Complete Solution for Career Advancement";
    if (name.includes("Plus")) return "Perfect for Active Job Seekers";
    return "Essential Job Search Tools"; // For Basic
  };

  const handlePurchase = async (selectedPackage) => {
    setLoading(true);

    try {
      let userId = null;
      let role = null;

      if (userInfo) {
        userId = userInfo.userID;
        role = userInfo.role;
      } else {
        const userDataString = localStorage.getItem("userLoginData");
        console.log("UserDataLogin:", userDataString);
        if (userDataString) {
          try {
            const userData = JSON.parse(userDataString);
            userId = userData.userID;
            role = userData.role;
          } catch (error) {
            console.error("Error parsing user data:", error);
            throw new Error("Unable to get user information");
          }
        }
      }

      if (!userId) {
        throw new Error("Please login to make a transaction");
      }

      const paymentData = await createPaymentLink(
        userId,
        selectedPackage.id,
        role
      );

      window.location.href = paymentData.checkoutUrl;
    } catch (error) {
      console.error("Error during payment:", error);
      toast.error(error.message || "Payment process failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render single package card
  const renderPackageCard = (pkg) => {
    const getBorderColor = () => {
      switch (pkg.color) {
        case "blue":
          return "border-blue-400";
        case "purple":
          return "border-purple-400";
        case "green":
          return "border-green-400";
        default:
          return "border-gray-300";
      }
    };

    const getHeaderColor = () => {
      switch (pkg.color) {
        case "blue":
          return "bg-gradient-to-r from-blue-500 to-blue-600";
        case "purple":
          return "bg-gradient-to-r from-purple-500 to-purple-600";
        case "green":
          return "bg-gradient-to-r from-green-500 to-green-600";
        default:
          return "bg-gradient-to-r from-gray-500 to-gray-600";
      }
    };

    const getButtonColor = () => {
      switch (pkg.color) {
        case "blue":
          return "bg-blue-500 hover:bg-blue-600 ring-blue-300";
        case "purple":
          return "bg-purple-500 hover:bg-purple-600 ring-purple-300";
        case "green":
          return "bg-green-500 hover:bg-green-600 ring-green-300";
        default:
          return "bg-gray-500 hover:bg-gray-600 ring-gray-300";
      }
    };

    return (
      <div
        key={pkg.id}
        className={`border-2 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl relative group ${getBorderColor()} ${
          pkg.popular || pkg.bestValue ? "transform scale-105 z-10" : ""
        }`}
      >
        {pkg.popular && (
          <div className="absolute top-0 right-0 bg-yellow-500 text-white px-4 py-1 rounded-bl-lg font-bold z-20">
            Popular Choice
          </div>
        )}
        {pkg.bestValue && (
          <div className="absolute top-0 right-0 bg-green-600 text-white px-4 py-1 rounded-bl-lg font-bold z-20">
            Best Value
          </div>
        )}
        <div className={`${getHeaderColor()} text-white p-6 text-center`}>
          <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
          <p className="text-sm opacity-90 mb-3 text-white">{pkg.tagline}</p>
          <div className="flex items-center justify-center">
            <span className="text-3xl font-bold">
              {pkg.price.toLocaleString("en-US")}
            </span>
            <span className="ml-1 text-white opacity-80">VND</span>
          </div>
          <div className="flex items-center justify-center mt-2 opacity-80">
            <Clock size={14} className="mr-1" />
            <p className="text-white">{pkg.duration} days</p>
          </div>
        </div>

        <div className="p-6 bg-white">
          <ul className="space-y-4 mb-6">
            {pkg.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                {feature.available ? (
                  <div className="flex-shrink-0 mt-0.5">{feature.icon}</div>
                ) : (
                  <X
                    size={16}
                    className="text-red-400 mr-2 flex-shrink-0 mt-0.5"
                  />
                )}
                <span
                  className={
                    feature.available ? "text-gray-800" : "text-gray-400"
                  }
                >
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handlePurchase(pkg)}
            disabled={loading}
            className={`mt-4 w-full ${getButtonColor()} text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:-translate-y-1 shadow-md hover:shadow-xl`}
          >
            {loading ? "Processing..." : "Select Package"}
          </button>
        </div>
      </div>
    );
  };

  // Render small package card for mobile view
  const renderSmallPackageCard = (pkg) => {
    const getButtonColor = () => {
      switch (pkg.color) {
        case "blue":
          return "bg-blue-500 hover:bg-blue-600";
        case "purple":
          return "bg-purple-500 hover:bg-purple-600";
        case "green":
          return "bg-green-500 hover:bg-green-600";
        default:
          return "bg-gray-500 hover:bg-gray-600";
      }
    };

    const getBadgeColor = () => {
      if (pkg.bestValue) return "bg-green-100 text-green-800 border-green-200";
      if (pkg.popular) return "bg-yellow-100 text-yellow-800 border-yellow-200";
      return "";
    };

    const getBadgeText = () => {
      if (pkg.bestValue) return "Best Value";
      if (pkg.popular) return "Popular";
      return "";
    };

    return (
      <div key={pkg.id} className="border rounded-lg shadow-md p-4 bg-white">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg">{pkg.name}</h3>
            <p className="text-xs text-gray-500">{pkg.tagline}</p>
          </div>
          {(pkg.popular || pkg.bestValue) && (
            <span
              className={`text-xs px-2 py-1 rounded-full border ${getBadgeColor()}`}
            >
              {getBadgeText()}
            </span>
          )}
        </div>

        <div className="mb-3">
          <span className="text-2xl font-bold">
            {pkg.price.toLocaleString()} VND
          </span>
          <span className="text-sm text-gray-500 ml-1">
            / {pkg.duration} days
          </span>
        </div>

        <div className="mb-4 space-y-1">
          {pkg.features
            .filter((f) => f.available)
            .slice(0, 3)
            .map((feature, idx) => (
              <div key={idx} className="flex items-center text-sm">
                <Check
                  size={14}
                  className="text-green-500 mr-1 flex-shrink-0"
                />
                <span className="text-gray-700">{feature.text}</span>
              </div>
            ))}
          {pkg.features.filter((f) => f.available).length > 3 && (
            <button className="text-sm text-blue-500 hover:underline">
              + {pkg.features.filter((f) => f.available).length - 3} more
              features
            </button>
          )}
        </div>

        <button
          onClick={() => handlePurchase(pkg)}
          disabled={loading}
          className={`w-full py-2 ${getButtonColor()} text-white rounded-md font-medium text-sm`}
        >
          {loading ? "Processing..." : "Select Package"}
        </button>
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <div className="flex justify-center items-center p-16">
      <div className="flex flex-col items-center">
        <Loader size={40} className="animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading packages...</p>
      </div>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-lg text-center max-w-lg mx-auto">
      <div className="flex flex-col items-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Packages</h3>
        <p>{error}</p>
        <button
          className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors duration-300"
          onClick={fetchPackages}
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <>
      <section className="user-dashboard bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="dashboard-outer max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="upper-title-box mb-10 text-center">
            <div className="mr-2 inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">
              Candidate Packages
            </h3>
            <div className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Enhance your job search experience and boost your profile
              visibility with our premium packages
            </div>
          </div>

          {/* Main content section */}
          {fetchingPackages ? (
            renderLoading()
          ) : error ? (
            renderError()
          ) : (
            <>
              {/* Package cards for small screens */}
              <div className="md:hidden space-y-4 mb-8">
                {candidatePackages.map(renderSmallPackageCard)}
              </div>

              {/* Package cards for medium and large screens */}
              <div className="hidden md:block mb-16">
                <div
                  className={`grid grid-cols-1 md:grid-cols-${candidatePackages.length} gap-4 lg:gap-8 px-4`}
                >
                  {candidatePackages.length > 0 ? (
                    candidatePackages.map(renderPackageCard)
                  ) : (
                    <p className="col-span-3 text-center text-gray-500 py-8">
                      No packages available at the moment
                    </p>
                  )}
                </div>
              </div>

              {/* Features comparison */}
              {candidatePackages.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-8 overflow-hidden mb-16">
                  <div className="flex items-center justify-center mb-8">
                    <Award className="h-6 w-6 text-blue-500 mr-2" />
                    <h3 className="text-2xl font-bold text-center">
                      Detailed Package Comparison
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tl-lg">
                            Feature
                          </th>
                          {candidatePackages.map((pkg, idx) => (
                            <th
                              key={pkg.id}
                              className={`px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 ${
                                idx === candidatePackages.length - 1
                                  ? "rounded-tr-lg"
                                  : ""
                              }`}
                            >
                              {pkg.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                            <FileText
                              size={18}
                              className="mr-2 text-blue-500"
                            />
                            CV Uploads
                          </td>
                          {candidatePackages.map((pkg) => (
                            <td
                              key={pkg.id}
                              className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500"
                            >
                              {pkg.features[0].text.includes("Unlimited")
                                ? "Unlimited"
                                : pkg.features[0].text.split(" ")[0]}
                            </td>
                          ))}
                        </tr>
                        {/* <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                            <Star size={18} className="mr-2 text-yellow-500" />
                            Profile Status
                          </td>
                          {candidatePackages.map((pkg) => (
                            <td
                              key={pkg.id}
                              className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500"
                            >
                              {pkg.features[1].available
                                ? "Highlighted"
                                : "Basic"}
                            </td>
                          ))}
                        </tr> */}
                        {/* <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                            <Lock size={18} className="mr-2 text-green-500" />
                            Exclusive Jobs Access
                          </td>
                          {candidatePackages.map((pkg) => (
                            <td
                              key={pkg.id}
                              className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500"
                            >
                              {pkg.features[2].available ? (
                                <Check
                                  size={20}
                                  className="text-green-500 inline"
                                />
                              ) : (
                                <X size={20} className="text-red-400 inline" />
                              )}
                            </td>
                          ))}
                        </tr> */}
                        {/* <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                            <TrendingUp
                              size={18}
                              className="mr-2 text-purple-500"
                            />
                            Application Priority
                          </td>
                          {candidatePackages.map((pkg) => (
                            <td
                              key={pkg.id}
                              className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500"
                            >
                              {pkg.features[3].available ? (
                                <Check
                                  size={20}
                                  className="text-green-500 inline"
                                />
                              ) : (
                                <X size={20} className="text-red-400 inline" />
                              )}
                            </td>
                          ))}
                        </tr> */}
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                            <Cpu size={18} className="mr-2 text-orange-500" />
                            AI CV Assistant
                          </td>
                          {candidatePackages.map((pkg) => (
                            <td
                              key={pkg.id}
                              className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500"
                            >
                              {pkg.features[1].available ? (
                                <Check
                                  size={20}
                                  className="text-green-500 inline"
                                />
                              ) : (
                                <X size={20} className="text-red-400 inline" />
                              )}
                            </td>
                          ))}
                        </tr>

                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                            <Clock size={18} className="mr-2 text-blue-500" />
                            Duration
                          </td>
                          {candidatePackages.map((pkg) => (
                            <td
                              key={pkg.id}
                              className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500"
                            >
                              {pkg.duration} days
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                            <CreditCard
                              size={18}
                              className="mr-2 text-gray-500"
                            />
                            Price
                          </td>
                          {candidatePackages.map((pkg) => (
                            <td
                              key={pkg.id}
                              className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium"
                            >
                              {pkg.price.toLocaleString()} VND
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4"></td>
                          {candidatePackages.map((pkg) => (
                            <td key={pkg.id} className="px-6 py-4 text-center">
                              <button
                                onClick={() => handlePurchase(pkg)}
                                disabled={loading}
                                className={`px-4 py-2 rounded-md text-white text-sm font-medium ${
                                  pkg.color === "blue"
                                    ? "bg-blue-500 hover:bg-blue-600"
                                    : pkg.color === "purple"
                                    ? "bg-purple-500 hover:bg-purple-600"
                                    : "bg-green-500 hover:bg-green-600"
                                }`}
                              >
                                {loading ? "Processing..." : "Select"}
                              </button>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Benefits Section */}
              <div className="mb-16">
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-bold">
                    Why Upgrade Your Package?
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Stand out from the crowd and maximize your career
                    opportunities
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-md transition-shadow duration-300">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">
                      Multiple CV Options
                    </h4>
                    <p className="text-gray-600">
                      Upload different versions of your CV tailored for specific
                      positions or industries to increase your chances.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-md transition-shadow duration-300">
                    <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
                      <Star className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">
                      Highlighted Profile
                    </h4>
                    <p className="text-gray-600">
                      Get your profile highlighted in employer searches and
                      receive up to 3x more profile views.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-md transition-shadow duration-300">
                    <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
                      <Lock className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">
                      Exclusive Opportunities
                    </h4>
                    <p className="text-gray-600">
                      Access premium job listings not available to regular users
                      and get notified about them first.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Everything you need to know about our candidate packages
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                    <h4 className="font-semibold text-lg flex items-center">
                      <QuestionIcon className="text-blue-500 mr-2" />
                      How does a highlighted profile work?
                    </h4>
                    <p className="text-gray-600 ml-7">
                      Your profile will be visually enhanced in employer
                      searches and feature a &quot;Premium Candidate&quot;
                      badge. This increases your visibility by up to 300%.
                    </p>
                  </div>

                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                    <h4 className="font-semibold text-lg flex items-center">
                      <QuestionIcon className="text-blue-500 mr-2" />
                      What are exclusive jobs?
                    </h4>
                    <p className="text-gray-600 ml-7">
                      These are high-quality job opportunities that employers
                      reserve for premium candidates. They typically offer
                      better compensation and career growth potential.
                    </p>
                  </div>

                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                    <h4 className="font-semibold text-lg flex items-center">
                      <QuestionIcon className="text-blue-500 mr-2" />
                      Can I change my package later?
                    </h4>
                    <p className="text-gray-600 ml-7">
                      Yes, you can upgrade your package at any time. The
                      remaining days from your current package will be prorated
                      and applied to your new package.
                    </p>
                  </div>

                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                    <h4 className="font-semibold text-lg flex items-center">
                      <QuestionIcon className="text-blue-500 mr-2" />
                      How do I know my package is active?
                    </h4>
                    <p className="text-gray-600 ml-7">
                      Your active package and its expiration date will be
                      displayed on your dashboard. You&apos;ll also see a
                      &quot;Premium&quot; or &quot;Standard&quot; badge on your
                      profile.
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center mx-auto">
                    <span>View all questions</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

// Simple question mark icon component
const QuestionIcon = ({ className }) => (
  <div
    className={`rounded-full border border-current w-5 h-5 flex items-center justify-center flex-shrink-0 ${className}`}
  >
    <span className="text-xs font-bold">?</span>
  </div>
);

export default PackagePurchase;
