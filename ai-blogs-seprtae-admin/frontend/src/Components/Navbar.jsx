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
            <div>
                <Link href="/" passHref>
                    <h1 className='text-xs sm:text-sm font-semibold text-gray-600 tracking-wider cursor-pointer hover:text-blue-700 transition-colors'>
                        B2B MARKETING
                    </h1>
                </Link>
            </div>

            {/* Right side - Logout button */}
            <div>
                <button
                    className='px-4 sm:px-6 py-2 bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-3xl hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Navbar