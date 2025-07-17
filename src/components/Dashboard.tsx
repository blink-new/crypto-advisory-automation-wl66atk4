import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  TrendingUp, 
  Mail, 
  Instagram, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Plus,
  Calendar,
  Target
} from 'lucide-react'
import { blink } from '../blink/client'

interface User {
  id: string
  email: string
  displayName?: string
}

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [subscription, setSubscription] = useState(null)
  const [contentIdeas, setContentIdeas] = useState([])
  const [loading, setLoading] = useState(true)

  const getDefaultContentIdeas = () => [
    {
      id: 'demo_1',
      content: '📈 Bitcoin vs Oro: ¿Cuál es mejor reserva de valor?\n\nExplora las diferencias entre Bitcoin y el oro tradicional como activos de refugio. Aprende sobre volatilidad, liquidez y adopción institucional.',
      status: 'draft',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo_2', 
      content: '🔐 Seguridad en Crypto: Wallets Calientes vs Frías\n\nDescubre las diferencias entre wallets de software y hardware. Conoce cuándo usar cada tipo y cómo proteger tus criptomonedas.',
      status: 'draft',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo_3',
      content: '💰 DCA: La estrategia de inversión más simple\n\nAprende sobre Dollar Cost Averaging, la técnica que reduce el riesgo de volatilidad comprando pequeñas cantidades regularmente.',
      status: 'draft',
      createdAt: new Date().toISOString()
    }
  ]

  const loadUserData = useCallback(async () => {
    try {
      // Try to load subscription from database first, fallback to localStorage
      let subscriptionLoaded = false
      
      try {
        const dbSubscriptions = await blink.db.subscriptions.list({
          where: { email: user.email },
          limit: 1
        })
        
        if (dbSubscriptions.length > 0) {
          setSubscription(dbSubscriptions[0])
          subscriptionLoaded = true
        }
      } catch (dbError) {
        console.log('Database not available, using localStorage fallback')
      }

      // If no subscription from database, check localStorage
      if (!subscriptionLoaded) {
        const pendingSubscription = localStorage.getItem('pendingSubscription')
        if (pendingSubscription) {
          try {
            const subscriptionData = JSON.parse(pendingSubscription)
            subscriptionData.userId = user.id
            setSubscription(subscriptionData)
            
            // Try to save to database, keep in localStorage if database not available
            try {
              await blink.db.subscriptions.create({
                id: subscriptionData.id,
                userId: user.id,
                email: subscriptionData.email,
                name: subscriptionData.name,
                country: subscriptionData.country,
                plan: subscriptionData.plan,
                frequency: subscriptionData.frequency,
                accessCode: subscriptionData.accessCode,
                status: subscriptionData.status,
                createdAt: subscriptionData.createdAt
              })
              localStorage.removeItem('pendingSubscription')
            } catch (dbError) {
              console.log('Database not available, keeping subscription in localStorage')
              localStorage.setItem(`subscription_${user.id}`, JSON.stringify(subscriptionData))
              localStorage.removeItem('pendingSubscription')
            }
            
          } catch (error) {
            console.error('Error processing pending subscription:', error)
          }
        } else {
          // Try to load existing subscription from localStorage
          const existingSubscription = localStorage.getItem(`subscription_${user.id}`)
          if (existingSubscription) {
            try {
              setSubscription(JSON.parse(existingSubscription))
            } catch (error) {
              console.error('Error parsing existing subscription:', error)
            }
          }
        }
      }

      // Try to load content ideas from database first, fallback to localStorage
      let contentLoaded = false
      
      try {
        const dbContentIdeas = await blink.db.contentIdeas.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          limit: 6
        })
        
        if (dbContentIdeas.length > 0) {
          setContentIdeas(dbContentIdeas)
          contentLoaded = true
        }
      } catch (dbError) {
        console.log('Database not available for content ideas, using localStorage fallback')
      }

      // If no content from database, check localStorage or use demo data
      if (!contentLoaded) {
        const storedIdeas = localStorage.getItem(`contentIdeas_${user.id}`)
        if (storedIdeas) {
          try {
            setContentIdeas(JSON.parse(storedIdeas))
          } catch (error) {
            console.error('Error parsing stored content ideas:', error)
            setContentIdeas(getDefaultContentIdeas())
          }
        } else {
          setContentIdeas(getDefaultContentIdeas())
        }
      }

    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id, user.email])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  const generateContentIdeas = async () => {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Actúa como un asesor crypto creando contenido visual y educativo para principiantes en Chile que quieren aprender a invertir en criptomonedas de manera simple, segura y responsable. 

Propón 3 temas diarios de alto valor educativo para hoy. Para cada tema, incluye:
1. Título del tema
2. Descripción breve (2-3 líneas)
3. Tipo de contenido (email/instagram story)
4. Nivel de dificultad (principiante/intermedio)

Sé visual, claro y práctico. Evita jerga técnica.`,
        maxTokens: 500
      })

      // Parse and save content ideas
      const ideas = text.split('\n\n').filter(idea => idea.trim()).map((idea, index) => ({
        id: `idea_${Date.now()}_${index}`,
        userId: user.id,
        content: idea.trim(),
        createdAt: new Date().toISOString(),
        status: 'draft'
      }))

      // Try to save to database first, fallback to localStorage
      const newContentIdeas = [...ideas, ...contentIdeas]
      
      try {
        // Save new ideas to database
        for (const idea of ideas) {
          await blink.db.contentIdeas.create(idea)
        }
        console.log('Content ideas saved to database')
      } catch (dbError) {
        console.log('Database not available, saving to localStorage')
        localStorage.setItem(`contentIdeas_${user.id}`, JSON.stringify(newContentIdeas))
      }

      // Update local state
      setContentIdeas(newContentIdeas)

    } catch (error) {
      console.error('Error generating content ideas:', error)
    }
  }

  const handleLogout = () => {
    blink.auth.logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-amber-600" />
                <h1 className="text-2xl font-bold text-gray-900">CryptoAdvisor</h1>
              </div>
              {subscription && (
                <Badge variant="outline" className="capitalize">
                  Plan {subscription.plan}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hola, {user.displayName || user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="content">Contenido</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Suscriptores</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8,567</div>
                  <p className="text-xs text-muted-foreground">+5% esta semana</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stories Creadas</CardTitle>
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">+8% esta semana</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Apertura</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24.5%</div>
                  <p className="text-xs text-muted-foreground">+2.1% desde ayer</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimas acciones en tu plataforma</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Email enviado: "Análisis Bitcoin Semanal"</p>
                      <p className="text-xs text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nuevo suscriptor: Plan Pro</p>
                      <p className="text-xs text-gray-500">Hace 4 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Story creada: "DeFi para principiantes"</p>
                      <p className="text-xs text-gray-500">Hace 6 horas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximas Tareas</CardTitle>
                  <CardDescription>Contenido programado para esta semana</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Email: "Estrategias de DCA"</p>
                      <p className="text-xs text-gray-500">Mañana, 9:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Target className="h-4 w-4 text-emerald-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Webinar: "Análisis Técnico Básico"</p>
                      <p className="text-xs text-gray-500">Viernes, 7:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Instagram className="h-4 w-4 text-pink-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Stories: "Noticias de la semana"</p>
                      <p className="text-xs text-gray-500">Domingo, 6:00 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Contenido</h2>
                <p className="text-gray-600">Crea y gestiona tu contenido educativo</p>
              </div>
              <Button onClick={generateContentIdeas} className="bg-gradient-to-r from-amber-500 to-emerald-500">
                <Plus className="h-4 w-4 mr-2" />
                Generar Ideas
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contentIdeas.map((idea, index) => (
                <Card key={idea.id || index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Idea #{index + 1}</Badge>
                      <Badge variant={idea.status === 'published' ? 'default' : 'secondary'}>
                        {idea.status === 'published' ? 'Publicado' : 'Borrador'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 line-clamp-4">
                      {idea.content}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline">Editar</Button>
                      <Button size="sm" variant="outline">Publicar</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {contentIdeas.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ideas de contenido</h3>
                    <p className="text-gray-600 mb-4">Genera nuevas ideas de contenido para comenzar</p>
                    <Button onClick={generateContentIdeas} className="bg-gradient-to-r from-amber-500 to-emerald-500">
                      <Plus className="h-4 w-4 mr-2" />
                      Generar Ideas
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analíticas</h2>
              <p className="text-gray-600">Monitorea el rendimiento de tu contenido</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Crecimiento de Suscriptores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Gráfico de crecimiento (próximamente)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement por País</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Chile</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Argentina</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Colombia</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">México</span>
                      <span className="text-sm font-medium">12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuración</h2>
              <p className="text-gray-600">Gestiona tu cuenta y preferencias</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información de la Cuenta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  {subscription && (
                    <>
                      <div>
                        <label className="text-sm font-medium">Plan Actual</label>
                        <p className="text-sm text-gray-600 capitalize">{subscription.plan}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">País</label>
                        <p className="text-sm text-gray-600">{subscription.country}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Frecuencia</label>
                        <p className="text-sm text-gray-600 capitalize">{subscription.frequency}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferencias</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Cambiar Plan
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Configurar Email
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Instagram className="h-4 w-4 mr-2" />
                    Conectar Instagram
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}