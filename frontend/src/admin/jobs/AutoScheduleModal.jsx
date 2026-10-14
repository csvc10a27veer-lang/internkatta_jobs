import React, { useState } from 'react';
import { X, Clock, Play, Pause, ShieldCheck, Target, Bell, Volume2, Sparkles, CheckCircle2, Globe, Calendar } from 'lucide-react';

const AutoScheduleModal = ({ isOpen, onClose, scheduleConfig, onSaveSchedule }) => {
  const [config, setConfig] = useState(scheduleConfig || {
    enabled: true,
    mode: 'daily', // 'daily' or 'interval'
    dailyTime: '09:00', // Everyday at 09:00 AM
    intervalMinutes: 60,
    platform: 'all',
    fresherOnly: true,
    deDuplicate: true,
    soundAlert: true
  });

  if (!isOpen) return null;

  const dailyTimePresets = [
    { label: '09:00 AM', value: '09:00', subtitle: 'Morning Shift' },
    { label: '01:00 PM', value: '13:00', subtitle: 'Afternoon' },
    { label: '06:00 PM', value: '18:00', subtitle: 'Evening' },
    { label: '11:00 PM', value: '23:00', subtitle: 'Night Sync' }
  ];

  const intervalPresets = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '6 hours', value: 360 },
    { label: '12 hours', value: 720 },
    { label: '24 hours', value: 1440 }
  ];

  const platforms = [
    { key: 'all', label: 'All Platforms (LinkedIn, Naukri, Glassdoor, Internshala & Indeed)' },
    { key: 'indeed', label: 'Indeed (Freshers & 0-1 Years Roles)' },
    { key: 'linkedin', label: 'LinkedIn (Tech & Corporate Openings)' },
    { key: 'naukri', label: 'Naukri.com (Indian MNCs & IT)' },
    { key: 'glassdoor', label: 'Glassdoor (Verified Companies)' },
    { key: 'internshala', label: 'Internshala (Internships & Freshers)' }
  ];

  const handleToggle = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSchedule(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col mx-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 backdrop-blur-xs rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Automated Daily Trigger Settings</h2>
              <p className="text-xs text-indigo-100">Set everyday trigger time to automatically scrape data</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-6">
          
          {/* Master Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${config.enabled ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {config.enabled ? <Play size={18} /> : <Pause size={18} />}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {config.enabled ? 'Automated Trigger is Active' : 'Automated Trigger is Paused'}
                </p>
                <p className="text-xs text-gray-500">
                  {config.enabled 
                    ? config.mode === 'daily'
                      ? `Triggering automatically everyday at ${config.dailyTime}`
                      : `Triggering automatically every ${config.intervalMinutes} minutes`
                    : 'Turn on to let the system automatically scrape data on schedule'}
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => handleToggle('enabled')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.enabled ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  config.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Section 1: Trigger Mode (Everyday Time vs Interval) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar size={14} className="text-indigo-600" />
              Schedule Mode
            </label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, mode: 'daily' }))}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  config.mode === 'daily'
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold shadow-xs'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <Calendar size={15} className="text-indigo-600" /> Everyday at Specific Time
                </p>
                <p className="text-[11px] text-gray-500 mt-1">Triggers once daily at your specified clock time</p>
              </button>

              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, mode: 'interval' }))}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  config.mode === 'interval'
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold shadow-xs'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <Clock size={15} className="text-indigo-600" /> Periodic Interval
                </p>
                <p className="text-[11px] text-gray-500 mt-1">Triggers automatically every X minutes/hours</p>
              </button>
            </div>

            {/* Mode A: Everyday Time Picker */}
            {config.mode === 'daily' ? (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800">Set Everyday Trigger Time:</label>
                  <span className="text-[11px] text-indigo-600 font-medium">Automatic daily execution</span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={config.dailyTime || '09:00'}
                    onChange={(e) => setConfig(prev => ({ ...prev, dailyTime: e.target.value }))}
                    className="px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-base font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-gray-500">Every single day at this time</span>
                </div>

                {/* Daily Presets */}
                <div>
                  <p className="text-[11px] font-medium text-gray-500 mb-1.5">Quick Presets:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {dailyTimePresets.map(preset => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, dailyTime: preset.value }))}
                        className={`py-1.5 px-2 text-xs rounded-lg font-medium border transition-colors cursor-pointer text-center ${
                          config.dailyTime === preset.value
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Mode B: Periodic Interval */
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <label className="text-xs font-bold text-gray-800 block">Select Periodic Interval:</label>
                <div className="grid grid-cols-3 gap-2">
                  {intervalPresets.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, intervalMinutes: p.value }))}
                      className={`py-2 text-xs rounded-lg font-medium border transition-colors cursor-pointer text-center ${
                        config.intervalMinutes === p.value
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Platform Target to Auto-Scrape */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe size={14} className="text-indigo-600" />
              Target Platforms to Auto-Scrape
            </label>
            <select
              value={config.platform}
              onChange={(e) => setConfig(prev => ({ ...prev, platform: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {platforms.map(p => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Section 3: Smart Automation Rules */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-600" />
              Smart Rules for Automated Scraping
            </label>
            
            <div className="space-y-2.5">
              {/* De-Duplication */}
              <div 
                onClick={() => handleToggle('deDuplicate')}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Smart De-Duplication Engine</p>
                    <p className="text-[11px] text-gray-500">
                      Skips previously scraped duplicate jobs to avoid cluttering your database.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.deDuplicate}
                  onChange={() => {}}
                  className="w-4 h-4 text-indigo-600 rounded-sm pointer-events-none"
                />
              </div>

              {/* Fresher Radar */}
              <div 
                onClick={() => handleToggle('fresherOnly')}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                    <Target size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Fresher Radar (0-1 Years Priority)</p>
                    <p className="text-[11px] text-gray-500">
                      Prioritizes entry-level openings, internships, and 0-1 years roles for students.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.fresherOnly}
                  onChange={() => {}}
                  className="w-4 h-4 text-indigo-600 rounded-sm pointer-events-none"
                />
              </div>

              {/* Sound & Alert */}
              <div 
                onClick={() => handleToggle('soundAlert')}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0 mt-0.5">
                    <Volume2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Sound Chime & Notification Alerts</p>
                    <p className="text-[11px] text-gray-500">
                      Plays audio chime and shows notification whenever new data is scraped.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.soundAlert}
                  onChange={() => {}}
                  className="w-4 h-4 text-indigo-600 rounded-sm pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 size={16} />
              Save Schedule Settings
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AutoScheduleModal;
