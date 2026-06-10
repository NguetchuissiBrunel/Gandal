'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import FeedbackBanner from '@/components/ui/FeedbackBanner';
import { apiClient, type PublicationRead } from '@/lib/apiClient';
import { getApiErrorMessage } from '@/lib/apiError';

interface PublicationEditModalProps {
  publicationId: number | null;
  onClose: () => void;
  onSaved: (updated: PublicationRead) => void;
}

export default function PublicationEditModal({
  publicationId,
  onClose,
  onSaved,
}: PublicationEditModalProps) {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [lien, setLien] = useState('');
  const [photo, setPhoto] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (publicationId == null) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const pub = await apiClient.getPublication(publicationId);
        if (cancelled) return;
        setNom(pub.nom);
        setDescription(pub.description || '');
        setLien(pub.lien || '');
        setPhoto(pub.photo || '');
        setStatus(pub.status);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Impossible de charger la publication'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (publicationId == null) return;
    if (!nom.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const updated = await apiClient.updatePublication(publicationId, {
        nom: nom.trim(),
        description: description.trim() || null,
        lien: lien.trim() || null,
        photo: photo.trim() || null,
        status,
      });
      onSaved(updated);
      onClose();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Mise à jour impossible'));
    } finally {
      setSubmitting(false);
    }
  };

  if (publicationId == null) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl max-h-[92vh] rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
            Modifier la publication
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-16">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
            <FeedbackBanner error={error} onDismissError={() => setError('')} />

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Titre *</label>
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Lien (URL)</label>
              <input
                type="url"
                value={lien}
                onChange={(e) => setLien(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Photo (URL)</label>
              <input
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-xs font-black uppercase rounded-xl disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
