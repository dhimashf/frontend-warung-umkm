"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icon mata

export default function ForgotPasswordPage() {
    const [no_hp, setno_hp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState(""); // Used for validation and backend error messages
    const [successMessage, setSuccessMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false); // State untuk mengatur visibilitas password
    const router = useRouter();

    // Validate password (uppercase, number, special character)
    const validatePassword = (password: string) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasUpperCase && hasNumber && hasSpecialChar;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(""); // Clear any previous errors
        setSuccessMessage("");
    
        // Log the phone number and new password
        console.log("No HP:", no_hp);
        console.log("Password Baru:", newPassword);
    
        // Validate phone number length
        if (no_hp.length < 11 || no_hp.length > 13) {
            setError("Nomor HP harus antara 11 dan 13 digit.");
            return;
        }
    
        // Validate password length and requirements
        if (newPassword.length < 8) {
            setError("Password harus minimal 8 karakter.");
            return;
        }
    
        if (!validatePassword(newPassword)) {
            setError("Password harus memiliki huruf besar, angka, dan simbol.");
            return;
        }
    
        // Forgot password API request (Axios)
        try {
            const response = await axios.put(
                process.env.NEXT_PUBLIC_API_URL + "/api/akun/lupa-password",
                { no_hp: no_hp, newPassword: newPassword }
            );
    
            if (response.data.success) {
                setSuccessMessage(response.data.message);
                setTimeout(() => {
                    router.push("/login"); // Redirect to login page
                }, 1500);
            } else {
                setError(response.data.message); // Display backend error message
            }
        } catch (error) {
            console.error(error); // log the error to the console
            setError("Terjadi kesalahan saat memperbarui password."); // Display network error
        }
    };
    

    const handleGoBackToLogin = () => {
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-white text-black shadow-md rounded-2xl px-8 py-6">
                <h1 className="text-2xl font-bold text-primary text-center mb-2">Ganti Password</h1>
                <p className="text-sm text-gray-600 text-center mb-6">
                    Masukkan nomor telepon dan password baru Anda untuk melanjutkan.
                </p>
                <form onSubmit={handleSubmit}>
                    {/* Phone number input */}
                    <div className="mb-4">
                        <label htmlFor="no_hp" className="block text-gray-700 text-sm font-bold mb-2">
                            Nomor HP
                        </label>
                        <input
                            id="no_hp"
                            type="tel"
                            placeholder="Contoh: 081234567890"
                            value={no_hp}
                            maxLength={13}
                            onChange={(e) => setno_hp(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* New Password input */}
                    <div className="mb-4 relative">
                        <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">
                            Password Baru
                        </label>
                        <input
                            id="newPassword"
                            type={showPassword ? "text" : "password"} // Toggle password visibility
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Masukkan password baru"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                            className="absolute top-12 right-4 transform -translate-y-1/2 text-gray-600"
                        >
                            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                    </div>

                    {/* Error or success message */}
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    {successMessage && <p className="text-green-500 text-xs mt-1">{successMessage}</p>}

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-opacity-80 transition"
                    >
                        Ganti Password
                    </button>
                </form>

                {/* Back to login button */}
                <div className="mt-2 text-center">
                    <button
                        onClick={handleGoBackToLogin}
                        className="text-primary hover:text-opacity-80 text-sm"
                    >
                        Kembali ke Login
                    </button>
                </div>
            </div>
        </div>
    );
}
