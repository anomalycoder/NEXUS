import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Award, Target, Briefcase, Edit2, Save, User, Fingerprint, Camera } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    isGhostMode?: boolean;
    profile: UserProfile;
    onUpdateProfile: (profile: UserProfile) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, isGhostMode, profile, onUpdateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState(profile);

    useEffect(() => {
        if (isOpen) {
            setTempProfile(profile);
            setIsEditing(false);
        }
    }, [isOpen, profile]);

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
        onUpdateProfile(tempProfile);
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
                        <div className="w-24 h-24 bg-white dark:bg-[#0a0a0a] rounded-2xl border-4 border-white dark:border-[#0a0a0a] flex items-center justify-center shadow-xl overflow-hidden relative group transition-transform hover:scale-105">
                            {tempProfile.image ? (
                                <img src={tempProfile.image} alt="Profile" className={`w-full h-full object-cover transition-all ${isGhostMode ? 'blur-md grayscale' : ''} ${isEditing ? 'opacity-50' : ''}`} />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-3xl font-black text-indigo-500">
                                    {isGhostMode ? <User size={36} /> : (tempProfile.name || 'V').charAt(0).toUpperCase()}
                                </div>
                            )}

                            {/* Image Overlay in Edit Mode */}
                            {isEditing && (
                                <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer hover:bg-black/70 transition-colors">
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    <Camera size={20} className="text-white mb-1" />
                                    <span className="text-[9px] font-bold text-white uppercase tracking-widest">Upload</span>
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
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Identity Details</label>
                                {isEditing ? (
                                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                                        <div>
                                            <label className="text-[10px] uppercase text-indigo-500 font-bold mb-1 block">Alias / Name</label>
                                            <input
                                                value={tempProfile.name}
                                                onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                                                className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all shadow-sm"
                                                placeholder="Enter operative alias"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-indigo-500 font-bold mb-1 block">Designation</label>
                                            <input
                                                value={tempProfile.role}
                                                onChange={(e) => setTempProfile({ ...tempProfile, role: e.target.value })}
                                                className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all shadow-sm"
                                                placeholder="Enter role designation"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                            {isGhostMode ? "Agent ████" : profile.name}
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                                            <Briefcase size={14} className="text-indigo-500" />
                                            <span>{isGhostMode ? "Anonymous Operative" : profile.role}</span>
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
                                    <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                                        {isGhostMode ? "[REDACTED]" : profile.id}
                                    </div>
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
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                                        {isGhostMode ? "Masked" : profile.clearance}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-white/50">
                                        {isGhostMode ? "Read-Only Proxy" : "Full Write Access to Neural Ledger"}
                                    </div>
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