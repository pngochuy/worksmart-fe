import { JobForm } from "./JobForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCompanyProfile } from "@/services/employerServices";
import { getUserLoginData } from "@/helpers/decodeJwt";

export const Index = () => {
  const [verificationLevel, setVerificationLevel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = getUserLoginData();

        if (user.role === "Employer") {
          const companyData = await fetchCompanyProfile();

          setVerificationLevel(companyData.verificationLevel);
          console.log("Verification Level:", companyData.verificationLevel);
        }
      } catch (error) {
        console.error("Error loading verification data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (verificationLevel !== null && verificationLevel < 3) {
      navigate("/employer/verification");
    }
  }, [verificationLevel, navigate]);

  return <JobForm />;
};
