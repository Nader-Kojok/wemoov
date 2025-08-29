import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertTriangle, X, MessageCircle } from 'lucide-react'
import { useFormSimulation } from '@/utils/formSimulation'
import type { FormField } from '@/utils/formSimulation'
import * as React from 'react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const { isSubmitting, simulationResult, showSimulationNotice, submitForm, clearResult, dismissNotice } = useFormSimulation()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear any previous results when user starts typing
    if (simulationResult) {
      clearResult()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const fields: FormField[] = [
      {
        name: 'name',
        value: formData.name,
        required: true,
        type: 'text',
        minLength: 2
      },
      {
        name: 'email',
        value: formData.email,
        required: true,
        type: 'email'
      },
      {
        name: 'message',
        value: formData.message,
        required: true,
        type: 'textarea',
        minLength: 10
      }
    ]

    const result = await submitForm(fields, 'contact')
    
    if (result.success) {
      setFormData({ name: '', email: '', message: '' })
    }
  }

  return (
    <section id="contact" className="pt-20 pb-12 bg-gradient-to-b from-[#2D2D2D] via-[#1E5EFF] to-[#2D2D2D] relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-[#B8C5FF]/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 shadow-sm mb-6">
            <MessageCircle className="h-4 w-4 text-white mr-2" />
            <span className="text-sm font-medium text-white">Contactez-nous</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Parlons de votre
            <span className="block text-[#B8C5FF]">prochain voyage</span>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Notre équipe est disponible 24h/24 pour vous accompagner dans tous vos déplacements.
            <span className="block font-semibold text-white mt-2">Réponse garantie sous 15 minutes.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <div className="grid gap-4">
              {/* Phone */}
              <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-[#1E5EFF] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#2D2D2D] text-lg">Téléphone</p>
                      <p className="text-[#2D2D2D]/70">+221 33 801 82 82</p>
                    </div>
                    <Button size="sm" className="bg-[#1E5EFF] hover:bg-[#1E5EFF]/90">
                      Appeler
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Email */}
              <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-[#2D2D2D] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#2D2D2D] text-lg">Email</p>
                      <p className="text-[#2D2D2D]/70">contact@wemoovsenegal.com</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white">
                      Écrire
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-[#B8C5FF] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#2D2D2D] text-lg">Localisation</p>
                      <p className="text-[#2D2D2D]/70">Ouest Foire cité khanat n.107, Dakar – Sénégal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Special Offer */}
            <Card className="bg-gradient-to-r from-[#1E5EFF] to-[#B8C5FF] border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-8 text-center text-white relative">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Navette Aéroport</h3>
                <div className="text-4xl font-black mb-2">15,000 FCFA</div>
                <p className="text-white/90 mb-4">Dakar ↔ AIBD • Service 24h/24</p>
                <Button className="bg-white text-[#1E5EFF] hover:bg-white/90 font-semibold">
                  Réserver maintenant
                </Button>
                
                {/* Decorative Elements */}
                <div className="absolute top-2 right-2 w-20 h-20 bg-white/5 rounded-full" />
                <div className="absolute bottom-2 left-2 w-12 h-12 bg-white/5 rounded-full" />
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#1E5EFF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-[#2D2D2D] mb-2">
                  Envoyez-nous un message
                </h3>
                <p className="text-[#2D2D2D]/70">
                  Nous vous répondrons dans les plus brefs délais
                </p>
              </div>

              {/* Simulation Notice */}
              {showSimulationNotice && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Mode Simulation Activé
                      </h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        Ce formulaire fonctionne en mode simulation pendant que l'intégration backend est en cours. 
                        Toutes les soumissions sont simulées avec validation complète.
                      </p>
                    </div>
                    <div className="ml-auto pl-3">
                      <button
                        type="button"
                        onClick={dismissNotice}
                        className="inline-flex text-yellow-400 hover:text-yellow-600 focus:outline-none focus:text-yellow-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}


              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2D2D2D]">Nom complet</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-4 border-2 border-[#1E5EFF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-[#1E5EFF] transition-all duration-300 bg-white/80"
                    placeholder="Entrez votre nom complet"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2D2D2D]">Adresse email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-4 border-2 border-[#1E5EFF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-[#1E5EFF] transition-all duration-300 bg-white/80"
                    placeholder="votre@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2D2D2D]">Votre message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-4 border-2 border-[#1E5EFF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-[#1E5EFF] transition-all duration-300 resize-none bg-white/80"
                    placeholder="Décrivez votre demande ou question..."
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#1E5EFF] to-[#2D2D2D] hover:from-[#1E5EFF]/90 hover:to-[#2D2D2D]/90 text-white py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Envoyer le message
                    </>
                  )}
                </Button>
                
                {/* Trust Indicators */}
                <div className="flex items-center justify-center space-x-6 pt-4 text-sm text-[#2D2D2D]/70">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-[#1E5EFF]" />
                    <span>Réponse rapide</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-[#1E5EFF]" />
                    <span>100% sécurisé</span>
                  </div>
                </div>
              </form>

              {/* Form Result - Displayed after form submission */}
              {simulationResult && (
                <div className={`${simulationResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mt-6`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {simulationResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={`text-sm font-medium ${simulationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {simulationResult.message}
                      </p>
                      {simulationResult.data && (
                        <div className={`mt-2 text-xs ${simulationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                          <p>Référence: {simulationResult.data.referenceNumber}</p>
                          <p>Réponse estimée: {simulationResult.data.estimatedResponse}</p>
                        </div>
                      )}
                      {simulationResult.errors && (
                        <ul className={`mt-2 text-xs ${simulationResult.success ? 'text-green-800' : 'text-red-800'} list-disc list-inside`}>
                          {simulationResult.errors.map((error, index) => (
                            <li key={index}>{error.message}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="ml-auto pl-3">
                      <button
                        type="button"
                        onClick={clearResult}
                        className={`inline-flex ${simulationResult.success ? 'text-green-400' : 'text-red-400'} hover:opacity-75 focus:outline-none`}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Social Media */}
        <div className="text-center mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h4 className="text-2xl font-bold text-white mb-4">Suivez-nous</h4>
            <p className="text-white/90 mb-6">Restez connectés pour nos dernières actualités et offres spéciales</p>
            
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-[#1E5EFF] transition-all duration-300 hover:scale-110"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Facebook
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-[#1E5EFF] transition-all duration-300 hover:scale-110"
              >
                <Phone className="h-5 w-5 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact