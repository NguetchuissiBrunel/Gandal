# Chatbot Flottant GANDAL

## 🤖 Description

Le chatbot flottant GANDAL est un assistant virtuel intégré à la plateforme qui aide les utilisateurs à naviguer et utiliser les fonctionnalités de l'application.

## ✨ Fonctionnalités

### 🎯 Fonctionnalités principales
- **Icône flottante draggable** - Peut être déplacée partout sur l'écran
- **Interface de chat responsive** - S'adapte automatiquement aux écrans mobiles et desktop
- **Disponible sur toutes les pages** - Accessible depuis n'importe quelle page de l'application
- **Persistance de position** - Se souvient de sa position entre les sessions
- **Minimisation/Maximisation** - Peut être réduit pour économiser l'espace
- **Indicateur de frappe** - Montre quand l'assistant écrit une réponse

### 📱 Responsive Design
- **Desktop** : Interface complète avec toutes les fonctionnalités
- **Mobile** : Interface adaptée avec taille optimisée
- **Tablet** : Interface hybride qui s'adapte à l'orientation

## 🎨 Interface Utilisateur

### États du chatbot
1. **Icône fermée** : Cercle bleu avec icône de message
2. **Interface ouverte** : Fenêtre de chat complète
3. **Interface minimisée** : Barre de titre uniquement

### Interactions
- **Clic sur l'icône** : Ouvre l'interface de chat
- **Glisser-déposer** : Déplace le chatbot (icône ou barre de titre)
- **Bouton minimiser** : Réduit l'interface
- **Bouton fermer** : Ferme complètement le chatbot
- **Entrée** : Envoie le message
- **Maj + Entrée** : Nouvelle ligne dans le message

## 🧠 Capacités de l'Assistant

L'assistant GANDAL peut aider avec :

### Navigation
- Explication des différentes sections de la plateforme
- Guidance vers les bonnes pages
- Aide à la navigation

### Gestion des VMs
- Instructions pour créer des machines virtuelles
- Aide à la configuration des ressources
- Accès aux logs et monitoring

### Projets Académiques
- Gestion des publications
- Suivi des inscriptions étudiantes
- Aide à l'instanciation de projets

### Support Technique
- Résolution de problèmes courants
- Guidance pour les fonctionnalités avancées
- Redirection vers la documentation

## 🛠️ Implémentation Technique

### Structure des fichiers
```
src/
├── components/
│   └── FloatingChatbot.tsx    # Composant principal
├── hooks/
│   └── useChatbot.ts          # Hook pour les préférences
├── styles/
│   └── chatbot.css            # Styles spécifiques
└── app/
    └── layout.tsx             # Intégration globale
```

### Technologies utilisées
- **React 18** avec hooks
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes
- **LocalStorage** pour la persistance

## 🎛️ Configuration

### Personnalisation des réponses
Les réponses du bot peuvent être personnalisées dans la fonction `getBotResponse()` :

```typescript
const getBotResponse = (userInput: string): string => {
  const input = userInput.toLowerCase();
  
  // Ajouter de nouvelles conditions ici
  if (input.includes('nouveau-mot-clé')) {
    return 'Nouvelle réponse personnalisée';
  }
  
  // ... autres conditions
};
```

### Modification de l'apparence
Les styles peuvent être modifiés dans :
- `src/styles/chatbot.css` pour les styles spécifiques
- Classes Tailwind dans le composant pour les styles inline

### Position par défaut
La position initiale peut être configurée dans le composant :

```typescript
// Position par défaut (coin inférieur droit)
setPosition({
  x: window.innerWidth - (isMobile ? 80 : 420),
  y: window.innerHeight - (isMobile ? 80 : 520),
});
```

## 📱 Compatibilité

### Navigateurs supportés
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Appareils
- Desktop (Windows, macOS, Linux)
- Tablettes (iPad, Android)
- Smartphones (iOS, Android)

## 🔧 Maintenance

### Ajout de nouvelles fonctionnalités
1. Modifier le composant `FloatingChatbot.tsx`
2. Ajouter les styles nécessaires dans `chatbot.css`
3. Tester sur différentes tailles d'écran

### Mise à jour des réponses
1. Éditer la fonction `getBotResponse()`
2. Ajouter de nouveaux mots-clés et réponses
3. Tester les nouvelles interactions

### Optimisation des performances
- Les préférences sont sauvegardées localement
- Les animations utilisent CSS pour de meilleures performances
- Le composant est optimisé pour éviter les re-renders inutiles

## 🚀 Déploiement

Le chatbot est automatiquement inclus dans toutes les pages via le `layout.tsx` principal. Aucune configuration supplémentaire n'est nécessaire pour le déploiement.

## 📞 Support

Pour toute question ou problème avec le chatbot :
1. Vérifier cette documentation
2. Consulter les logs de la console navigateur
3. Contacter l'équipe de développement GANDAL