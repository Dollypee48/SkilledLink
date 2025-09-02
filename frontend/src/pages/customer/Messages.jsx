import React from 'react';
import CustomerLayout from '../../components/common/Layouts/CustomerLayout';

const CustomerMessages = () => {
  return (
    <CustomerLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Customer Messages</h1>
        <p>This is the customer messages page.</p>
      </div>
    </CustomerLayout>
  );
};

export default CustomerMessages;
