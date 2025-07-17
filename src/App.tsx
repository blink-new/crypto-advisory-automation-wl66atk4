import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'

interface User {
  id: string
  email: string
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // Handle pending subscription after successful auth
      if (state.user && !state.isLoading) {
        const pendingSubscription = localStorage.getItem('pendingSubscription')
        if (pendingSubscription) {
          try {
            const subscriptionData = JSON.parse(pendingSubscription)
            // Update with actual user ID
            subscriptionData.userId = state.user.id
            
            // Try to save to database, keep in localStorage if database not available
            try {
              await blink.db.subscriptions.create(subscriptionData)
              localStorage.removeItem('pendingSubscription')
            } catch (dbError) {
              console.log('Database not available yet, keeping subscription in localStorage')
              // Keep in localStorage for now, will be processed by Dashboard
            }
            
          } catch (error) {
            console.error('Error processing pending subscription:', error)
          }
        }
      }
    })
    
    return unsubscribe
  }, [])

  const handleSignupSuccess = () => {
    // This will be called after successful signup
    // The auth state change will handle the rest
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando CryptoAdvisor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage onSignupSuccess={handleSignupSuccess} />
  }

  return <Dashboard user={user} />
}

export default App