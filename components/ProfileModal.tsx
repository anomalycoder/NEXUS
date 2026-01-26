import React, { useState } from 'react';
import { X, ShieldCheck, Award, Target, Briefcase, Edit2, Save, User, Fingerprint } from 'lucide-react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: 'Vigilante',
        role: 'Lead Security Analyst',
        id: 'NEX-8829-ALPHA',
        clearance: 'Level 5 Administrator',
        image: null as string | null
    });

    const [tempProfile, setTempProfile] = useState(profile);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempProfile({ ...tempProfile, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    const handleSave = () => {
        setProfile(tempProfile);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempProfile(profile);
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md border border-slate-200 dark:border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col relative max-h-[90vh] overflow-y-auto custom-scrollbar">

                {/* Header Background */}
                <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-600 shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 z-20 text-white/70 hover:text-white transition-colors bg-black/20 p-2 rounded-full backdrop-blur-sm">
                        <X size={20} />
                    </button>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 filter contrast-150 brightness-100 pointer-events-none"></div>
                </div>

                <div className="px-8 pb-8 relative flex-1">
                    {/* Avatar */}
                    <div className="relative w-24 h-24 -mt-12 mx-auto md:mx-0 mb-6">
                        <div className="w-24 h-24 bg-white dark:bg-[#0a0a0a] rounded-3xl border-4 border-white dark:border-[#0a0a0a] flex items-center justify-center shadow-xl overflow-hidden relative group">
                            {tempProfile.image || profile.image ? (
                                <img src={tempProfile.image || profile.image || ''} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-2xl font-black text-indigo-500">
                                    {profile.name.split(' ').map(n => n[0]).join('')}
                                </div>
                            )}

                            {/* Image Overlay in Edit Mode */}
                            {isEditing && (
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    <div className="text-white text-xs font-bold uppercase tracking-widest text-center">
                                        Change <br /> Photo
                                    </div>
                                </label>
                            )}
                        </div>

                        {/* Edit Toggle Button */}
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-white dark:border-[#0a0a0a]"
                            >
                                <Edit2 size={12} />
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">

                        {/* Profile Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Identity</label>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input
                                            value={tempProfile.name}
                                            onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Full Name"
                                        />
                                        <input
                                            value={tempProfile.role}
                                            onChange={(e) => setTempProfile({ ...tempProfile, role: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Role Title"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.name}</h2>
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                                            <Briefcase size={14} className="text-indigo-500" />
                                            <span>{profile.role}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Nexus ID */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                    <Fingerprint size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nexus ID</div>
                                    <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{profile.id}</div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200 dark:border-white/5 text-center shadow-sm">
                                <div className="flex items-center justify-center gap-2 text-emerald-500 mb-2">
                                    <Target size={20} />
                                </div>
                                <div className="text-2xl font-black text-slate-900 dark:text-white">1,204</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Threats Neutralized</div>
                            </div>

                            <div className="bg-white dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200 dark:border-white/5 text-center shadow-sm">
                                <div className="flex items-center justify-center gap-2 text-indigo-500 mb-2">
                                    <Award size={20} />
                                </div>
                                <div className="text-2xl font-black text-slate-900 dark:text-white">99.8%</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Accuracy Rating</div>
                            </div>
                        </div>

                        {/* Clearance */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Clearance Level</h3>
                            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl">
                                <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{profile.clearance}</div>
                                    <div className="text-xs text-slate-500 dark:text-white/50">Full Write Access to Neural Ledger</div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Actions */}
                        {isEditing && (
                            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/5 animate-in slide-in-from-bottom-2">
                                <button onClick={handleCancel} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 font-bold text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">Cancel</button>
                                <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25 text-sm flex items-center justify-center gap-2">
                                    <Save size={16} /> Save Changes
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;