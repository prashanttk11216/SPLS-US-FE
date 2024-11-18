
interface SignupProps {
  message: string | undefined,
  className?: string
}

const FieldError: React.FC<SignupProps> = ({ message, className = 'text-danger mt-1' }) => {
  // Handle empty message for better user experience
  if (!message) {
    return null;
  }

  return (
    <div className={className}>
      {message}
    </div>
  );
};

export default FieldError;
