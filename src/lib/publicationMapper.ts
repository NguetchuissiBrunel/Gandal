import type { PublicationRead } from '@/lib/apiClient';

export interface CatalogueProject {
  id: string;
  title: string;
  category: string;
  desc: string;
  href: string;
  lien?: string;
}

export function mapPublicationToCatalogueProject(pub: PublicationRead): CatalogueProject {
  return {
    id: pub.id.toString(),
    title: pub.nom,
    category: pub.photo?.trim() || 'Projet Académique',
    desc: pub.description?.trim() || 'Projet développé et hébergé sur le cluster GANDAL.',
    href: pub.lien?.trim() || '',
    lien: pub.lien?.trim() || undefined,
  };
}

export function buildCategoryFilters(projects: CatalogueProject[]): string[] {
  const cats = new Set(projects.map((p) => p.category).filter(Boolean));
  return ['Tout', ...Array.from(cats).sort()];
}
