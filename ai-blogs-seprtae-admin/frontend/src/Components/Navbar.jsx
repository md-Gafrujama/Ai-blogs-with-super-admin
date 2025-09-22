"use client";
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
const Navbar = () => {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        router.push('/'); // Redirect to login page
    };
    return (
        <div className='sticky top-0 z-50 flex justify-between items-center px-4 sm:px-6 py-4 sm:py-5 bg-white border-b border-gray-200 shadow-sm'>
            {/* Left side - B2B Marketing text */}
            <div className='ml-11'>
                <Link href="/" passHref>
                    <h1 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-widest cursor-pointer hover:scale-105 transition-transform duration-300">
                        B2B MARKETING
                    </h1>
                </Link>


              </div>

            {/* Right side - Logout button */}
            <div>
                <button
                    onClick={handleLogout}
                    className="mr-12 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-full shadow-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all"
                >
                    Logout
                </button>
            </div>

        </div>
    )
}

export default Navbar