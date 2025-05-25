import React from 'react';
import { MessageCircle } from "lucide-react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

const MainHeader = () => {
  return (
    <header className="flex items-center bg-gray-900 p-1 shadow-xl z-10 animate-fade-in-down-header w-full">

      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-violet-600 text-lg font-bold">
  <IoChatbubbleEllipsesOutline size={20} />
</div>

      <h1 className="text-xl font-extrabold text-violet-400 tracking-wide">Chatgram</h1>
      {/* You can add more elements to the right of the header here if needed */}
    </header>
  );
};

export default MainHeader;