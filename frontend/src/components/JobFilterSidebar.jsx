// src/components/JobFilterSidebar.jsx
import React, { useState } from 'react';
import { 
  Filter, 
  MapPin, 
  Layers, 
  RotateCcw, 
  Globe, 
  Code2, 
  Database, 
  Cpu, 
  Megaphone, 
  Cloud,
  Smartphone,
  Bot,
  Building2,
  Shield,
  ChevronRight,
  ChevronDown,
  Check,
  X
} from 'lucide-react';

export const DOMAINS = [
  'Software & Web Development',
  'Data Science & Analytics',
  'AI & Machine Learning',
  'Cloud & DevOps',
  'Mobile App Development',
  'Robotic Process Automation (RPA)',
  'Enterprise Systems (ERP)',
  'Cyber Security',
  'Marketing & Business'
];

export const LOCATIONS = [
  'Remote',
  'Bangalore',
  'Pune',
  'Mumbai',
  'Hyderabad',
  'Delhi NCR'
];

// Helper icon by domain
const getDomainIcon = (domain) => {
  switch (domain) {
    case 'Software & Web Development':
      return <Code2 className="w-4 h-4" />;
    case 'Data Science & Analytics':
      return <Database className="w-4 h-4" />;
    case 'AI & Machine Learning':
    case 'Artificial Intelligence & Machine Learning':
      return <Cpu className="w-4 h-4" />;
    case 'Cloud & DevOps':
    case 'Cloud Computing & DevOps':
      return <Cloud className="w-4 h-4" />;
    case 'Mobile App Development':
      return <Smartphone className="w-4 h-4" />;
    case 'Robotic Process Automation (RPA)':
      return <Bot className="w-4 h-4" />;
    case 'Enterprise Systems (ERP)':
      return <Building2 className="w-4 h-4" />;
    case 'Cyber Security':
      return <Shield className="w-4 h-4" />;
    case 'Marketing & Business':
      return <Megaphone className="w-4 h-4" />;
    default:
      return <Layers className="w-4 h-4" />;
  }
};

export default function JobFilterSidebar({
  selectedDomains = [],
  onToggleDomain = () => {},
  selectedLocations = [],
  onToggleLocation = () => {},
  jobs = [],
  onClearFilters,
  isMobileDrawer = false,
  onCloseMobile = () => {}
}) {
  // Accordion open/collapse states (DEFAULT COLLAPSED)
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const hasActiveFilters = selectedDomains.length > 0 || selectedLocations.length > 0;
  const totalActiveCount = selectedDomains.length + selectedLocations.length;

  // Calculate job counts per domain and location
  const getDomainCount = (domain) => {
    return jobs.filter((j) => {
      const d = (j.domain || 'Software & Web Development').toLowerCase();
      const target = domain.toLowerCase();
      if (d === target) return true;
      if (domain === 'Software & Web Development' && d === 'software development') return true;
      if (domain === 'Data Science & Analytics' && d === 'data science') return true;
      if (domain === 'AI & Machine Learning' && (d === 'artificial intelligence & machine learning' || d === 'ai & ml')) return true;
      if (domain === 'Cloud & DevOps' && (d === 'cloud computing & devops' || d === 'cloud & devops')) return true;
      if (domain === 'Marketing & Business' && d === 'digital marketing') return true;
      return false;
    }).length;
  };

  const getLocationCount = (location) => {
    return jobs.filter((j) => j.location?.toLowerCase().includes(location.toLowerCase())).length;
  };

  return (
    <aside className={`bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs ${isMobileDrawer ? 'w-full' : 'w-full'}`}>
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-gray-150">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">Filter Jobs</h3>
            <p className="text-[11px] text-gray-500">
              {totalActiveCount > 0 ? `${totalActiveCount} filter(s) active` : 'Multi-select by domain & location'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
          {isMobileDrawer && (
            <button
              onClick={onCloseMobile}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Accordion Group 1: Job Domain (Default Collapsed) */}
      <div className="border-b border-gray-100 pb-3 mb-3">
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => setIsDomainOpen(!isDomainOpen)}
          className="w-full flex items-center justify-between py-2 text-left group focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider group-hover:text-orange-600 transition-colors">
              Job Domain
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {selectedDomains.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
                {selectedDomains.length} Selected
              </span>
            )}
            {isDomainOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-transform" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" />
            )}
          </div>
        </button>

        {/* Collapsible Multi-Select Checkboxes */}
        {isDomainOpen && (
          <div className="space-y-1.5 pt-2 animate-fade-in">
            {DOMAINS.map((domain) => {
              const isChecked = selectedDomains.includes(domain);
              const count = getDomainCount(domain);
              return (
                <label
                  key={domain}
                  onClick={() => onToggleDomain(domain)}
                  className={`w-full flex items-start justify-between gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-orange-50/90 text-orange-900 font-bold border border-orange-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    {/* Custom Styled Checkbox */}
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0 mt-0.5 ${
                      isChecked
                        ? 'bg-orange-500 border-orange-500 text-white shadow-2xs'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <span className={`shrink-0 mt-0.5 ${isChecked ? 'text-orange-600' : 'text-gray-400'}`}>
                      {getDomainIcon(domain)}
                    </span>
                    <span className="whitespace-normal break-words leading-tight text-sm">
                      {domain}
                    </span>
                  </div>
                  
                  <span className={`text-[10px] px-2 py-0.5 rounded-md shrink-0 font-bold mt-0.5 ${
                    isChecked
                      ? 'bg-orange-200/70 text-orange-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Accordion Group 2: Job Location (Default Collapsed) */}
      <div>
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => setIsLocationOpen(!isLocationOpen)}
          className="w-full flex items-center justify-between py-2 text-left group focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider group-hover:text-orange-600 transition-colors">
              Job Location
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {selectedLocations.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                {selectedLocations.length} Selected
              </span>
            )}
            {isLocationOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-transform" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" />
            )}
          </div>
        </button>

        {/* Collapsible Multi-Select Checkboxes */}
        {isLocationOpen && (
          <div className="space-y-1.5 pt-2 animate-fade-in">
            {LOCATIONS.map((loc) => {
              const isChecked = selectedLocations.includes(loc);
              const count = getLocationCount(loc);
              return (
                <label
                  key={loc}
                  onClick={() => onToggleLocation(loc)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-blue-50/90 text-blue-900 font-bold border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {/* Custom Styled Checkbox */}
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                      isChecked
                        ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <span className={isChecked ? 'text-blue-600' : 'text-gray-400'}>
                      {loc === 'Remote' ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    </span>
                    <span className="truncate">{loc}</span>
                  </div>
                  
                  <span className={`text-[10px] px-2 py-0.5 rounded-md shrink-0 font-bold ${
                    isChecked
                      ? 'bg-blue-200/70 text-blue-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

    </aside>
  );
}
