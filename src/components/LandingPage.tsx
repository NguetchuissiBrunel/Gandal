'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from './Navbar';
import { useAuthSession } from '@/hooks/useAuthSession';
import { getDashboardPath } from '@/lib/authUtils';
import { apiClient } from '@/lib/apiClient';
import {
  mapPublicationToCatalogueProject,
  type CatalogueProject,
} from '@/lib/publicationMapper';
import {
  Shield,
  Zap,
  BarChart3,
  Server,
  Database,
  Activity,
  CheckCircle2,
  Users,
  GitBranch,
  ArrowUpRight,
  Globe,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function LandingPage({ initialSection }: { initialSection?: string }) {
  const { user, loading: authLoading } = useAuthSession();
  const isAuthenticated = !!user;
  const dashboardHref = user ? getDashboardPath(user) : '/dashboard';
  const [featuredProjects, setFeaturedProjects] = useState<CatalogueProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await apiClient.getPublicPublications({ size: 100 });
        setFeaturedProjects(
          (data.items || []).slice(0, 3).map(mapPublicationToCatalogueProject),
        );
      } catch {
        setFeaturedProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };
    loadFeatured();
  }, []);

  useEffect(() => {
    if (initialSection) {
      const element = document.querySelector(initialSection);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [initialSection]);

  return (
    <div className="relative w-full bg-white text-slate-900 font-sans overflow-hidden min-h-screen">
      <Navbar />

      {/* ── BACKGROUND GEOMETRIC ELEMENTS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>

        {/* === HERO ZONE (0–900px) === */}
        {/* Top-right large filled circle */}
        <div className="absolute -top-[140px] -right-[140px] w-[550px] h-[550px] rounded-full bg-blue-600/20 border border-blue-500/30" />
        {/* Top-right inner smaller ring */}
        <div className="absolute -top-[40px] -right-[40px] w-[280px] h-[280px] rounded-full border-[3px] border-blue-400/25" />
        {/* Top-left small accent dot */}
        <div className="absolute top-[80px] left-[8%] w-[60px] h-[60px] rounded-full bg-blue-500/35" />
        {/* Top-center faint large ring */}
        <div className="absolute top-[-80px] left-[30%] w-[400px] h-[400px] rounded-full border border-blue-500/10" />
        {/* Right-side mid accent */}
        <div className="absolute top-[300px] right-[8%] w-[120px] h-[120px] rounded-full bg-blue-500/20 border border-blue-400/20" />
        {/* Left floating mid circle */}
        <div className="absolute top-[550px] -left-[180px] w-[420px] h-[420px] rounded-full bg-blue-500/15 border border-blue-400/20" />
        {/* Tiny dots cluster top-left */}
        <div className="absolute top-[200px] left-[20%] w-[24px] h-[24px] rounded-full bg-blue-600/40" />
        <div className="absolute top-[240px] left-[22%] w-[12px] h-[12px] rounded-full bg-blue-400/50" />
        <div className="absolute top-[180px] left-[24%] w-[18px] h-[18px] rounded-full bg-blue-500/35" />

        {/* === CONTEXT SECTION (900–1800px) === */}
        {/* Large center-right circle */}
        <div className="absolute top-[950px] right-[-200px] w-[600px] h-[600px] rounded-full bg-blue-600/12 border border-blue-500/18" />
        {/* Dashed ring center-left */}
        <div className="absolute top-[1000px] -left-[80px] w-[320px] h-[320px] rounded-full border-[2px] border-dashed border-blue-500/20" />
        {/* Small solid left accent */}
        <div className="absolute top-[860px] left-[14%] w-[80px] h-[80px] rounded-full bg-blue-600/30" />
        {/* Mid accent right */}
        <div className="absolute top-[1250px] right-[12%] w-[100px] h-[100px] rounded-full bg-blue-500/25 border border-blue-400/20" />
        {/* Thick ring left */}
        <div className="absolute top-[1400px] -left-[60px] w-[250px] h-[250px] rounded-full border-[6px] border-blue-600/15" />
        {/* Faint giant ring center */}
        <div className="absolute top-[1100px] left-[20%] w-[700px] h-[700px] rounded-full border border-blue-500/6" />

        {/* === AGENTS SECTION (1800–2700px) === */}
        {/* Left medium filled */}
        <div className="absolute top-[1800px] -left-[120px] w-[380px] h-[380px] rounded-full bg-blue-500/15 border border-blue-400/18" />
        {/* Right small accent */}
        <div className="absolute top-[1950px] right-[9%] w-[110px] h-[110px] rounded-full bg-blue-600/22" />
        {/* Dashed ring right */}
        <div className="absolute top-[2100px] right-[-80px] w-[350px] h-[350px] rounded-full border-[3px] border-dashed border-blue-500/18" />
        {/* Tiny dot cluster agents zone */}
        <div className="absolute top-[2000px] left-[45%] w-[20px] h-[20px] rounded-full bg-blue-400/45" />
        <div className="absolute top-[2040px] left-[47%] w-[10px] h-[10px] rounded-full bg-blue-600/50" />
        <div className="absolute top-[2020px] left-[43%] w-[15px] h-[15px] rounded-full bg-blue-500/40" />
        {/* Center-left medium ring */}
        <div className="absolute top-[2300px] left-[8%] w-[280px] h-[280px] rounded-full border-[4px] border-blue-600/12" />

        {/* === ARCHITECTURE / TEAM SECTION (2700–3600px) === */}
        {/* Giant right background ring */}
        <div className="absolute top-[2700px] -right-[200px] w-[650px] h-[650px] rounded-full bg-blue-600/8 border border-blue-500/12" />
        {/* Left accent circle */}
        <div className="absolute top-[2900px] -left-[160px] w-[450px] h-[450px] rounded-full bg-blue-500/12" />
        {/* Center small accent */}
        <div className="absolute top-[3100px] left-[35%] w-[80px] h-[80px] rounded-full bg-blue-600/25" />
        {/* Dashed ring top of team section */}
        <div className="absolute top-[2800px] left-[5%] w-[300px] h-[300px] rounded-full border-[2px] border-dashed border-blue-400/15" />
        {/* Right small dot */}
        <div className="absolute top-[3200px] right-[18%] w-[50px] h-[50px] rounded-full bg-blue-500/30" />

        {/* === FOOTER / CTA ZONE (3600px+) === */}
        {/* Bottom-left giant filled */}
        <div className="absolute bottom-[300px] -left-[220px] w-[520px] h-[520px] rounded-full bg-blue-500/18" />
        {/* Bottom-right giant filled */}
        <div className="absolute -bottom-[280px] -right-[180px] w-[650px] h-[650px] rounded-full bg-blue-600/22 border border-blue-500/30" />
        {/* Bottom-center small accent */}
        <div className="absolute bottom-[600px] left-[45%] w-[90px] h-[90px] rounded-full bg-blue-600/28" />
        {/* Bottom-right ring */}
        <div className="absolute bottom-[200px] right-[12%] w-[200px] h-[200px] rounded-full border-[3px] border-blue-500/20" />
        {/* Tiny bottom dot cluster */}
        <div className="absolute bottom-[900px] right-[25%] w-[16px] h-[16px] rounded-full bg-blue-400/45" />
        <div className="absolute bottom-[880px] right-[27%] w-[10px] h-[10px] rounded-full bg-blue-600/50" />
      </div>

      {/* ── HERO SECTION (Centered, Only Text & Buttons) ── */}
      <section className="relative pt-44 pb-24 px-6 lg:px-8 max-w-4xl mx-auto text-center animate-fade-in" style={{ zIndex: 10 }}>
        <div className="space-y-8 flex flex-col items-center">

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-black tracking-tight leading-[1.1]">
            Data Center Local &amp;
            <span className="block text-blue-600 mt-2">
              Supervision Multi-Agent
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            Conçu pour l'<strong>École Nationale Supérieure Polytechnique de Yaoundé (ENSPY)</strong>. Centralisez, hébergez et supervisez intelligemment les projets étudiants pour assurer une passation fluide et préserver la valeur académique.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md pt-4">
            {authLoading ? (
              <div className="h-14 w-full max-w-xs mx-auto rounded-xl bg-slate-100 animate-pulse" />
            ) : isAuthenticated ? (
              <Link
                href={dashboardHref}
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-black transition-all duration-300 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 text-center flex items-center justify-center gap-2"
              >
                Accéder à mon espace
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-black transition-all duration-300 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 text-center flex items-center justify-center gap-2 w-full max-w-xs mx-auto"
              >
                Connexion
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Cameroon Academic Identity */}
          <div className="pt-8 border-t border-slate-200/80 w-full max-w-lg mt-6">
            <p className="text-sm font-bold text-black">Université de Yaoundé I</p>
            <p className="text-xs text-slate-500">Département de Génie Informatique • Promotion 2026–2027</p>
          </div>
        </div>
      </section>

      {/* ── CONTEXT SECTION ── */}
      <section id="contexte" className="relative py-24 bg-slate-50/60 border-y border-slate-200/50" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">

            <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight">
              Pourquoi avoir conçu GANDAL ?
            </h2>
            <p className="text-slate-600">
              À l'École Nationale Supérieure Polytechnique de Yaoundé (ENSPY), des dizaines de projets étudiants d'excellence sont produits chaque année, mais font face à des défis majeurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                01
              </div>
              <h3 className="text-lg font-bold text-black">Dispersion des projets</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Les travaux pratiques, projets d'UE et mémoires sont souvent stockés sur des ordinateurs individuels, clés USB ou comptes personnels, compliquant grandement leur centralisation.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                02
              </div>
              <h3 className="text-lg font-bold text-black">Perte de continuité</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sans plateforme officielle, il est difficile pour les promotions suivantes de reprendre, d'améliorer ou d'étudier les projets de leurs prédécesseurs.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                03
              </div>
              <h3 className="text-lg font-bold text-black">Besoin d'indépendance</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dépendre d'infrastructures de cloud public entraîne des coûts récurrents élevés et une dépendance critique à la stabilité de la connexion internet externe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MULTI-AGENTS ROLES SECTION ── */}
      <section id="features" className="relative py-24 px-6 lg:px-8 max-w-7xl mx-auto" style={{ zIndex: 10 }}>
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight">
            Une orchestration intelligente et autonome
          </h2>
          <p className="text-slate-600">
            Des agents logiciels spécialisés collaborent en permanence selon la spécification FIPA pour assurer le bon fonctionnement de l'infrastructure locale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Agent Maître */}
          <div className="group relative bg-white p-8 rounded-2xl border border-slate-200 hover:border-black transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 font-black">
              AM
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Agent Maître</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Il coordonne l'ensemble des autres agents. Il analyse les demandes de création, d'arrêt ou de migration d'environnements et prend les décisions d'orchestration globales.
            </p>
          </div>

          {/* Agent de Supervision */}
          <div className="group relative bg-white p-8 rounded-2xl border border-slate-200 hover:border-black transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 font-black">
              AS
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Agent de Supervision</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Surveille en continu l'usage des ressources physiques et virtuelles (CPU, RAM, espace disque et activité réseau) de chaque nœud du cluster.
            </p>
          </div>

          {/* Agent de Déploiement */}
          <div className="group relative bg-white p-8 rounded-2xl border border-slate-200 hover:border-black transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 font-black">
              AD
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Agent de Déploiement</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Automatise l'initialisation des machines virtuelles ou conteneurs pour les projets soumis. Il configure les réseaux isolés et alloue les ressources définies.
            </p>
          </div>

          {/* Agent de Communication */}
          <div className="group relative bg-white p-8 rounded-2xl border border-slate-200 hover:border-black transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 font-black">
              AC
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Agent de Communication</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Gère l'échange de messages structurés FIPA-ACL entre les nœuds physiques du cluster pour garantir une synchronisation et une coopération parfaites.
            </p>
          </div>

          {/* Agent de Migration */}
          <div className="group relative bg-white p-8 rounded-2xl border border-slate-200 hover:border-black transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 font-black">
              AMi
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Agent de Migration</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Déplace automatiquement et à chaud les machines virtuelles vers des nœuds moins chargés en cas d'anomalies de performance détectées par l'agent de supervision.
            </p>
          </div>

          {/* Agent de Sécurité */}
          <div className="group relative bg-white p-8 rounded-2xl border border-slate-200 hover:border-black transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 font-black">
              ASec
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Agent de Sécurité</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Assure l'authentification stricte des utilisateurs, l'isolation réseau entre les projets et la journalisation sécurisée de toutes les activités de l'infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE SECTION ── */}
      <section id="architecture" className="relative py-20 bg-slate-50 border-y border-slate-200/60" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left Graphics of Cluster */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2">
                  <Server className="w-8 h-8 text-blue-600" />
                  <p className="text-xl font-black text-black">Cluster Local</p>
                  <p className="text-xs text-slate-500">Mutualisation de serveurs physiques locaux reliés par commutateur (Switch Gbit).</p>
                </div>

                <div className="p-6 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2">
                  <Database className="w-8 h-8 text-blue-600" />
                  <p className="text-xl font-black text-black">Virtualisation</p>
                  <p className="text-xs text-slate-500">Isolation par machines virtuelles (VM) et conteneurs pour chaque projet étudiant.</p>
                </div>

                <div className="p-6 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-emerald-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plateforme d'Administration</p>
                      <p className="text-sm font-bold text-black">Supervision Grafana &amp; Agents intégrés</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>

            {/* Right Copy */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight leading-tight">
                Une architecture distribuée, locale et hautement disponible
              </h2>
              <p className="text-slate-600">
                La solution GANDAL combine une couche de virtualisation de bas niveau avec une intelligence logicielle répartie (Système Multi-Agent) pour automatiser la gestion des ressources locales disponibles.
              </p>

              <ul className="space-y-3 pt-2">
                {[
                  "Isolement strict des projets TP et de promotion",
                  "Sauvegardes de bases de données et code source centralisées",
                  "Passation documentée d'une promotion académique à l'autre",
                  "Répartition dynamique de charge via les Agents de Migration",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS SECTION ── */}
      <section id="projets" className="relative py-24 px-6 lg:px-8 max-w-7xl mx-auto" style={{ zIndex: 10 }}>
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Data Center GANDAL
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight mt-3">
            Projets Hébergés &amp; Disponibles
          </h2>
          <p className="text-slate-600 text-sm md:text-base">
            Découvrez les applications et services de haut niveau développés par les élèves-ingénieurs de l'ENSPY, actuellement déployés et supervisés en local sous le contrôle autonome des agents de GANDAL.
          </p>
        </div>

        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-pulse"
              >
                <div className="h-52 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-lg w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-black transition-all duration-300 flex flex-col"
              >
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <Image
                    src="/long-hallway-with-row-servers-center.jpg"
                    alt={project.title}
                    fill
                    className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/90 text-blue-700 border border-blue-100">
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-4 flex-grow">
                  <h3 className="text-lg font-black text-black group-hover:text-blue-600 transition-colors leading-snug">
                    {project.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed flex-grow">{project.desc}</p>
                  {project.href ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-black uppercase tracking-wider transition-all duration-200 group-hover:translate-x-1"
                    >
                      Voir le projet
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <Link
                      href="/projects"
                      className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-black uppercase tracking-wider transition-all duration-200 group-hover:translate-x-1"
                    >
                      Voir le catalogue
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white rounded-3xl border border-slate-200 p-12 space-y-3">
            <p className="text-slate-500 text-sm">
              Aucune publication publique pour le moment. Consultez le catalogue ou publiez votre
              projet depuis votre espace étudiant.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-black uppercase tracking-wider"
            >
              Ouvrir le catalogue
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Catalog CTA */}
        <div className="text-center mt-12">
          <a
            href="/projects"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-black text-white hover:bg-blue-600 font-bold rounded-xl transition-all duration-300 shadow-md shadow-slate-900/10 hover:-translate-y-0.5"
          >
            Explorer le Catalogue Complet
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ── DIRECTION TEAM SECTION ── */}
      <section className="relative py-24 px-6 lg:px-8 max-w-7xl mx-auto" style={{ zIndex: 10 }}>
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">

          <h2 className="text-3xl font-black text-black tracking-tight">
            Encadrement académique et technique
          </h2>
          <p className="text-slate-600">
            Ce projet est développé au sein du Département de Génie Informatique sous la supervision de :
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: "Pr. Batchakui Bernabé", title: "Directeur de Projet", role: "Supervision" },
            { name: "Ing. Foupouagnigni Nassair", title: "Encadreur Technique", role: "Assistant Supervision " },
            { name: "Ing. Tedongmouo Abel", title: "Encadreur Technique", role: "Assistant Supervision" },
            { name: "Ing. Mbo Alain", title: "Encadreur Technique", role: "Assistant Supervision" },
          ].map((member, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
              <p className="font-black text-lg text-black">{member.name}</p>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{member.title}</p>
              <p className="text-xs text-slate-500">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section id="cta" className="relative py-16 px-6 lg:px-8 max-w-6xl mx-auto text-center" style={{ zIndex: 10 }}>
        <div className="relative bg-black rounded-3xl p-12 md:p-16 text-white overflow-hidden shadow-2xl border-2 border-slate-800">

          {/* Opaque blue circles inside black box */}
          <div className="absolute top-[-40px] left-[-40px] w-48 h-48 rounded-full bg-blue-600/30 blur-2xl pointer-events-none" />
          <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 rounded-full bg-blue-500/20 pointer-events-none" />
          <div className="absolute top-4 right-12 w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30" />

          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              Génie Informatique ENSPY
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Centralisez vos projets d'ingénierie dès maintenant
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Déposez vos codes sources, documentations techniques et configurez vos environnements d'exécution virtuels sous le contrôle autonome des agents de supervision GANDAL.
            </p>

            {!authLoading && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                {isAuthenticated ? (
                  <Link
                    href={dashboardHref}
                    className="px-8 py-4 bg-white text-black hover:bg-blue-600 hover:text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Mon tableau de bord
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="px-8 py-4 bg-white text-black hover:bg-blue-600 hover:text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Connexion à mon espace
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative bg-black text-white pt-20 pb-12 border-t border-slate-900" style={{ zIndex: 10 }}>

        {/* Footer background circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute bottom-[-100px] left-[-100px] w-[350px] h-[350px] rounded-full bg-blue-900/40 border border-blue-800/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8 pb-12 border-b border-slate-900">

          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Gandal Project Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-base font-black tracking-wider">GANDAL DATA CENTER</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
              Infrastructure locale de virtualisation et d'orchestration multi-agent pour les projets académiques du Département de Génie Informatique de l'École Nationale Supérieure Polytechnique de Yaoundé (ENSPY).
            </p>
          </div>

          {[
            {
              title: 'Acteurs',
              items: ['Espace Étudiants', 'Portail Enseignants', 'Accès Chercheurs', 'Console Administrateur'],
            },
            {
              title: 'Système Multi-Agent',
              items: ['Spécifications FIPA', 'Agent de Déploiement', 'Agent de Supervision', 'Agent de Migration'],
            },
            {
              title: 'Institution',
              items: ['ENSPY Yaoundé', 'Université de Yaoundé I', 'Département Génie Informatique', 'Promotion GI27'],
            },
          ].map((col, idx) => (
            <div key={idx} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">{col.title}</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-400">
                {col.items.map((item, i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-blue-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs font-medium gap-4">
          <p>© 2026 GANDAL Data Center • ENSPY Yaoundé. Tous droits réservés.</p>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => {
                sessionStorage.removeItem('gandal_intro_seen');
                window.location.reload();
              }}
              className="text-slate-500 hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-bold uppercase tracking-wider"
            >
              Revoir l'intro
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-slate-600">Projet de promotion GI27</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
