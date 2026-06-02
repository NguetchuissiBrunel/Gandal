import type { Metadata } from "next";
import "./globals.css";
import "../styles/chatbot.css";
import FloatingChatbot from "../components/FloatingChatbot";
import { ChatbotProvider } from "../contexts/ChatbotContext";

export const metadata: Metadata = {
  title: "GANDAL — Plateforme Data Center ENSPY",
  description:
    "Infrastructure locale de virtualisation et d'orchestration multi-agent pour les projets académiques du Département de Génie Informatique de l'ENSPY — Université de Yaoundé I.",
  keywords: [
    "GANDAL",
    "Data Center",
    "ENSPY",
    "Génie Informatique",
    "Université de Yaoundé",
    "Système Multi-Agent",
    "Virtualisation",
    "Orchestration",
    "GI27",
  ],
  authors: [{ name: "Promotion GI27 — ENSPY" }],
  openGraph: {
    title: "GANDAL — Plateforme Data Center ENSPY",
    description:
      "Plateforme d'orchestration multi-agent et de virtualisation des projets académiques de l'ENSPY.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <ChatbotProvider>
          {children}
          <FloatingChatbot />
        </ChatbotProvider>
      </body>
    </html>
  );
}
