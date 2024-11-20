import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";

import OTPInput from "../../../components/common/OTPInput/OTPInput";
import MenWithBox from "../../../assets/images/menWithBox.svg";

import "./VerifyUser.scss";
import { verifyUser } from "../../../services/auth/authService";
import useFetchData from "../../../hooks/useFetchData/useFetchData";
import { UserRole } from "../../../enums/UserRole";

export interface VerifyUserForm {
  email: string;
  otp: string;
}

const VerifyUser: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<VerifyUserForm>({ mode: "onBlur" });

  const { createData: verifyOtp, loading } = useFetchData<any>({
    createDataService: verifyUser,
  });

  const handleOtpSubmit = async (data: VerifyUserForm) => {
    if (!email) {
      toast.error("Invalid email. Please try again.");
      return;
    }

    data.email = email; // Ensure email is part of the form data

    try {
      const result = await verifyOtp(data);

      if (result.success) {
        toast.success(result.message);
        navigate(`/login`, { replace: true });
      } 
    } catch (error) {
      console.error("OTP Verification Error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleOtpChange = (otp: string) => {
    setValue("otp", otp, { shouldValidate: true });
  };

  return (
    <div className="verify-user-container container vh-100 d-flex align-items-center justify-content-center">
      <div className="row align-items-center w-100">
        <div className="d-none d-lg-block col-lg-6">
          <img src={MenWithBox} alt="Verification Illustration" />
        </div>
        <div className="col-12 col-lg-6">
          <div className="verify-user-form mx-auto w-75">
            <h2 className="fw-bolder text-center mb-2">Verify Account</h2>
            <p className="text-dark-gray-2">We will send you a <b>One Time Password</b> on your phone number</p>
            <form onSubmit={handleSubmit(handleOtpSubmit)} noValidate>
              <div className="row">
                {/* OTP Input */}
                <div className="col-12 mb-5">
                  <OTPInput size={6} onSubmit={handleOtpChange} />
                </div>

                {/* Verify Button */}
                <div className="col-12 text-center mb-2">
                  <button
                    type="submit"
                    className="btn btn-sky-blue text-white w-75 fw-bold"
                    disabled={!isValid || loading}
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                </div>
                <div className="fw-bold text-center resend-otp">Didn't get the verification OTP? <span className="pe-auto text-sky-blue">Resend again</span></div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyUser;
