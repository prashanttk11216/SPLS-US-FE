import React, { useState, useEffect } from "react";
import EditPencil from "../../assets/icons/pencil.svg";
import "./ProfileAvatar.scss";


type ProfileAvatarProps = {
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  onAvatarChange?: (file: File) => void;
};

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarUrl,
  firstName,
  lastName,
  email,
  onAvatarChange,
}) => {
  const [avatar, setAvatar] = useState<string | null>(avatarUrl || null);
  const [initials, setInitials] = useState<string>("");

  // Generate initials from name or email
  useEffect(() => {
    const getInitials = () => {
      if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
      } else if (firstName) {
        return firstName[0].toUpperCase();
      } else if (email) {
        return email[0]?.toUpperCase() || "";
      }
      return "";
    };
    setInitials(getInitials());
  }, [firstName, lastName, email]);

  // Handle avatar file change
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result as string);
        if (onAvatarChange) onAvatarChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="avatar-container d-flex flex-column align-items-center position-relative mx-auto"
      style={{ width: "150px", height: "150px" }}
    >
      {avatar ? (
        <img
          src={avatar}
          alt="User Avatar"
          className="rounded-circle border border-secondary w-100 h-100 object-fit-cover"
        />
      ) : (
        <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center border border-secondary w-100 h-100">
          <span className="fs-1 fw-bold">{initials}</span>
        </div>
      )}
      <input
        type="file"
        name="avatarUrl"
        className="d-none avatar-input"
        accept="image/*"
        onChange={handleAvatarChange}
      />
      <button
        className="btn p-0 edit-icon bg-light border-0 rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: "30px", height: "30px" }}
        onClick={() =>
          document.querySelector<HTMLInputElement>(".avatar-input")?.click()
        }
      >
        <img src={EditPencil} alt="Edit" className="w-50 h-50" />
      </button>
    </div>
  );
};

export default ProfileAvatar;
