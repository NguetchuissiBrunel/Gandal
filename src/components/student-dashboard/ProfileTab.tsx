import React, { useState } from 'react';
import { Mail, GraduationCap, Building, Phone, Calendar, Camera, Save, X, Server, FileText, HardDrive } from 'lucide-react';

export default function ProfileTab() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: 'Sucre Zouzou',
    title: 'Étudiant - 4eme Année Genie Informatique',
    email: 'nzungangf@gmail.com',
    phone: '+237 697039654',
    matricule: '24GANDAL001',
    department: 'Département Informatique',
    joined: '27 Mai  2026'
  });

  const [editForm, setEditForm] = useState({ ...profile });

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({ ...profile });
    setIsEditing(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-500 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight">
          Mon Profil
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Gérez vos informations personnelles et académiques.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
        {/* Dynamic Header Cover */}
        <div className="h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
          {/* Abstract circles for decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-20 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
        </div>

        <div className="px-6 md:px-10 pb-10 relative">
          {/* Avatar and Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="relative -mt-16 group">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center overflow-hidden shadow-lg relative">
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </span>

                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-indigo-500/25 active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-xl text-sm font-bold transition-all"
                >
                  Modifier le profil
                </button>
              )}
            </div>
          </div>

          {/* Profile Name & Title */}
          <div className="mb-8">
            {isEditing ? (
              <div className="space-y-3 max-w-md">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-2xl font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-indigo-600 dark:text-indigo-400"
                />
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{profile.name}</h2>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-1">{profile.title}</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Info */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Mail className="w-4 h-4" />
                </span>
                Informations Personnelles
              </h3>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    {isEditing ? (
                      <input
                        type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md outline-none text-slate-900 dark:text-white focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{profile.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Téléphone</p>
                    {isEditing ? (
                      <input
                        type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md outline-none text-slate-900 dark:text-white focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{profile.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date d&apos;inscription</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{profile.joined}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <GraduationCap className="w-4 h-4" />
                </span>
                Informations Académiques
              </h3>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Matricule</p>
                    {isEditing ? (
                      <input
                        type="text" value={editForm.matricule} onChange={(e) => setEditForm({ ...editForm, matricule: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md outline-none text-slate-900 dark:text-white focus:border-purple-500"
                      />
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{profile.matricule}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                    <Building className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Département</p>
                    {isEditing ? (
                      <input
                        type="text" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md outline-none text-slate-900 dark:text-white focus:border-purple-500"
                      />
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{profile.department}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity / Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Server className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">VMs Actives</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">3</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <HardDrive className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Stockage Utilisé</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">105 GB</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Requêtes en cours</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
