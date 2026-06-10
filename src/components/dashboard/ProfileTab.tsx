'use client';

import { useState } from 'react';
import {
  User,
  Mail,
  Hash,
  GraduationCap,
  Building2,
  Save,
  Bell,
  Award,
  CheckCircle2,
  AlertCircle,
  Pencil,
} from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import AvatarPickerModal from '@/components/ui/AvatarPickerModal';
import { useUserAvatar } from '@/hooks/useUserAvatar';

interface StudentInfo {
  id: number;
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
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const { avatarId, selectAvatar, clearAvatar } = useUserAvatar(
    studentInfo.id,
    studentInfo.username,
  );

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
      id: studentInfo.id,
      username,
      email,
      matricule,
      level,
      department,
    });

    setIsEditing(false);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">

      <div>
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Mon Profil Étudiant
        </h1>
        <p className="text-gray-500 text-xs md:text-sm font-medium">
          Gérez vos informations de compte, vos paramètres d'alerte et vos préférences d'affichage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm text-center space-y-4">
            <div className="relative mx-auto w-fit">
              <UserAvatar
                userId={studentInfo.id}
                username={studentInfo.username}
                size="lg"
                shape="rounded"
                variant="student"
                className="shadow-sm"
              />
              <button
                type="button"
                onClick={() => setAvatarPickerOpen(true)}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-900 hover:bg-black text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-colors"
                title="Changer l'avatar"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <h2 className="text-base font-black text-gray-900 truncate">
                {studentInfo.username}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Niveau {studentInfo.level} • {studentInfo.department}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 py-1 px-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl w-fit mx-auto text-[10px] font-black uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              Promotion GI27 ENSPY
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2.5">
              Statistiques d'utilisation
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                <span className="text-[9px] font-black text-gray-400 uppercase block tracking-wide">VMs Actives</span>
                <span className="text-lg font-black text-gray-900">{vmsCount} / 5</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                <span className="text-[9px] font-black text-gray-400 uppercase block tracking-wide">Projets soumis</span>
                <span className="text-lg font-black text-gray-900">{publicationsCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-base font-black text-gray-900 uppercase tracking-wider">
                Informations académiques
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all hover:-translate-y-0.5"
                >
                  Modifier
                </button>
              )}
            </div>

            {formSuccess && (
              <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-bold mb-4">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                <p>Profil mis à jour avec succès.</p>
              </div>
            )}

            {formError && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold mb-4">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                <p>{formError}</p>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Nom complet</label>
                    <div className="relative rounded-xl overflow-hidden">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-600 transition-all text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Mail institutionnel ENSPY</label>
                    <div className="relative rounded-xl overflow-hidden">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-600 transition-all text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Matricule Polytechnique</label>
                    <div className="relative rounded-xl overflow-hidden">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        readOnly
                        value={matricule}
                        title="Non modifiable via l'API"
                        className="w-full bg-gray-100 text-gray-600 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 cursor-not-allowed text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Année académique (Niveau)</label>
                    <div className="relative rounded-xl overflow-hidden">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-600 transition-all text-xs cursor-pointer"
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

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">Département de spécialité</label>
                  <div className="relative rounded-xl overflow-hidden">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-600 transition-all text-xs cursor-pointer"
                    >
                      <option value="Informatique">Génie Informatique</option>
                      <option value="Génie Télécommunications">Génie Télécommunications</option>
                      <option value="Génie Électrique">Génie Électrique</option>
                      <option value="Génie Civil">Génie Civil</option>
                    </select>
                  </div>
                </div>

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
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-[10px] uppercase tracking-wider rounded-xl border border-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-colors shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Sauvegarder
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-semibold">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide block">Nom complet</span>
                  <div className="flex items-center gap-2.5 text-gray-800 bg-gray-50 border border-gray-100 p-3 rounded-2xl">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{studentInfo.username}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide block">Mail institutionnel</span>
                  <div className="flex items-center gap-2.5 text-gray-800 bg-gray-50 border border-gray-100 p-3 rounded-2xl">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{studentInfo.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide block">Matricule Polytechnique</span>
                  <div className="flex items-center gap-2.5 text-gray-800 bg-gray-50 border border-gray-100 p-3 rounded-2xl">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span>{studentInfo.matricule}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide block">Niveau & Option</span>
                  <div className="flex items-center gap-2.5 text-gray-800 bg-gray-50 border border-gray-100 p-3 rounded-2xl">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span>Niveau {studentInfo.level} • {studentInfo.department}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preferences Section (only notifications, no theme) */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-4">
              Paramètres & Préférences
            </h3>

            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Alerte & Notifications</span>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notifVMState}
                      onChange={(e) => setNotifVMState(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 bg-white"
                    />
                    <div>
                      <span className="text-gray-800 font-bold block text-xs">Mise à jour des VMs</span>
                      <span className="text-[9px] text-gray-400 block font-medium">Être notifié en cas d'actions d'arrêt/démarrage par les agents.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notifRequests}
                      onChange={(e) => setNotifRequests(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 bg-white"
                    />
                    <div>
                      <span className="text-gray-800 font-bold block text-xs">Validation des requêtes</span>
                      <span className="text-[9px] text-gray-400 block font-medium">Être alerté dès qu'un administrateur valide ou rejette une requête.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {avatarPickerOpen && (
        <AvatarPickerModal
          userId={studentInfo.id}
          username={studentInfo.username}
          selectedId={avatarId}
          onSelect={(id) => {
            selectAvatar(id);
            setAvatarPickerOpen(false);
          }}
          onUseInitials={() => {
            clearAvatar();
            setAvatarPickerOpen(false);
          }}
          onClose={() => setAvatarPickerOpen(false)}
        />
      )}
    </div>
  );
}