import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { tuyau } from '@/lib/tuyau'

// Validation schema
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export const Route = createFileRoute('/register')({
  component: RegisterPage,
  beforeLoad: async () => {
    try {
      const { data, error } = await tuyau.auth.me.$get()
      if (!error) {
        // User is already authenticated, redirect to home
        throw new Error('Already authenticated')
      }
    } catch {
      // User is not authenticated, which is expected for register page
    }
  },
})

function RegisterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Register mutation
  const { mutate, error, isPending } = useMutation({
    mutationFn: async (formData: RegisterFormData) => {
      // Make the API call using tuyau
      const { data, error } = await tuyau.auth.register.$post({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        // Handle different error types from tuyau
        if (error.value && typeof error.value === 'object' && 'message' in error.value) {
          throw new Error(error.value.message as string)
        }
        throw new Error('Registration failed')
      }

      return data
    },
    onSuccess: () => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['user'] })

      // Navigate to dashboard or home
      navigate({ to: '/' })
    },
  })

  // Form setup
  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      // Validate the form data
      const validationResult = registerSchema.safeParse(value)
      if (!validationResult.success) {
        // Handle validation errors if needed
        return
      }
      mutate(value)
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            Rejoignez-nous en créant votre compte
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/10 dark:border-red-900/20 dark:text-red-400">
                {error.message}
              </div>
            )}

            <form.Field
              name="fullName"
              validators={{
                onBlur: ({ value }) => {
                  const result = z.string().min(2, 'Full name must be at least 2 characters').safeParse(value)
                  return result.success ? undefined : result.error.errors[0].message
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Nom complet</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    placeholder="Votre nom complet"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                    disabled={isPending}
                  />
                  {field.state.meta.errors && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="email"
              validators={{
                onBlur: ({ value }) => {
                  const result = z.string().email('Please enter a valid email').safeParse(value)
                  return result.success ? undefined : result.error.errors[0].message
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="votre@email.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                    disabled={isPending}
                  />
                  {field.state.meta.errors && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onBlur: ({ value }) => {
                  const result = z.string().min(6, 'Password must be at least 6 characters').safeParse(value)
                  return result.success ? undefined : result.error.errors[0].message
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Mot de passe</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    placeholder="Votre mot de passe (min. 6 caractères)"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                    disabled={isPending}
                  />
                  {field.state.meta.errors && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="confirmPassword"
              validators={{
                onBlur: ({ value }) => {
                  const passwordValue = form.getFieldValue('password')
                  if (value !== passwordValue) {
                    return "Passwords don't match"
                  }
                  const result = z.string().min(1, 'Please confirm your password').safeParse(value)
                  return result.success ? undefined : result.error.errors[0].message
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Confirmer le mot de passe</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    placeholder="Confirmez votre mot de passe"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                    disabled={isPending}
                  />
                  {field.state.meta.errors && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? 'Création...' : 'Créer mon compte'}
            </Button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Vous avez déjà un compte ?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 