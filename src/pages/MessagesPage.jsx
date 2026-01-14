import React from 'react';
import Navbar from '../../Components/Navbar';
import Messages from '../../Components/Messages';

const MessagesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <Navbar />
      <div className="pt-20 pb-8">
        <Messages />
      </div>
    </div>
  );
};

export default MessagesPage;
