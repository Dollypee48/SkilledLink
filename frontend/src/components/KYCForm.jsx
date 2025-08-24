import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { kycService } from '../services/kycService';
import { UploadCloud, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const KYCForm = () => {
  const { user, accessToken, updateUser } = useAuth(); // Import updateUser
  const [idProof, setIdProof] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [message, setMessage] = useState({
    type: '',
    text: ''
  });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
    setMessage({ type: '', text: '' }); // Clear messages on file change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    if (!accessToken) {
      setMessage({ type: 'error', text: 'Authentication token missing.' });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    if (idProof) formData.append('idProof', idProof);
    if (addressProof) formData.append('addressProof', addressProof);
    if (user?.role === 'artisan' && credentials) formData.append('credentials', credentials);

    if (!idProof || !addressProof || (user?.role === 'artisan' && !credentials)) {
      setMessage({ type: 'error', text: 'Please upload all required documents.' });
      setLoading(false);
      return;
    }

    try {
      const res = await kycService.submitKYC(formData, accessToken);
      setMessage({ type: 'success', text: res.message });
      // Update the user in AuthContext with the new kycStatus and kycDocuments
      if (res.user) {
        updateUser(res.user);
      }
      // Optionally clear form fields or update user KYC status in AuthContext
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit KYC.' });
    } finally {
      setLoading(false);
    }
  };

  const renderFileInput = (label, file, setter, name) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          {file ? (
            <p className="text-sm text-gray-900">File selected: {file.name}</p>
          ) : (
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          )}
          <div className="flex text-sm text-gray-600 justify-center">
            <label
              htmlFor={name}
              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
            >
              <span>Upload a file</span>
              <input id={name} name={name} type="file" className="sr-only" onChange={(e) => handleFileChange(e, setter)} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">KYC Verification</h2>
      <p className="text-gray-600 mb-6">Please upload the required documents to verify your identity. Your KYC status is: <span className="font-semibold capitalize">{user?.kycStatus}</span></p>
      
      {user?.kycStatus === 'pending' && (
        <p className="bg-yellow-100 text-yellow-800 p-3 rounded-md mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" /> Your KYC documents are currently under review.
        </p>
      )}
      {user?.kycStatus === 'approved' && (
        <p className="bg-green-100 text-green-800 p-3 rounded-md mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" /> Your KYC has been successfully approved!
        </p>
      )}
      {user?.kycStatus === 'rejected' && (
        <p className="bg-red-100 text-red-800 p-3 rounded-md mb-4 flex items-center">
          <XCircle className="w-5 h-5 mr-2" /> Your previous KYC submission was rejected. Please re-submit the correct documents.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {renderFileInput("Government-Issued ID (Passport/Driver's License)", idProof, setIdProof, 'idProof')}
        {renderFileInput('Proof of Address (Utility Bill, Bank Statement)', addressProof, setAddressProof, 'addressProof')}
        
        {user?.role === 'artisan' && (
          renderFileInput('Professional Credentials (Trade License, Certification)', credentials, setCredentials, 'credentials')
        )}

        {message.text && (
          <div className={`py-2 px-3 rounded-md text-sm flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
            {message.text}
          </div>
        )}

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <UploadCloud className="w-5 h-5 mr-2" />
          )}
          {loading ? 'Submitting...' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  );
};

export default KYCForm;
