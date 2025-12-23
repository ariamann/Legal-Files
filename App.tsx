import React from 'react';
import FileSystem from './components/FileSystem';

const App = () => {
  return (
    <div className="w-screen h-screen flex flex-col bg-black text-white overflow-hidden font-sans selection:bg-blue-500/50">
      <div className="flex-1 relative">
         <FileSystem />
      </div>
    </div>
  );
};

export default App;