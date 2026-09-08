import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

const PdfExportModal = ({ isOpen, onClose, onExport }) => {
  const [dateMode, setDateMode] = useState('lifetime');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport({
      dateMode,
      startDate: dateMode === 'custom' ? startDate : null,
      endDate: dateMode === 'custom' ? endDate : null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Export PDF Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Period</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="dateMode" 
                  value="lifetime" 
                  checked={dateMode === 'lifetime'} 
                  onChange={() => setDateMode('lifetime')}
                  className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-sm text-gray-700">Lifetime</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="dateMode" 
                  value="custom" 
                  checked={dateMode === 'custom'} 
                  onChange={() => setDateMode('custom')}
                  className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-sm text-gray-700">Custom Range</span>
              </label>
            </div>
          </div>

          {dateMode === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={14} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={14} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button 
            onClick={handleExport}
            disabled={dateMode === 'custom' && (!startDate || !endDate)}
            className="px-4 py-2 bg-[#4F46E5] rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfExportModal;
