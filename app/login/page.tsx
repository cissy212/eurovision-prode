import { LoginForm } from '@/components/auth/login-form'

export const metadata = { title: 'Join — Eurovision Prode 2026' }

export default function LoginPage() {
  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="text-6xl">🎤</div>
          <h1 className="text-3xl font-bold text-gradient-euro">Eurovision Prode 2026</h1>
          <p className="text-purple-300 text-sm">Predict the Top 10 · Pick your favourites · Beat your friends</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
