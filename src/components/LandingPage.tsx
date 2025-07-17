import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { 
  TrendingUp, 
  Mail, 
  Instagram, 
  Shield, 
  Zap, 
  Globe,
  Check,
  Star,
  Users,
  BarChart3
} from 'lucide-react'
import { blink } from '../blink/client'

interface LandingPageProps {
  onSignupSuccess: () => void
}

export default function LandingPage({ onSignupSuccess }: LandingPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    plan: '',
    frequency: '',
    accessCode: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const plans = [
    {
      id: 'free',
      name: 'Plan Gratuito',
      price: 'Gratis',
      description: 'Perfecto para comenzar',
      features: [
        '1 email semanal',
        'Contenido educativo básico',
        'Acceso con código',
        'Soporte por email'
      ],
      badge: 'Código requerido',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'pro',
      name: 'Plan Pro',
      price: '$5/mes',
      description: 'Para inversores activos',
      features: [
        'Email diario',
        'Instagram stories',
        'Análisis de mercado',
        'Alertas de precio',
        'Soporte prioritario'
      ],
      badge: 'Más popular',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'premium',
      name: 'Plan Premium',
      price: '$10/mes',
      description: 'Experiencia completa',
      features: [
        'Todo del Plan Pro',
        'Webinars exclusivos',
        'Videos educativos',
        'Análisis técnico avanzado',
        'Consultas 1-a-1',
        'Acceso anticipado'
      ],
      badge: 'Mejor valor',
      badgeColor: 'bg-amber-100 text-amber-800'
    }
  ]

  const countries = [
    'Chile', 'Argentina', 'Colombia', 'México', 'Perú', 
    'Ecuador', 'Uruguay', 'Paraguay', 'Bolivia', 'Venezuela'
  ]

  const frequencies = [
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate access code for free plan
      if (formData.plan === 'free') {
        if (formData.accessCode !== 'CRYPTO2025') {
          setError('Código de acceso inválido para el plan gratuito')
          setLoading(false)
          return
        }
      }

      // Validate required fields
      if (!formData.name || !formData.email || !formData.country || !formData.plan || !formData.frequency) {
        setError('Por favor completa todos los campos requeridos')
        setLoading(false)
        return
      }

      // Create subscription record
      const subscriptionData = {
        id: `sub_${Date.now()}`,
        userId: 'temp_user', // Will be updated after auth
        email: formData.email,
        name: formData.name,
        country: formData.country,
        plan: formData.plan,
        frequency: formData.frequency,
        accessCode: formData.plan === 'free' ? formData.accessCode : null,
        status: 'active',
        createdAt: new Date().toISOString()
      }

      // Store in localStorage temporarily (will move to DB after auth)
      localStorage.setItem('pendingSubscription', JSON.stringify(subscriptionData))

      // Trigger authentication
      blink.auth.login()

    } catch (error) {
      console.error('Signup error:', error)
      setError('Error al procesar el registro. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-amber-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">
                CryptoAdvisor
              </h1>
            </div>
            <Button variant="outline" onClick={() => blink.auth.login()}>
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Aprende a invertir en{' '}
              <span className="bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">
                criptomonedas
              </span>{' '}
              de forma segura
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Recibe contenido educativo personalizado, análisis de mercado y estrategias de inversión 
              directamente en tu email e Instagram. Diseñado especialmente para principiantes en Latinoamérica.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mb-12">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>+1,200 suscriptores</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                <span>4.9/5 valoración</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>85% tasa de éxito</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir CryptoAdvisor?
            </h3>
            <p className="text-lg text-gray-600">
              La plataforma más completa para aprender sobre inversiones en criptomonedas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Contenido Personalizado</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Recibe emails educativos adaptados a tu nivel de experiencia y frecuencia preferida.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Instagram className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Stories Visuales</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Contenido visual atractivo en Instagram Stories para aprender sobre la marcha.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Inversión Segura</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Aprende estrategias probadas y evita errores comunes en el mundo crypto.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Elige tu plan perfecto
            </h3>
            <p className="text-lg text-gray-600">
              Comienza gratis o accede a contenido premium
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative border-2 hover:shadow-xl transition-all cursor-pointer ${
                  formData.plan === plan.id 
                    ? 'border-amber-500 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, plan: plan.id }))}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className={plan.badgeColor}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {plan.price}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Comienza tu viaje crypto hoy
            </h3>
            <p className="text-lg text-gray-600">
              Únete a miles de inversores que ya están aprendiendo con nosotros
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-center">Registro Gratuito</CardTitle>
              <CardDescription className="text-center">
                Completa el formulario para comenzar
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País *</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu país" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frecuencia de contenido *</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="¿Con qué frecuencia quieres recibir contenido?" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.plan === 'free' && (
                  <div className="space-y-2">
                    <Label htmlFor="accessCode">Código de acceso *</Label>
                    <Input
                      id="accessCode"
                      type="text"
                      placeholder="Ingresa CRYPTO2025"
                      value={formData.accessCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, accessCode: e.target.value }))}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Usa el código <strong>CRYPTO2025</strong> para acceder al plan gratuito
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600"
                  disabled={loading || !formData.plan}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Procesando...
                    </div>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      {formData.plan === 'free' ? 'Comenzar Gratis' : `Suscribirse al Plan ${formData.plan === 'pro' ? 'Pro' : 'Premium'}`}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
                  Puedes cancelar en cualquier momento.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-6 w-6 text-amber-500" />
                <span className="text-lg font-bold">CryptoAdvisor</span>
              </div>
              <p className="text-gray-400 text-sm">
                La plataforma líder en educación crypto para Latinoamérica.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Planes y precios</li>
                <li>Características</li>
                <li>Testimonios</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Centro de ayuda</li>
                <li>Contacto</li>
                <li>FAQ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Síguenos</h4>
              <div className="flex gap-4">
                <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Mail className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Globe className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 CryptoAdvisor. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}