"use client";
import React, { useEffect, useState } from 'react'
import { assets, dashboard_data } from '@/Assets/assets'
import { useAppContext } from '@/context/AppContext'
import toast from 'react-hot-toast'
const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        blogs: 0,
        comments: 0,
        drafts: 0,
        recentBlogs: [],
        companyBlogCounts: {}
    })

    const [companySorting, setCompanySorting] = useState('alphabetical')
    const [approvedCompanies, setApprovedCompanies] = useState([])
    const [selectedCompany, setSelectedCompany] = useState('')
    const { axios } = useAppContext()

    const fetchDashboard = async () => {
        try {
            const { data } = await axios.get(`${baseURL}/api/admin/dashboard`)
            data.success ? setDashboardData(data.dashboardData) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Fetch approved companies
    const fetchApprovedCompanies = async () => {
        try {
            const res = await axios.get(`${baseURL}/api/super-admin/getRequests`)
            const data = res.data
            if (Array.isArray(data)) {
                setApprovedCompanies(data.filter(c => c.status === "approved"))
            } else if (Array.isArray(data.data)) {
                setApprovedCompanies(data.data.filter(c => c.status === "approved"))
            } else {
                setApprovedCompanies([])
            }
        } catch (error) {
            setApprovedCompanies([])
        }
    }

    const handleCompanyChange = (e) => {
        setSelectedCompany(e.target.value)
    }

    // Get company count from companyBlogCounts object
    const getCompanyCount = () => {
        return Object.keys(dashboardData.companyBlogCounts || {}).length
    }

    // Get blog count for selected company
    const getSelectedCompanyBlogCount = () => {
        if (!selectedCompany) return '';
        return dashboardData.companyBlogCounts[selectedCompany] || 0;
    }

    useEffect(() => {
        fetchDashboard()
        fetchApprovedCompanies()
    }, [])

    return (
        <div className='w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
            {/* Header Section */}
            <div className="mb-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                        Super Admin Dashboard
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Monitor and manage your platform's performance
                    </p>
                </div>
            </div>

            {/* Stats Cards Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8'>
                {/* Total Companies Card */}
                <div className='group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 cursor-pointer transform hover:-translate-y-1'>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors'>
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div className='text-right'>
                            <p className='text-2xl sm:text-3xl font-bold text-gray-900'>{approvedCompanies.length}</p>
                            <p className='text-xs sm:text-sm text-gray-500 font-medium'>Total Companies</p>
                        </div>
                    </div>
                    <div className='flex items-center text-green-600 text-xs sm:text-sm'>
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className='font-medium'>Approved & Active</span>
                    </div>
                </div>

                {/* Blog Count Card */}
                <div className='group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-200 cursor-pointer transform hover:-translate-y-1'>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors'>
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className='text-right'>
                            <p className='text-2xl sm:text-3xl font-bold text-gray-900'>
                                {selectedCompany ? getSelectedCompanyBlogCount() : dashboardData.comments}
                            </p>
                            <p className='text-xs sm:text-sm text-gray-500 font-medium'>
                                {selectedCompany ? 'Company Blogs' : 'Total Blogs'}
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center text-blue-600 text-xs sm:text-sm'>
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className='font-medium'>Published Content</span>
                    </div>
                </div>

                {/* Active Companies Card */}
                <div className='group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-purple-200 cursor-pointer transform hover:-translate-y-1'>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors'>
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className='text-right'>
                            <p className='text-2xl sm:text-3xl font-bold text-gray-900'>{getCompanyCount()}</p>
                            <p className='text-xs sm:text-sm text-gray-500 font-medium'>Active Bloggers</p>
                        </div>
                    </div>
                    <div className='flex items-center text-purple-600 text-xs sm:text-sm'>
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        <span className='font-medium'>Content Creators</span>
                    </div>
                </div>

                {/* Drafts Card */}
                <div className='group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-orange-200 cursor-pointer transform hover:-translate-y-1'>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors'>
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div className='text-right'>
                            <p className='text-2xl sm:text-3xl font-bold text-gray-900'>{dashboardData.drafts}</p>
                            <p className='text-xs sm:text-sm text-gray-500 font-medium'>Draft Posts</p>
                        </div>
                    </div>
                    <div className='flex items-center text-orange-600 text-xs sm:text-sm'>
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className='font-medium'>Pending Review</span>
                    </div>
                </div>
            </div>

            {/* Company Selection Section */}
            <div className='bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
                    <div>
                        <h2 className='text-xl sm:text-2xl font-bold text-gray-900 mb-2'>Company Analytics</h2>
                        <p className='text-gray-600 text-sm sm:text-base'>Select a company to view detailed statistics</p>
                    </div>
                    <div className='mt-4 sm:mt-0'>
                        <div className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                            {approvedCompanies.length} Active Companies
                        </div>
                    </div>
                </div>
                
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* Company Selector */}
                    <div className='space-y-4'>
                        <label htmlFor="approved-companies" className='block text-sm font-semibold text-gray-700'>
                            Select Company for Detailed View
                        </label>
                        <select
                            id="approved-companies"
                            className='w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all hover:border-gray-400 text-gray-900 appearance-none cursor-pointer'
                            value={selectedCompany}
                            onChange={handleCompanyChange}
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 0.5rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.5em 1.5em',
                                paddingRight: '2.5rem'
                            }}
                        >
                            <option value="">Choose a company...</option>
                            {approvedCompanies.map(company => (
                                <option key={company._id} value={company.company}>
                                    {company.company}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selected Company Info */}
                    {selectedCompany && (
                        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100'>
                            <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                                {selectedCompany} Overview
                            </h3>
                            <div className='space-y-2'>
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-600'>Total Blogs:</span>
                                    <span className='text-sm font-semibold text-gray-900'>{getSelectedCompanyBlogCount()}</span>
                                </div>
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-600'>Status:</span>
                                    <span className='text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium'>Active</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
