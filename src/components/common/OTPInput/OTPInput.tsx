import React, { useState, useEffect, useRef } from 'react';
import './OTPInput.scss';

interface OTPInputProps {
  size: number;
  onSubmit: (otp: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ size, onSubmit }) => {
  const [otp, setOtp] = useState<string[]>(Array(size).fill(''));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]*$/.test(value)) return; // Only allow numeric input
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < size - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      onSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const clipboardData = event.clipboardData.getData('text').slice(0, size);
    const newOtp = clipboardData.split('').map((char) => (/^[0-9]$/.test(char) ? char : ''));
    setOtp(newOtp);

    for (let i = 0; i < size; i++) {
      if (newOtp[i]) {
        inputRefs.current[i]?.focus();
      }
    }

    if (newOtp.every((digit) => digit !== '')) {
      onSubmit(newOtp.join(''));
    }
  };

  return (
    <div className="otp-input">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el!)}
          type="text"
          value={digit}
          maxLength={1}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
};

export default OTPInput;
