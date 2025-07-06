# Configuration Tuyau + Ky Simple

Configuration Tuyau avec Ky en approche TypeScript simple et directe pour l'application LetMe Cook.

## Structure des Fichiers

### `lib/tuyau.ts`
Client Tuyau configuré avec :
- Configuration simple et directe
- Gestion automatique des cookies de session
- Hooks pour la journalisation et la gestion d'erreurs
- Gestion automatique des erreurs d'authentification (401)
- Utilitaires pour la gestion des tokens
- Endpoints API constants

### `lib/auth-service.ts`
Service d'authentification avec :
- Méthodes pour login/logout/register/checkAuth
- Gestion des erreurs avec messages localisés directs
- Stockage automatique des données utilisateur
- TODO : Migration vers les vraies routes Tuyau une fois générées

### `contexts/auth-context.tsx`
Contexte React pour :
- Gestion de l'état d'authentification global
- Gestion des erreurs avec messages localisés
- Intégration avec le service d'authentification
- États de chargement et d'erreur

## Configuration Tuyau

### Installation
```bash
# Backend (AdonisJS)
node ace add @tuyau/core

# Frontend (React)
pnpm add @tuyau/client ky
```

### Configuration Backend
Le package.json du backend doit exporter l'API Tuyau :
```json
{
  "exports": {
    "./api": "./.adonisjs/index.ts"
  }
}
```

Le frontend doit référencer le backend comme dépendance :
```json
{
  "dependencies": {
    "api": "workspace:*"
  }
}
```

### Génération des Types
```bash
# Dans le dossier backend
node ace tuyau:generate
```

## Utilisation

### Service d'Authentification
```typescript
import { authService } from '../lib/auth-service'

// Login
try {
  await authService.login({ email, password })
} catch (error) {
  console.error(error.message) // Message d'erreur localisé
}

// Vérifier l'authentification
const user = authService.getCurrentUser()
const isAuth = authService.isAuthenticated()
```

### Contexte d'Authentification
```typescript
import { useAuth } from '../contexts/auth-context'

function MyComponent() {
  const { user, isLoading, error, login, logout } = useAuth()
  
  if (isLoading) return <div>Chargement...</div>
  if (error) return <div>Erreur : {error}</div>
  
  return (
    <div>
      {user ? (
        <p>Bonjour {user.fullName}</p>
      ) : (
        <button onClick={() => login(email, password)}>
          Se connecter
        </button>
      )}
    </div>
  )
}
```

### Client Tuyau Direct
```typescript
import { tuyau, tuyauUtils, API_ENDPOINTS } from '../lib/tuyau'

// Une fois les routes générées, vous pourrez utiliser :
// const users = await tuyau.api.v1.users.$get()
// const result = await tuyau.api.v1.sessions.$post({ email, password })

// En attendant, utilisez les endpoints constants :
console.log(API_ENDPOINTS.AUTH.LOGIN) // '/api/v1/sessions'
```

### Configuration Simple
```typescript
// lib/tuyau.ts - Configuration directe
export const tuyau = createTuyau({
  api,
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3333',
  credentials: 'include',
  timeout: 30_000,
  retry: 3,
  // hooks...
})
```

## Fonctionnalités

### Gestion Automatique des Erreurs
- **401 Unauthorized** : Redirection automatique vers `/login`
- **5xx Server Errors** : Journalisation automatique
- **Network Errors** : Messages d'erreur localisés
- **Timeout Errors** : Gestion automatique des timeouts

### Hooks et Intercepteurs
- **beforeRequest** : Ajout automatique des tokens d'authentification
- **afterResponse** : Gestion des codes d'erreur et journalisation
- **beforeError** : Formatage des messages d'erreur

### Journalisation
- Journalisation automatique en développement (`import.meta.env.DEV`)
- Journalisation des requêtes, réponses et erreurs

### Stockage Local
- Gestion automatique des tokens et données utilisateur
- Nettoyage automatique lors de la déconnexion
- Clés de stockage simples : `'auth_token'`, `'user_data'`

## Migration vers Tuyau Complet

Actuellement, le service utilise fetch avec des constants simples. Une fois que les routes Tuyau sont correctement générées, vous pouvez :

1. Vérifier que les routes sont dans `.adonisjs/api.ts`
2. Remplacer les appels fetch par les méthodes Tuyau :

```typescript
// Au lieu de :
const response = await fetch(`${API_BASE_URL}/api/v1/users`, { ... })

// Utiliser :
const result = await tuyau.api.v1.users.$post(data)
```

## Endpoints API

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/sessions',
    LOGOUT: '/api/v1/sessions',
    CHECK: '/api/v1/sessions',
    REGISTER: '/api/v1/users',
  },
  USERS: {
    LIST: '/api/v1/users',
    CREATE: '/api/v1/users',
  }
} as const
```

## Problèmes Connus

### Routes Tuyau Non Générées
Si `node ace tuyau:generate` ne génère que la route Shopkeeper, vérifiez :
- Les contrôleurs sont bien dans `app/controllers/`
- Les routes utilisent la bonne syntaxe dans `start/routes.ts`
- Les imports des contrôleurs sont corrects

### Variables d'Environnement
Assurez-vous que `.env.local` contient :
```
VITE_API_URL=http://localhost:3333
```

## Avantages de cette Approche

1. **Simple** : Configuration directe sans surcouche
2. **Type-Safe** : Types TypeScript natifs
3. **Lisible** : Code plus direct et compréhensible
4. **Maintenable** : Moins de complexité
5. **Robuste** : Gestion d'erreurs et retry automatiques
6. **Développeur-Friendly** : Configuration explicite et claire

## Constantes et Types

```typescript
// Types exportés automatiquement
import type { User, AuthResponse } from '../lib/auth-service'
import type { InferResponseType, InferErrorType } from '@tuyau/client'

// Utilitaires Tuyau
import { tuyauUtils } from '../lib/tuyau'

// Endpoints
import { API_ENDPOINTS } from '../lib/tuyau'
``` 