
import { WaitlistButton } from "@/components/WaitlistButton";
import { ChatDemo } from "@/components/ChatDemo";
import { NeuralBackground } from "@/components/NeuralBackground";

export default function PropCloudLanding() {
  console.log("PropCloudLanding component rendering...");
  
  return (
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

        <div className="relative z-10 text-center max-w-7xl mx-auto px-6">
          {/* Logo/Brand */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-wider mb-4">
              <span className="text-primary">PROP</span>
              <span className="text-white">CLOUD</span>
            </h1>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full opacity-60" />
          </div>

          {/* Main Headline */}
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8">
            The Future of
            <br />
            <span className="bg-gradient-to-r from-primary via-teal-400 to-primary bg-clip-text text-transparent">
              Real Estate Investment
            </span>
            <br />
            is a Conversation
          </h2>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
            Meet your AI co-pilot for STR investing. Ask complex questions, get instant insights. 
            No dashboards. No spreadsheets. Just simple, intelligent conversations.
          </p>

          {/* CTA */}
          <WaitlistButton size="lg" className="shadow-2xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300" />

          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-10 border-2 border-primary/40 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Vision/Manifesto Section */}
      <section className="py-32 px-6 relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-16 leading-tight">
            Stop Drowning in Data.
            <br />
            <span className="bg-gradient-to-r from-teal-400 via-primary to-teal-400 bg-clip-text text-transparent">
              Start a Dialogue.
            </span>
          </h3>

          <div className="space-y-8 text-lg md:text-xl leading-relaxed text-gray-300 max-w-4xl mx-auto">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <p className="text-xl md:text-2xl">
                Real estate investment has become a maze of conflicting dashboards, 
                overwhelming spreadsheets, and endless data points that obscure rather than illuminate.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-2xl p-8 border border-primary/20">
              <p className="text-2xl md:text-3xl font-semibold text-white">
                We believe there's a better way.
              </p>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <p className="text-xl md:text-2xl">
                PropCloud isn't another tool—it's a new way of working. 
                Ask questions in plain English. Let our AI synthesize billions of data points 
                into simple, actionable answers. It's about democratizing expert-level analysis 
                and making powerful insights accessible to everyone.
              </p>
            </div>
            
            <div className="pt-8 bg-gradient-to-r from-primary/10 to-teal-400/10 backdrop-blur-sm rounded-2xl p-8 border border-primary/30">
              <p className="text-2xl md:text-3xl font-bold text-white mb-4">
                The future of real estate investment isn't in learning more software.
              </p>
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                It's in having better conversations.
              </p>
            </div>
          </div>
        </div>

        {/* Geometric Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </section>

      {/* Chat Demo Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Imagine 
              <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent"> Asking...</span>
            </h3>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Experience the power of conversational AI for real estate investment. 
              See how complex analysis becomes as simple as asking a question.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-teal-400/20 rounded-3xl blur-xl" />
            <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8">
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
      <section className="py-32 px-6 text-center relative overflow-hidden bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-5xl mx-auto relative z-10">
          <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-12 leading-tight">
            Be the First to Talk to
            <br />
            <span className="bg-gradient-to-r from-teal-400 via-primary to-teal-400 bg-clip-text text-transparent">
              the Future of Real Estate
            </span>
          </h3>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 mb-8">
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-6">
              Waitlist members will get priority access and have a voice in shaping the future of PropCloud.
            </p>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              Join the exclusive community of visionary investors who refuse to settle for status quo.
            </p>
          </div>

          <WaitlistButton size="lg" className="shadow-2xl shadow-teal-400/20 hover:shadow-teal-400/30 transition-all duration-300" />
        </div>

        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-gray-700/50 bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h4 className="text-2xl font-bold">
              <span className="text-primary">PROP</span>
              <span className="text-white">CLOUD</span>
            </h4>
            <div className="w-12 h-1 bg-primary mx-auto rounded-full opacity-60 mt-2" />
          </div>
          <p className="text-gray-400 text-lg">
            Building the future of real estate investment, one conversation at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
