import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Key, Mail, Save, AlertCircle, CheckCircle } from "lucide-react";

export default function Profile() {
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update profile");

      showMessage("success", "Profile updated successfully!");
      if (refreshUser) refreshUser();
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showMessage("error", "New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to change password");

      showMessage("success", "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-gray-400 mt-1">Update your account settings</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <User className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-lg font-semibold text-white">Profile Information</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black font-medium rounded-lg transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800">
            <p className="text-sm text-gray-500">
              Role: <span className="text-orange-400 font-medium">{user?.role}</span>
            </p>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Key className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-lg font-semibold text-white">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                minLength={6}
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800">
            <p className="text-xs text-gray-500">
              Password must be at least 6 characters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
