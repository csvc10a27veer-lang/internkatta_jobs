import React from 'react';
import { X, History, CheckCircle, ShieldCheck, Clock, Layers, Bot, Target, Linkedin, Briefcase, Building2, GraduationCap } from 'lucide-react';

const AutoScrapeHistoryModal = ({ isOpen, onClose, history, onClearHistory }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col mx-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Auto-Scrape Activity & Logs</h2>
              <p className="text-xs text-gray-500">Record of automated runs, time intervals, and ingested opportunities</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow space-y-4">
          
          {history.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bot size={24} />
              </div>
              <p className="font-semibold text-gray-800">No Automated Scraping Logs Yet</p>
              <p className="text-xs text-gray-500 mt-1">Runs triggered manually or automatically by timer will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((log, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-xl border border-gray-200 bg-white shadow-2xs hover:border-indigo-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {log.platformLabel || log.platform}
                        </span>
                        <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.2 rounded-full font-semibold">
                          Completed
                        </span>
                        {log.isScheduled && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.2 rounded-full font-semibold">
                            Auto-Timer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock size={12} /> {log.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 self-start sm:self-auto">
                    <div className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span>+{log.addedCount} new jobs</span>
                    </div>
                    {log.skippedCount > 0 && (
                      <div className="text-gray-500 flex items-center gap-1 border-l border-gray-200 pl-3">
                        <ShieldCheck size={12} className="text-indigo-500" />
                        <span>{log.skippedCount} dupes skipped</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
            >
              Clear Logs
            </button>
          )}
          <div className="flex-1"></div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 text-sm font-medium transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default AutoScrapeHistoryModal;
