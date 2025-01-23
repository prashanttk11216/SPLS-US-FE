import React, { useState, useEffect, useRef } from 'react';
import './OTPInput.scss';

interface OTPInputProps {
  size: number; // Number of input boxes
  onSubmit: (otp: string) => void; // Function to handle OTP submission
}

const OTPInput: React.FC<OTPInputProps> = ({ size, onSubmit }) => {
  const [otp, setOtp] = useState<string[]>(Array(size).fill(''));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    // Focus on the first input field when the component mounts
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]*$/.test(value)) return; // Only allow numeric input

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus to the next input field
    if (value && index < size - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Automatically submit OTP when all fields are filled
    if (newOtp.every((digit) => digit !== '')) {
      onSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace') {
      // Clear the current field and move focus to the previous input
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }

      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const clipboardData = event.clipboardData.getData('text').slice(0, size);
    const newOtp = clipboardData.split('').map((char) => (/^[0-9]$/.test(char) ? char : ''));

    newOtp.forEach((digit, i) => {
      if (digit && inputRefs.current[i]) {
        inputRefs.current[i].value = digit; // Update the input value directly
      }
    });

    setOtp(newOtp);

    // Automatically submit OTP when all fields are filled
    if (newOtp.every((digit) => digit !== '')) {
      onSubmit(newOtp.join(''));
    }
  };

  return (
    <div className="otp-input d-flex">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el!)}
          type="text"
          value={digit}
          maxLength={1}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : undefined} // Only allow pasting on the first input
          className="otp-input-field"
          aria-label={`Enter digit ${index + 1} of OTP`}
        />
      ))}
    </div>
  );
};

export default OTPInput;
