import React, { useState, useEffect } from "react";
// import EditPencil from "../../assets/icons/pencil.svg";
import "./ProfileAvatar.scss";
import { getInitials } from "../../utils/globalHelper";

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
    setInitials(getInitials({ firstName, lastName, email }));
  }, [firstName, lastName, email]);

  useEffect(() => {
    setAvatar(avatarUrl || null);
  }, [avatarUrl]);

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

  const handleRemoveAvatar = () => {
    setAvatar(null);
    if (onAvatarChange) onAvatarChange(null!); // Notify parent to handle removal
  };

  return (
    <div className="d-flex flex-column align-items-center">
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
        {/* <button
        className="btn p-0 edit-icon bg-light border-0 rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: "30px", height: "30px" }}
        onClick={() => setShowOptions(!showOptions)} // Toggle dropdown
      >
        <img src={EditPencil} alt="Edit" className="w-50 h-50" />
      </button>
      {showOptions && (
        <div className="avatar-options position-absolute bg-white border shadow p-2 rounded">
          <button
            className="btn btn-link text-dark text-start w-100"
            onClick={() =>
              document.querySelector<HTMLInputElement>(".avatar-input")?.click()
            }
          >
            Upload Photo
          </button>
          <button
            className="btn btn-link text-danger text-start w-100"
            onClick={handleRemoveAvatar}
          >
            Remove Photo
          </button>
          </div>
      )} */}
      </div>
      <div className="mt-2">
        {avatar ? (
          <button
            className="btn btn-link p-0 editProfile"
            onClick={handleRemoveAvatar}
          >
            Remove Profile
          </button>
        ) : (
          <button
            className="btn btn-link p-0 editProfile"
            onClick={() =>
              document.querySelector<HTMLInputElement>(".avatar-input")?.click()
            }
          >
            Upload Photo
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileAvatar;
