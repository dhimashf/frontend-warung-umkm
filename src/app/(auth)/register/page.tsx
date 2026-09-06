"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

export default function RegisterPage() {
    const [noHp, setNoHp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // State for loading
    const router = useRouter();

    const validatePassword = (password: string) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasUpperCase && hasNumber && hasSpecialChar;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsLoading(true); // Start loading

        // Validate inputs
        if (noHp.length < 11 || noHp.length > 13) {
            setError("Nomor HP harus antara 11 dan 13 digit.");
            setIsLoading(false);
            return;
        }

        if (password.length < 8 || !validatePassword(password)) {
            setError("Password harus minimal 8 karakter dan memiliki huruf besar, angka, serta simbol.");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Password dan konfirmasi password tidak cocok.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_URL + "/api/akun/register",
                { no_hp: noHp, password: password }
            );

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                setTimeout(() => {
                    router.push("/login");
                }, 1500);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error("Error registering:", error);
            setError("Terjadi kesalahan saat registrasi.");
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-white text-black shadow-md rounded-2xl px-8 py-6">
                <h1 className="text-2xl font-bold text-primary text-center mb-2">Register</h1>
                <p className="text-sm text-gray-600 text-center mb-6">
                    Masukkan nomor telepon dan buat password Anda untuk melanjutkan.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="noHp" className="block text-gray-700 text-sm font-bold mb-2">
                            Nomor HP
                        </label>
                        <input
                            id="noHp"
                            type="tel"
                            placeholder="Contoh: 081234567890"
                            value={noHp}
                            maxLength={13}
                            onChange={(e) => setNoHp(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4 relative">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-10 text-gray-500"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <div className="mb-4 relative">
                        <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                            Konfirmasi Password
                        </label>
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Konfirmasi password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-10 text-gray-500"
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    {successMessage && <p className="text-green-500 text-xs mt-1">{successMessage}</p>}
                    <button
                        type="submit"
                        className={`w-full py-2 rounded-lg transition ${
                            isLoading ? "bg-gray-400" : "bg-primary hover:bg-opacity-80"
                        } text-white`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : "Lanjutkan"}
                    </button>
                    <p className="mt-4 text-sm text-gray-600 text-center">
                        Sudah memiliki akun?{" "}
                        <Link href="/login" className="text-primary font-semibold hover:underline">
                            Masuk
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
