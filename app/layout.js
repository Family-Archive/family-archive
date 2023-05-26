import './globals.scss'

import { headers } from 'next/headers'
import { Inter } from 'next/font/google'

import AuthContext from './(contexts)/AuthContext'
import { ModalProvider } from './(contexts)/ModalContext'
import NavBar from '@/components/NavBar/NavBar'

const inter = Inter({ subsets: ['latin'] })
export const metadata = {
  title: 'Family Archive',
  description: 'Save, catalogue, and share your family history',
}

const getSession = async cookie => {
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
    headers: {
      cookie,
    },
  })
  const session = await response.json()
  return Object.keys(session).length > 0 ? session : null
}

const RootLayout = async ({ children }) => {
  const session = await getSession(headers().get('cookie') ?? '');

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContext session={session}>
          <ModalProvider>
            {children}
          </ModalProvider>
        </AuthContext>
      </body>
    </html>
  )
}

export default RootLayout
