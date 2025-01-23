import { useForm } from "react-hook-form";
import Input from "../../../components/common/Input/Input";
import { VALIDATION_MESSAGES } from "../../../constants/messages";
import { REGEX_PATTERNS } from "../../../constants/patterns";
import Modal from "../../../components/common/Modal/Modal";
import { resetPassword } from "../../../services/auth/authService";
import { toast } from "react-toastify";

interface ChangePasswordProps {
  email: string;
  isModalOpen: boolean;
  closeModal: () => void;
}

type ResetPasswordForm = {
  password: string;
  confirmPassword: string;
};

const ChangePassowrd: React.FC<ChangePasswordProps> = ({
  email,
  isModalOpen,
  closeModal,
}) => {
  const {
    handleSubmit,
    control,
    formState: { isValid },
    watch,
  } = useForm<ResetPasswordForm>({ mode: "onBlur" });

  /**
   * Validates if the confirmed password matches the entered password.
   * @param value - Confirm password value
   */
  const validatePassword = (value: string) => {
    return watch("password") === value || "Passwords do not match";
  };
  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      const result = await resetPassword({ ...data, email });
      if (result.success) {
        toast.success(result.message);
        closeModal();
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to reset the password. Please try again.");
    }
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={"Change Password"}
        size="lg"
        isCentered
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            {/* Password (only for creating) */}
            <>
              <div className="col-12 col-md-6">
                <Input
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter Password"
                  showEyeIcon={true}
                  control={control}
                  rules={{
                    required: VALIDATION_MESSAGES.passwordRequired,
                    pattern: {
                      value: REGEX_PATTERNS.password,
                      message: VALIDATION_MESSAGES.passwordPattern,
                    },
                  }}
                />
              </div>

              <div className="col-12 col-md-6">
                <Input
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  control={control}
                  showEyeIcon={true}
                  rules={{
                    required: VALIDATION_MESSAGES.confirmPasswordRequired,
                    validate: validatePassword,
                  }}
                />
              </div>
            </>
          </div>
          <div className="d-flex align-items-center justify-content-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-accent ms-3"
              disabled={!isValid}
            >
              Change
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ChangePassowrd;
