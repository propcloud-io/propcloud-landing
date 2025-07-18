import { WaitlistButton } from "@/components/WaitlistButton";
import { ChatDemo } from "@/components/ChatDemo";
import { NeuralBackground } from "@/components/NeuralBackground";
import heroNeural from "@/assets/hero-neural.jpg";
import conversationWaves from "@/assets/conversation-waves.jpg";
import dataParticles from "@/assets/data-particles.jpg";

export default function PropCloudLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <NeuralBackground />
        
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroNeural} 
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-wider mb-2">
              <span className="bg-gradient-neural bg-clip-text text-transparent">PROP</span>
              <span className="text-foreground">CLOUD</span>
            </h1>
          </div>

          {/* Main Headline */}
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8">
            The Future of
            <br />
            <span className="bg-gradient-neural bg-clip-text text-transparent">
              Real Estate Investment
            </span>
            <br />
            is a Conversation
          </h2>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Meet your AI co-pilot for STR investing. Ask complex questions, get instant insights. 
            No dashboards. No spreadsheets. Just simple, intelligent conversations.
          </p>

          {/* CTA */}
          <WaitlistButton size="lg" className="neural-glow" />

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Vision/Manifesto Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl md:text-6xl font-bold mb-12">
            Stop Drowning in Data.
            <br />
            <span className="bg-gradient-vision bg-clip-text text-transparent">
              Start a Dialogue.
            </span>
          </h3>

          <div className="space-y-8 text-lg md:text-xl leading-relaxed text-muted-foreground">
            <p>
              Real estate investment has become a maze of conflicting dashboards, 
              overwhelming spreadsheets, and endless data points that obscure rather than illuminate.
            </p>
            
            <p>
              <strong className="text-foreground">We believe there's a better way.</strong>
            </p>
            
            <p>
              PropCloud isn't another tool—it's a new way of working. 
              Ask questions in plain English. Let our AI synthesize billions of data points 
              into simple, actionable answers. It's about democratizing expert-level analysis 
              and making powerful insights accessible to everyone.
            </p>
            
            <p className="text-xl md:text-2xl font-semibold text-foreground">
              The future of real estate investment isn't in learning more software.
              <br />
              It's in having better conversations.
            </p>
          </div>
        </div>

        {/* Background Visual */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img 
            src={conversationWaves}
            alt=""
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/2 opacity-10"
          />
        </div>
      </section>

      {/* Glimpse of the Future Section */}
      <section className="py-24 px-6 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-6xl font-bold mb-8">
              Imagine 
              <span className="bg-gradient-neural bg-clip-text text-transparent"> Asking...</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the power of conversational AI for real estate investment. 
              See how complex analysis becomes as simple as asking a question.
            </p>
          </div>

          <ChatDemo />
        </div>

        {/* Background Visual */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/3 opacity-5 -z-10">
          <img 
            src={dataParticles}
            alt=""
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h3 className="text-4xl md:text-6xl font-bold mb-8">
            Be the First to Talk to
            <br />
            <span className="bg-gradient-vision bg-clip-text text-transparent">
              the Future of Real Estate
            </span>
          </h3>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Waitlist members will get priority access and have a voice in shaping the future of PropCloud.
          </p>
          
          <p className="text-lg text-muted-foreground mb-12">
            Join the exclusive community of visionary investors who refuse to settle for status quo.
          </p>

          <WaitlistButton size="lg" className="vision-glow" />
        </div>

        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neural/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-vision/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <h4 className="text-xl font-bold">
              <span className="bg-gradient-neural bg-clip-text text-transparent">PROP</span>
              <span className="text-foreground">CLOUD</span>
            </h4>
          </div>
          <p className="text-muted-foreground">
            Building the future of real estate investment, one conversation at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}