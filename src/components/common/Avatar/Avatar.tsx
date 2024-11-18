import React, { useEffect, useState } from "react";
import "./Avatar.scss";

type AvatarProps = {
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  size: number; // size in pixels
};

const Avatar: React.FC<AvatarProps> = ({ avatarUrl, firstName, lastName, email, size }) => {
  const [initials, setInitials] = useState<string>("");

  useEffect(() => {
    const generateInitials = () => {
      if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
      } else if (firstName) {
        return firstName[0].toUpperCase();
      } else if (email) {
        return email[0]?.toUpperCase() || "";
      }
      return "";
    };
    setInitials(generateInitials());
  }, [firstName, lastName, email]);

  return (
    <div
      className="avatar rounded-circle d-flex align-items-center justify-content-center"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.4}px`,
        backgroundColor: avatarUrl ? "transparent" : "#6c757d",
        overflow: "hidden",
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-100 h-100 object-fit-cover rounded-circle"
        />
      ) : (
        <span className="text-white fw-bold">{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
