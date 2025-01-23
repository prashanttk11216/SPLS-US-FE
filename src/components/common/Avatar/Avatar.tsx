import React, { useEffect, useState } from "react";
import "./Avatar.scss";
import { getInitials } from "../../../utils/globalHelper";

type AvatarProps = {
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  size: number; // size in pixels
};

const Avatar: React.FC<AvatarProps> = ({ avatarUrl, firstName, lastName, email, size }) => {
  const [initials, setInitials] = useState<string>("");
  const [avatar, setAvatar] = useState<string | null>(avatarUrl || null);
  
  useEffect(() => {
    setInitials(getInitials({firstName, lastName, email}));
  }, [firstName, lastName, email]);

   useEffect(() => {
    setAvatar(avatarUrl || null);
  }, [avatarUrl]);


  return (
    <div
      className="avatar rounded-circle d-flex align-items-center justify-content-center"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.4}px`,
        backgroundColor: avatar ? "transparent" : "#6c757d",
        overflow: "hidden",
      }}
    >
      {avatar ? (
        <img
          src={avatar}
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
