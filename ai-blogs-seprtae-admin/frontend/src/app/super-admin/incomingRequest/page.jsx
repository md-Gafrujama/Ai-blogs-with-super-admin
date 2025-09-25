'use client'

import React, { useEffect, useState } from 'react'

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

const SuperAdminPanel = () => {
  const [registrations, setRegistrations] = useState([])
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true);
  const [deleted , setDeleted] = useState(false);

  // Fetch registrations from API
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/super-admin/getRequests`)
        const data = await res.json()
        setRegistrations(Array.isArray(data) ? data : data.data || data || [])
      } catch (err) {
        setRegistrations([])
      } finally {
        setLoading(false)
      }
    }
    fetchRegistrations()
  }, [])

  // Filter registrations based on status
  const filteredRegistrations = registrations.filter(reg => 
    filterStatus === 'all' || reg.status === filterStatus
  )

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏱️'
      case 'approved': return '✅'
      case 'rejected': return '❌'
      default: return '📋'
    }
  }

const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to delete this request?")) return;

  try {
    const response = await fetch(
      `${NEXT_PUBLIC_BASE_URL}/api/super-admin/deleteRequest/${id}`, // <-- id in params
      {
        method: "DELETE",
      }
    );

    const data = await response.json();
    setDeleted(true);
    console.log("Delete success:", data);

    if (data.success) {
      // remove from state directly instead of refetch
      setRegistrations((prev) => prev.filter((reg) => reg._id !== id && reg.id !== id));
      alert("Request deleted successfully!");
    } else {
      alert(data.message || "Failed to delete request");
    }
  } catch (error) {
    console.error("Error deleting request:", error);
    alert("Error deleting request. Please try again.");
  }
};


  const handleStatusChange = async (registrationId, newStatus, rejectionReason = '') => {
    setIsProcessing(true)
    try {
      const res = await fetch(
        `${NEXT_PUBLIC_BASE_URL}/api/super-admin/approveRequest/${registrationId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, rejectionReason }),
        }
      )
      const data = await res.json()
      if (data.success) {
        // Optionally, refetch registrations from server for up-to-date data
        const refreshed = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/super-admin/getRequests`)
        const refreshedData = await refreshed.json()
        setRegistrations(Array.isArray(refreshedData) ? refreshedData : refreshedData.data || refreshedData || [])
        setShowModal(false)
        setSelectedRegistration(null)
        alert(`Registration ${newStatus} successfully!`)
      } else {
        alert(data.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating registration status. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const openRegistrationModal = (registration) => {
    setSelectedRegistration(registration)
    setShowModal(true)
  }

  const RegistrationModal = () => {
    const [rejectionReason, setRejectionReason] = useState('')
    const [actionType, setActionType] = useState('')

    if (!selectedRegistration) return null

    const handleAction = (action) => {
      setActionType(action)
      if (action === 'approve') {
        handleStatusChange(selectedRegistration._id || selectedRegistration.id, 'approved')
      } else if (action === 'reject') {
        if (!rejectionReason.trim()) {
          alert('Please provide a reason for rejection')
          return
        }
        handleStatusChange(selectedRegistration._id || selectedRegistration.id, 'rejected', rejectionReason)
      }
    }

    return (
      <div className="fixed inset-0 bg-gray-700/30 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Registration Review</h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Registration Details */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">Current Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedRegistration.status)}`}>
                  {getStatusIcon(selectedRegistration.status)} {selectedRegistration.status ? selectedRegistration.status.charAt(0).toUpperCase() + selectedRegistration.status.slice(1) : '-'}
                </span>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">👤</span>
                  Personal Information
                </h3>
                <div className="space-y-2 text-sm text-gray-800">
                  <div><span className="font-medium">Name:</span> {selectedRegistration.fullname}</div>
                  <div><span className="font-medium">Email:</span> {selectedRegistration.email}</div>
                  {/* If you add phone in your model, show it here */}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🏢</span>
                  Company Information
                </h3>
                <div className="space-y-2 text-sm text-gray-800">
                  <div><span className="font-medium">Company:</span> {selectedRegistration.company}</div>
                  <div><span className="font-medium">Business Type:</span> {selectedRegistration.businessType}</div>
                  <div><span className="font-medium">Submitted:</span> {formatDate(selectedRegistration.createdAt)}</div>
                </div>
              </div>
            </div>

            {/* Action Section - Only show for pending registrations */}
            {selectedRegistration.status === 'pending' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Take Action</h3>
                <div className="mb-4">
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection (required if rejecting):
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Please provide a detailed reason for rejection..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                  >
                    {isProcessing && actionType === 'approve' ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <span className="mr-2">✅</span>
                        Approve Registration
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={isProcessing}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                  >
                    {isProcessing && actionType === 'reject' ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <span className="mr-2">❌</span>
                        Reject Registration
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Review Information (for approved/rejected) */}
            {selectedRegistration.status !== 'pending' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Review Information</h3>
                <div className="text-sm text-gray-800 space-y-1">
                  <div><span className="font-medium">Reviewed At:</span> {formatDate(selectedRegistration.reviewedAt)}</div>
                  <div><span className="font-medium">Reviewed By:</span> {selectedRegistration.reviewedBy}</div>
                  {selectedRegistration.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                      <span className="font-medium text-red-800">Rejection Reason:</span>
                      <p className="text-red-700 mt-1">{selectedRegistration.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="text-2xl sm:text-3xl text-white">👨‍💼</div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Super Admin Panel</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            Manage Company Registration Requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📋</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-yellow-200 bg-yellow-50">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⏱️</div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {registrations.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-green-200 bg-green-50">
            <div className="flex items-center">
              <div className="text-2xl mr-3">✅</div>
              <div>
                <p className="text-sm font-medium text-green-800">Approved</p>
                <p className="text-2xl font-bold text-green-900">
                  {registrations.filter(r => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200 bg-red-50">
            <div className="flex items-center">
              <div className="text-2xl mr-3">❌</div>
              <div>
                <p className="text-sm font-medium text-red-800">Rejected</p>
                <p className="text-2xl font-bold text-red-900">
                  {registrations.filter(r => r.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label htmlFor="filter" className="text-sm font-semibold text-gray-700">
              Filter by Status:
            </label>
            <select
              id="filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 appearance-none cursor-pointer min-w-[200px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="all">All Registrations</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Registrations List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-lg text-gray-500">Loading...</div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations found</h3>
              <p className="text-gray-600">No registrations match the current filter.</p>
            </div>
          ) : (
            <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Business Type
                    </th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRegistrations.map((registration, index) => (
                    <tr key={registration._id || registration.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-3 lg:px-6 py-4">
                        <div className="max-w-[200px]">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {registration.company}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {registration.fullname}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-[200px]" title={registration.email}>
                          {registration.email}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4">
                        <span className="inline-flex px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {registration.businessType || '-'}
                        </span>
                      </td>
                      <td className="px-3 lg:px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(registration.status)}`}>
                          <span className="mr-1">{getStatusIcon(registration.status)}</span>
                          {registration.status ? registration.status.charAt(0).toUpperCase() + registration.status.slice(1) : '-'}
                        </span>
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-[120px] truncate" title={formatDate(registration.createdAt)}>
                          {formatDate(registration.createdAt)}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4">
                        <div className="flex flex-col xl:flex-row xl:space-x-2 space-y-1 xl:space-y-0">
                          <button
                            onClick={() => openRegistrationModal(registration)}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(registration._id || registration.id)}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 hover:text-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredRegistrations.map((registration) => (
                <div key={registration._id || registration.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">{registration.company}</h3>
                      <p className="text-sm text-gray-600">{registration.fullname}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(registration.status)}`}>
                      {getStatusIcon(registration.status)} {registration.status ? registration.status.charAt(0).toUpperCase() + registration.status.slice(1) : '-'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-600">{registration.email}</span></div>
                    <div><span className="font-medium text-gray-700">Business Type:</span> <span className="text-gray-600">{registration.businessType || '-'}</span></div>
                    <div><span className="font-medium text-gray-700">Submitted:</span> <span className="text-gray-600">{formatDate(registration.createdAt)}</span></div>
                  </div>
                  
                  <div className="flex space-x-3 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => openRegistrationModal(registration)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelete(registration._id || registration.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </div>

        {/* Registration Modal */}
        {showModal && <RegistrationModal />}
      </div>
  )
}

export default SuperAdminPanel