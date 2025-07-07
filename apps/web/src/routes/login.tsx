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
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: async () => {
    const { data, error } = await tuyau.auth.me.$get()
    if (error) {
      throw new Error(error.value.message)
    }
    return data
  },
})

function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Login mutation
  const { mutate, error, isPending } = useMutation({
    mutationFn: async (formData: LoginFormData) => {
      // Make the API call using tuyau
      const { data, error } = await tuyau.auth.login.$post({
        email: formData.email,
        password: formData.password,
      })

      // console.log("mutation", data, new Error(error))

      if (error) {
        throw new Error(error.value.message)
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
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      // Validate the form data
      mutate(value)
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte pour continuer
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
                  const result = z.string().min(1, 'Password is required').safeParse(value)
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
                    placeholder="Votre mot de passe"
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
              {isPending ? 'Connexion...' : 'Se connecter'}
            </Button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Vous n'avez pas de compte ?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Créer un compte
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 