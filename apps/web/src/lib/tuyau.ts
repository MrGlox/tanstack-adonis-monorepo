import { createTuyau } from '@tuyau/client'
// import {superjson} from '@tuyau/superjson/plugin'

import { api, type ApiDefinition } from '@repo/api/tuyau'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

export const tuyau = createTuyau<{ definition: ApiDefinition }>({
  api,
  baseUrl: API_BASE_URL,

  plugins: [
    // superjson(),
  ],
})

// Re-export api for type inference
export { api } from '@repo/api/tuyau' 