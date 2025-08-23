import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import CustomerLayout from "../../components/common/layouts/CustomerLayout";

const MyProfile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "Nigeria",
    state: "",
    address: "",
    profilePicture: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        nationality: user.nationality || "Nigeria",
        state: user.state || "",
        address: user.address || "",
        profilePicture: null,
      });
    }
  }, [user]);

  // Handle file upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")
    ) {
      setFormData({ ...formData, profilePicture: selectedFile });
      setError("");
    } else {
      setError("Please upload a JPEG or PNG image.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) formDataToSend.append(key, formData[key]);
      });

      await updateProfile(formDataToSend); // Replace with actual API
      setSuccess("✅ Profile updated successfully!");
    } catch (err) {
      setError("❌ Failed to update profile. Please try again.");
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nigerianStates = [
    "Lagos",
    "Abuja",
    "Kano",
    "Oyo",
    "Rivers",
    "Kaduna",
    "Delta",
    "Ogun",
    "Edo",
    "Enugu",
  ];

  return (
    <CustomerLayout>
      <div className="p-6 text-[#6b2d11]">
        <h1 className="text-3xl font-bold mb-2">Profile & Settings</h1>
        <p className="text-gray-600 mb-6">
          Manage your personal information and account preferences.
        </p>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Profile Picture */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow">
                {formData.profilePicture ? (
                  <img
                    src={URL.createObjectURL(formData.profilePicture)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-600" />
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-[#6b2d11] cursor-pointer">
                  <span className="underline">Change Photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {formData.profilePicture && (
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.profilePicture.name}
                  </p>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#6b2d11]">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#6b2d11]">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#6b2d11]">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#6b2d11]">
                  Nationality
                </label>
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
                >
                  <option value="Nigeria">Nigeria</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Kenya">Kenya</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#6b2d11]">
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
                >
                  <option value="">Select State</option>
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#6b2d11]">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 rounded-md bg-[#FDF1F2] shadow focus:outline-none focus:ring-2 focus:ring-[#6b2d11]"
                />
              </div>
            </div>

            {/* Feedback Messages */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && <p className="text-green-600 text-sm mt-2">{success}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 rounded-md bg-[#FDE1F7] hover:bg-[#fcd5f5] text-[#6b2d11] font-semibold shadow transition mt-4"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default MyProfile;
