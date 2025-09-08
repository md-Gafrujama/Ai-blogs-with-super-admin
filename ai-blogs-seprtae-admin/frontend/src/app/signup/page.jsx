"use client";

import React, { useState } from "react";
import axios from "axios";
import { baseURL } from "@/config/api";

const Signup = () => {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${baseURL}/api/admin/signUp`,
        {
          company,
          email,
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("📌 Signup Response:", res.data);

      if (res.data.success) {
        alert("Signup successful!");
        setCompany("");
        setEmail("");
        setPassword("");
      } else {
        alert(res.data.message || "Signup failed");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      alert(err.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Signup</h2>

        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          type="text"
          placeholder="Enter your company name"
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter your email"
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Enter your password"
          className="w-full mb-3 p-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Signup
        </button>
      </form>
    </div>
  );
};

export default Signup;
