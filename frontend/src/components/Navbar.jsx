import { NavLink, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/imageUrl";
import api from "../api/axios";
import logoImg from "../assets/logo.jpg";

const links = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/packages", label: "Packages" },
  { to: "/blog", label: "Blog" },
  { to: "/gallery", label: "Gallery" },
];

export default function Navbar() {
  const { user, role, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  function handleLogout() {
    logout();
    setProfileMenuOpen(false);
    setOpen(false);
    navigate("/");
  }

  const dashboardPath =
    role === "agency"
      ? "/agency/dashboard"
      : role === "admin"
      ? "/admin/dashboard"
      : null;

  // Get tourist's profile image
  const profileImage =
    role === "tourist" && user?.profile_image
      ? getImageUrl(user.profile_image)
      : "";

  // Get first letter if profile image doesn't exist
  const userInitial =
    user?.full_name?.charAt(0)?.toUpperCase() ||
    user?.agency_name?.charAt(0)?.toUpperCase() ||
    user?.username?.charAt(0)?.toUpperCase() ||
    "U";

  // Open file selector
  function handleChangePhotoClick() {
    fileInputRef.current?.click();
  }

  // Upload tourist profile image
  async function handleProfileImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG, JPEG and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    // Optional size limit: 5 MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Profile image must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);

    try {
      const response = await api.put(
        "/api/tourist/profile-image",
        formData
      );

      const updatedTourist = response.data.tourist;

      // Update AuthContext + localStorage
      updateUser({
        profile_image: updatedTourist.profile_image,
      });

      setProfileMenuOpen(false);

    } catch (error) {
      console.error("Profile image upload error:", error);

      const message =
        error.response?.data?.message ||
        "Failed to update profile image.";

      alert(message);
    } finally {
      setUploading(false);

      // Allows selecting the same image again
      event.target.value = "";
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-base-border bg-base-bg/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">

        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2"
          onClick={() => {
            setOpen(false);
            setProfileMenuOpen(false);
          }}
        >
          <img
            src={logoImg}
            alt="TourEase Nepal"
            className="h-11 w-auto rounded object-contain"
          />
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-accent-secondary"
                    : "text-text-muted hover:text-text-main"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">

          {/* Logged Out */}
          {!user && (
            <>
              <NavLink
                to="/login"
                className="text-sm font-medium text-text-muted hover:text-text-main"
              >
                Log in
              </NavLink>

              <NavLink
                to="/register"
                className="btn-primary px-4 py-2 text-sm"
              >
                Sign up
              </NavLink>
            </>
          )}

          {/* Tourist */}
          {user && role === "tourist" && (
            <>
              <NavLink
                to="/my-bookings"
                className="text-sm font-medium text-text-muted hover:text-text-main"
              >
                My Bookings
              </NavLink>

              {/* Tourist Profile */}
              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setProfileMenuOpen((value) => !value)
                  }
                  className="flex items-center gap-2 rounded-full border border-base-border bg-base-surface p-1 pr-3 transition hover:border-accent-secondary"
                >
                  {/* Avatar */}
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={user.full_name || "Profile"}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-secondary font-semibold text-base-bg">
                      {userInitial}
                    </div>
                  )}

                  <span className="max-w-28 truncate text-sm font-medium text-text-main">
                    {user.full_name}
                  </span>

                  <span className="text-xs text-text-muted">
                    ▼
                  </span>
                </button>

                {/* Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-base-border bg-base-card shadow-xl">

                    {/* Profile Header */}
                    <div className="border-b border-base-border px-4 py-4">

                      <div className="flex items-center gap-3">

                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={user.full_name || "Profile"}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-secondary text-lg font-semibold text-base-bg">
                            {userInitial}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-text-main">
                            {user.full_name}
                          </p>

                          <p className="truncate text-xs text-text-muted">
                            {user.email}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Change Photo */}
                    <button
                      type="button"
                      onClick={handleChangePhotoClick}
                      disabled={uploading}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text-main transition hover:bg-base-surface disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="text-lg">
                        {uploading ? "⏳" : "📷"}
                      </span>

                      <span>
                        {uploading
                          ? "Uploading..."
                          : "Change Profile Photo"}
                      </span>
                    </button>

                    {/* My Bookings */}
                    <NavLink
                      to="/my-bookings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-text-main transition hover:bg-base-surface"
                    >
                      <span className="text-lg">📋</span>
                      <span>My Bookings</span>
                    </NavLink>

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 border-t border-base-border px-4 py-3 text-left text-sm text-text-main transition hover:bg-base-surface"
                    >
                      <span className="text-lg">↪</span>
                      <span>Log out</span>
                    </button>

                  </div>
                )}

              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleProfileImageChange}
              />
            </>
          )}

          {/* Agency / Admin */}
          {user && dashboardPath && (
            <>
              <NavLink
                to={dashboardPath}
                className="text-sm font-medium text-text-muted hover:text-text-main"
              >
                Dashboard
              </NavLink>

              <button
                onClick={handleLogout}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Log out
              </button>
            </>
          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          className="text-2xl text-text-main md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>

      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="flex flex-col gap-1 border-t border-base-border bg-base-surface px-4 py-4 md:hidden">

          {/* Main Links */}
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-text-main hover:bg-base-card"
            >
              {link.label}
            </NavLink>
          ))}

          <div className="mt-2 flex flex-col gap-2 border-t border-base-border pt-3">

            {/* Logged Out */}
            {!user && (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-secondary w-full"
                >
                  Log in
                </NavLink>

                <NavLink
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full"
                >
                  Sign up
                </NavLink>
              </>
            )}

            {/* Logged In */}
            {user && (
              <>
                {/* Tourist Mobile Profile */}
                {role === "tourist" && (
                  <>
                    <div className="flex items-center gap-3 rounded-xl border border-base-border bg-base-card p-3">

                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={user.full_name || "Profile"}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-secondary text-lg font-semibold text-base-bg">
                          {userInitial}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-text-main">
                          {user.full_name}
                        </p>

                        <p className="truncate text-xs text-text-muted">
                          {user.email}
                        </p>
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={handleChangePhotoClick}
                      disabled={uploading}
                      className="btn-secondary w-full"
                    >
                      {uploading
                        ? "Uploading..."
                        : "📷 Change Profile Photo"}
                    </button>

                    <NavLink
                      to="/my-bookings"
                      onClick={() => setOpen(false)}
                      className="btn-secondary w-full"
                    >
                      My Bookings
                    </NavLink>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleProfileImageChange}
                    />
                  </>
                )}

                {/* Agency / Admin */}
                {dashboardPath && (
                  <NavLink
                    to={dashboardPath}
                    onClick={() => setOpen(false)}
                    className="btn-secondary w-full"
                  >
                    Dashboard
                  </NavLink>
                )}

                <button
                  onClick={handleLogout}
                  className="btn-primary w-full"
                >
                  Log out
                </button>
              </>
            )}

          </div>
        </div>
      )}
    </header>
  );
}