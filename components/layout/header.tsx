import Link from 'next/link'
import { getSessionUser } from '@/lib/session'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export async function Header() {
  const user = await getSessionUser()

  return (
    <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-purple-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
          <span className="text-2xl">🎤</span>
          <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-300 bg-clip-text text-transparent group-hover:from-pink-300 group-hover:to-purple-200 transition-all">
            Eurovision Prode
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-purple-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <span className="text-purple-600">|</span>
              <span className="text-sm text-purple-300 font-medium">{user.display_name}</span>
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="sm">Sign out</Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
