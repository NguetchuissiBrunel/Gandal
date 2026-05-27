'use client';

import { useState } from 'react';
import { 
  User, 
  Mail, 
  Hash, 
  GraduationCap, 
  Building2, 
  Save, 
  Moon, 
  Sun, 
  Bell, 
  Award,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface StudentInfo {
  username: string;
  matricule: string;
  level: string;
  department: string;
  email: string;
}

interface ProfileTabProps {
  studentInfo: StudentInfo;
  vmsCount: number;
  publicationsCount: number;
  onUpdateProfile: (info: StudentInfo) => void;
}

const AVATARS = [
  '👩‍💻', '👨‍💻', '🚀', '🧠', '⚙️', '🤖', '🎓', '🌐'
];

export default function ProfileTab({ 
  studentInfo, 
  vmsCount, 
  publicationsCount,
  onUpdateProfile 
}: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(studentInfo.username);
  const [email, setEmail] = useState(studentInfo.email);
  const [matricule, setMatricule] = useState(studentInfo.matricule);
  const [level, setLevel] = useState(studentInfo.level);
  const [department, setDepartment] = useState(studentInfo.department);
  const [selectedAvatar, setSelectedAvatar] = useState('👨‍💻');
  
  // Settings
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifVMState, setNotifVMState] = useState(true);
  const [notifRequests, setNotifRequests] = useState(true);

  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!username.trim() || !email.trim() || !matricule.trim()) {
      setFormError('Tous les champs obligatoires doivent être renseignés.');
      return;
    }

    if (!email.includes('@enspy-uy1.cm') && !email.includes('@')) {
      setFormError('L\'adresse mail de Polytechnique Yaoundé doit être valide.');
      return;
    }

    onUpdateProfile({
      username,
      email,
      matricule,
      level,
      department
    });

    setIsEditing(false);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
          Mon Profil Étudiant
        </h1>
        <p className="text-slate-500 text-xs md:text-sm font-medium">
          Gérez vos informations de compte, vos paramètres d'alerte et vos préférences d'affichage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: VISUAL PROFILE CARD & STATS */}
        <div className="space-y-6">
          {/* Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-center space-y-4">
            {/* Avatar Selector/Display */}
            <div className="relative w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-4xl mx-auto shadow-sm">
              <span>{selectedAvatar}</span>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-900 text-white dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] cursor-pointer" title="Changer l'icône">
                ✏️
              </div>
            </div>

            {/* Avatar chooser when editing */}
            {isEditing && (
              <div className="flex justify-center gap-1.5 flex-wrap p-2.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base border transition-all cursor-pointer ${
                      selectedAvatar === av
                        ? 'border-blue-600 bg-white dark:bg-slate-900 shadow-sm scale-110'
                        : 'border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-900'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            )}

            <div>
              <h2 className="text-base font-black text-slate-950 dark:text-white truncate">
                {studentInfo.username}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Niveau {studentInfo.level} • {studentInfo.department}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 py-1 px-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 rounded-xl w-fit mx-auto text-[10px] font-black uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              Promotion GI27 ENSPY
            </div>
          </div>

          {/* Stats Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2.5">
              Statistiques d'utilisation
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl">
                <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wide">VMs Actives</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{vmsCount} / 5</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl">
                <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wide">Projets soumis</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{publicationsCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACCOUNT INFO & SETTINGS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit / View Profile details */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4 mb-6">
              <h3 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider">
                Informations académiques
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  Modifier
                </button>
              )}
            </div>

            {formSuccess && (
              <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 rounded-2xl text-xs text-emerald-700 dark:text-emerald-450 font-bold mb-4">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                <p>Profil mis à jour avec succès.</p>
              </div>
            )}

            {formError && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs text-red-650 dark:text-red-400 font-bold mb-4">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                <p>{formError}</p>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-450 block">Nom complet</label>
                    <div className="relative rounded-xl overflow-hidden group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-600 transition-all text-xs"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-450 block">Mail institutionnel ENSPY</label>
                    <div className="relative rounded-xl overflow-hidden group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-600 transition-all text-xs"
                      />
                    </div>
                  </div>

                  {/* Matricule */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-450 block">Matricule Polytechnique</label>
                    <div className="relative rounded-xl overflow-hidden group">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={matricule}
                        onChange={(e) => setMatricule(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-600 transition-all text-xs"
                      />
                    </div>
                  </div>

                  {/* Level */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-450 block">Année académique (Niveau)</label>
                    <div className="relative rounded-xl overflow-hidden group">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-600 transition-all text-xs cursor-pointer"
                      >
                        <option value="1">Niveau 1</option>
                        <option value="2">Niveau 2</option>
                        <option value="3">Niveau 3</option>
                        <option value="4">Niveau 4 (GI4)</option>
                        <option value="5">Niveau 5 (GI5)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-450 block">Département de spécialité</label>
                  <div className="relative rounded-xl overflow-hidden group">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-600 transition-all text-xs cursor-pointer"
                    >
                      <option value="Informatique">Génie Informatique</option>
                      <option value="Génie Télécommunications">Génie Télécommunications</option>
                      <option value="Génie Électrique">Génie Électrique</option>
                      <option value="Génie Civil">Génie Civil</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormError('');
                      setUsername(studentInfo.username);
                      setEmail(studentInfo.email);
                      setMatricule(studentInfo.matricule);
                      setLevel(studentInfo.level);
                      setDepartment(studentInfo.department);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-350 font-bold text-[10px] uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-850 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Sauvegarder
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-semibold">
                
                {/* Full name view */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block">Nom complet</span>
                  <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{studentInfo.username}</span>
                  </div>
                </div>

                {/* Email view */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block">Mail institutionnel</span>
                  <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{studentInfo.email}</span>
                  </div>
                </div>

                {/* Matricule view */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block">Matricule Polytechnique</span>
                  <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <span>{studentInfo.matricule}</span>
                  </div>
                </div>

                {/* Level / Dept view */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block">Niveau & Option</span>
                  <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <span>Niveau {studentInfo.level} • {studentInfo.department}</span>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Preferences Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-4">
              Paramètres généraux & Préférences
            </h3>

            <div className="space-y-4 text-xs font-semibold">
              {/* Theme Preference Toggle */}
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div className="space-y-0.5">
                  <span className="text-slate-800 dark:text-slate-200 font-bold block">Thème visuel de l'interface</span>
                  <span className="text-[10px] text-slate-450 font-medium">Basculez entre le mode clair et le mode sombre.</span>
                </div>
                
                <button
                  onClick={() => {
                    const newTheme = theme === 'light' ? 'dark' : 'light';
                    setTheme(newTheme);
                    // Dynamically toggle Tailwind dark class on html
                    if (newTheme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-250 dark:border-slate-800 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  {theme === 'light' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Mode Clair</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-blue-400" />
                      <span>Mode Sombre</span>
                    </>
                  )}
                </button>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-2">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Alerte & Notifications</span>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notifVMState}
                      onChange={(e) => setNotifVMState(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer"
                    />
                    <div>
                      <span className="text-slate-850 dark:text-slate-250 font-bold block text-xs">Mise à jour des VMs</span>
                      <span className="text-[9px] text-slate-400 block font-medium">Être notifié en cas d'actions d'arrêt/démarrage par les agents.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notifRequests}
                      onChange={(e) => setNotifRequests(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer"
                    />
                    <div>
                      <span className="text-slate-850 dark:text-slate-250 font-bold block text-xs">Validation des requêtes</span>
                      <span className="text-[9px] text-slate-400 block font-medium">Être alerté dès qu'un administrateur valide ou rejette une requête.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
