import React from 'react';

const GenericProjectIllustration = ({ className = "w-full h-full" }) => {
    return (
        <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Soft decorative background shapes */}
            <circle cx="100" cy="100" r="90" fill="#EFF6FF" />
            <circle cx="150" cy="50" r="20" fill="#DBEAFE" opacity="0.6" />
            <circle cx="40" cy="160" r="30" fill="#DBEAFE" opacity="0.5" />
            <path d="M170 140 L190 150 L180 170 Z" fill="#FEE2E2" opacity="0.5" />

            {/* Laptop Base */}
            <path d="M30 145 H170 V152 A4 4 0 0 1 166 156 H34 A4 4 0 0 1 30 152 V145 Z" fill="#94A3B8" />
            <path d="M30 145 H170 V148 H30 V145 Z" fill="#64748B" />
            <path d="M85 148 H115 V150 H85 V148 Z" fill="#475569" />

            {/* Screen */}
            <rect x="42" y="60" width="116" height="85" rx="6" fill="#012065" />
            <rect x="46" y="64" width="108" height="73" rx="2" fill="#0F172A" />

            {/* Interface / Dashboard Elements */}
            {/* Sidebar */}
            <rect x="50" y="68" width="20" height="65" rx="2" fill="#1E293B" />
            <rect x="54" y="74" width="12" height="4" rx="2" fill="#3B82F6" />
            <rect x="54" y="84" width="8" height="3" rx="1.5" fill="#334155" />
            <rect x="54" y="92" width="10" height="3" rx="1.5" fill="#334155" />
            <rect x="54" y="100" width="7" height="3" rx="1.5" fill="#334155" />

            {/* Header */}
            <rect x="74" y="68" width="76" height="12" rx="2" fill="#1E293B" />
            <circle cx="82" cy="74" r="3" fill="#38BDF8" />
            <circle cx="140" cy="74" r="3" fill="#94A3B8" />

            {/* Content Area 1: Planning / Workflow (Kanban-ish) */}
            <rect x="74" y="84" width="34" height="24" rx="2" fill="#1E293B" />
            {/* Checkmark in box */}
            <rect x="78" y="88" width="6" height="6" rx="1" fill="#10B981" />
            <path d="M80 91 L81 92 L83 89" stroke="#FFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="88" y="89" width="14" height="4" rx="2" fill="#334155" />
            {/* Pending box */}
            <rect x="78" y="98" width="6" height="6" rx="1" fill="#F59E0B" />
            <rect x="88" y="99" width="10" height="4" rx="2" fill="#334155" />

            {/* Content Area 2: Code / Development */}
            <rect x="112" y="84" width="38" height="49" rx="2" fill="#1E293B" />
            {/* Lines of code */}
            <rect x="116" y="90" width="16" height="3" rx="1.5" fill="#F97316" /> {/* Orange accent */}
            <rect x="116" y="96" width="28" height="3" rx="1.5" fill="#38BDF8" />
            <rect x="122" y="102" width="22" height="3" rx="1.5" fill="#94A3B8" />
            <rect x="122" y="108" width="18" height="3" rx="1.5" fill="#10B981" />
            <rect x="116" y="114" width="24" height="3" rx="1.5" fill="#38BDF8" />

            {/* Content Area 3: Data / Analytics */}
            <rect x="74" y="112" width="34" height="21" rx="2" fill="#1E293B" />
            <path d="M78 126 L86 118 L92 122 L102 114" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="86" cy="118" r="2" fill="#F97316" /> {/* Orange accent */}
            <circle cx="92" cy="122" r="2" fill="#38BDF8" />
            <circle cx="102" cy="114" r="2" fill="#38BDF8" />

            {/* Floating Elements (Ideas, building, success) */}
            {/* Left side floating generic gear/build icon */}
            <circle cx="35" cy="70" r="14" fill="#FFFFFF" opacity="0.9" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }} />
            <path d="M35 63 V65 M35 75 V77 M28 70 H30 M40 70 H42 M30 65 L31.5 66.5 M38.5 73.5 L40 75 M40 65 L38.5 66.5 M31.5 73.5 L30 75" stroke="#012065" strokeWidth="2" strokeLinecap="round" />
            <circle cx="35" cy="70" r="4" stroke="#012065" strokeWidth="2" fill="none" />

            {/* Right side floating success icon */}
            <circle cx="170" cy="90" r="14" fill="#FFFFFF" opacity="0.9" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }} />
            <path d="M164 90 L168 94 L176 86" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Top right floating orange accent */}
            <path d="M145 35 L150 25 L155 35 L165 40 L155 45 L150 55 L145 45 L135 40 Z" fill="#F97316" opacity="0.8" />
        </svg>
    );
};

export default GenericProjectIllustration;
