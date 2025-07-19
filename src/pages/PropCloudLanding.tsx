
import { WaitlistForm } from "@/components/WaitlistForm";
import { ThankYouModal } from "@/components/ThankYouModal";
import { SEOHead } from "@/components/SEOHead";
import { ChatDemo } from "@/components/ChatDemo";
import { NeuralBackground } from "@/components/NeuralBackground";
import { useWaitlist } from "@/hooks/useWaitlist";
import { Analytics, trackPageView } from "@/components/Analytics";
import { useEffect } from "react";
import { TrendingUp, Brain, Zap, Shield, Target, Users } from "lucide-react";

export default function PropCloudLanding() {
  const { showThankYou, handleWaitlistSuccess, closeThankYou } = useWaitlist();

  useEffect(() => {
    console.log("PropCloudLanding component rendering...");
    trackPageView('/');
  }, []);

  return (
    <>
      <SEOHead />
      <Analytics />
      
      <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Deep Dark Background with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
          
          {/* Neural Network Background */}
          <NeuralBackground />
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(134, 239, 172, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(134, 239, 172, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }} />
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center max-w-7xl mx-auto px-4 sm:px-6">
            {/* Logo/Brand */}
            <div className="mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-wider mb-4">
                <span className="text-primary">PROP</span>
                <span className="text-white">CLOUD</span>
              </h1>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full opacity-60" />
            </div>

            {/* Main Headline */}
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 sm:mb-8">
              The Future of
              <br />
              <span className="bg-gradient-to-r from-primary via-teal-400 to-primary bg-clip-text text-transparent">
                Real Estate Investment
              </span>
              <br />
              is a Conversation
            </h2>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 sm:mb-16 max-w-4xl mx-auto leading-relaxed px-4">
              Meet your AI co-pilot for STR investing. Ask complex questions, get instant insights. 
              No dashboards. No spreadsheets. Just simple, intelligent conversations.
            </p>

            {/* Enhanced CTA */}
            <div className="mb-8 px-4">
              <WaitlistForm 
                onSuccess={handleWaitlistSuccess}
                size="lg" 
                className="shadow-2xl shadow-primary/20"
              />
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-400 mb-8 px-4">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                <span>Built by Real Estate Pros</span>
              </div>
              <div className="flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                <span>Instant Insights</span>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="w-6 h-10 border-2 border-primary/40 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-bounce" />
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement Section */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 sm:mb-20">
              <h3 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 sm:mb-8 leading-tight">
                Stop Drowning in Data.
                <br />
                <span className="bg-gradient-to-r from-teal-400 via-primary to-teal-400 bg-clip-text text-transparent">
                  Start a Dialogue.
                </span>
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center mb-16 sm:mb-20">
              <div className="space-y-6">
                <div className="bg-red-900/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
                  <h4 className="text-xl font-bold text-red-400 mb-3">The Current Reality</h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start">
                      <span className="text-red-400 mr-3 mt-1">×</span>
                      Dozens of conflicting dashboards
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-3 mt-1">×</span>
                      Overwhelming spreadsheets
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-3 mt-1">×</span>
                      Analysis paralysis on $1M+ decisions
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-3 mt-1">×</span>
                      Hours of research for basic answers
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-primary/20 backdrop-blur-sm rounded-2xl p-6 border border-primary/30">
                  <h4 className="text-xl font-bold text-primary mb-3">The PropCloud Way</h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start">
                      <span className="text-primary mr-3 mt-1">✓</span>
                      Simple conversations in plain English
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-3 mt-1">✓</span>
                      Instant analysis of millions of data points
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-3 mt-1">✓</span>
                      Confident decisions in seconds
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-3 mt-1">✓</span>
                      Expert-level insights, accessible to all
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Vision Statement */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-primary/20 max-w-4xl mx-auto">
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-4">
                  We believe there's a better way.
                </p>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-300 leading-relaxed">
                  PropCloud isn't another tool—it's a new way of working. 
                  Ask questions in plain English. Let our AI synthesize billions of data points 
                  into simple, actionable answers. It's about democratizing expert-level analysis 
                  and making powerful insights accessible to everyone.
                </p>
              </div>
            </div>
          </div>

          {/* Geometric Background Elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 sm:mb-20">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                Built for
                <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent"> Real Investors</span>
              </h3>
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
                Every feature designed by real estate professionals who understand your challenges
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700/50 hover:border-primary/30 transition-all duration-500 hover:scale-105">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-4">Instant Market Analysis</h4>
                <p className="text-gray-400">
                  "What's the average ADR in downtown Miami?" Get comprehensive market insights in seconds, not hours.
                </p>
              </div>

              <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700/50 hover:border-primary/30 transition-all duration-500 hover:scale-105">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-4">ROI Projections</h4>
                <p className="text-gray-400">
                  Ask about potential returns and get detailed financial projections backed by real market data.
                </p>
              </div>

              <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700/50 hover:border-primary/30 transition-all duration-500 hover:scale-105 sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-4">Regulation Intelligence</h4>
                <p className="text-gray-400">
                  Navigate complex STR regulations with AI that understands local laws and compliance requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Chat Demo Section */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 sm:mb-20">
              <h3 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
                Imagine 
                <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent"> Asking...</span>
              </h3>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Experience the power of conversational AI for real estate investment. 
                See how complex analysis becomes as simple as asking a question.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-teal-400/20 rounded-3xl blur-xl" />
              <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-4 sm:p-8">
                <ChatDemo />
              </div>
            </div>
          </div>

          {/* Tech Grid Background */}
          <div className="absolute inset-0 -z-10 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(134, 239, 172, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(134, 239, 172, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px'
            }} />
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 sm:py-32 px-4 sm:px-6 text-center relative overflow-hidden bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900">
          <div className="max-w-5xl mx-auto relative z-10">
            <h3 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-8 sm:mb-12 leading-tight">
              Be the First to Talk to
              <br />
              <span className="bg-gradient-to-r from-teal-400 via-primary to-teal-400 bg-clip-text text-transparent">
                the Future of Real Estate
              </span>
            </h3>
            
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-primary/20 mb-8 sm:mb-12">
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-6">
                Waitlist members will get priority access and have a voice in shaping the future of PropCloud.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400 mb-6 sm:mb-8">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  <span>Exclusive Community</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  <span>Priority Access</span>
                </div>
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  <span>Shape the Product</span>
                </div>
              </div>
              
              <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
                Join the exclusive community of visionary investors who refuse to settle for status quo.
              </p>
            </div>

            <WaitlistForm 
              onSuccess={handleWaitlistSuccess}
              size="lg" 
              className="shadow-2xl shadow-teal-400/20"
            />
          </div>

          {/* Dynamic Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 sm:py-16 px-4 sm:px-6 border-t border-gray-700/50 bg-gray-900">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-6 sm:mb-8">
              <h4 className="text-xl sm:text-2xl font-bold">
                <span className="text-primary">PROP</span>
                <span className="text-white">CLOUD</span>
              </h4>
              <div className="w-12 h-1 bg-primary mx-auto rounded-full opacity-60 mt-2" />
            </div>
            <p className="text-gray-400 text-base sm:text-lg mb-4">
              Building the future of real estate investment, one conversation at a time.
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 PropCloud. All rights reserved. | Built by real estate professionals for real estate professionals.
            </p>
          </div>
        </footer>

        {/* Thank You Modal */}
        <ThankYouModal isOpen={showThankYou} onClose={closeThankYou} />
      </div>
    </>
  );
}
