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
        
        {/* Hero Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroNeural} 
            alt=""
            className="w-full h-full object-cover opacity-5"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>

        <div className="relative z-10 text-center max-w-7xl mx-auto px-6">
          {/* Logo/Brand */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold tracking-wider mb-4">
              <span className="text-primary">PROP</span>
              <span className="text-foreground">CLOUD</span>
            </h1>
          </div>

          {/* Main Headline */}
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8">
            The Future of
            <br />
            <span className="text-gradient-primary">
              Real Estate Investment
            </span>
            <br />
            is a Conversation
          </h2>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-4xl mx-auto leading-relaxed">
            Meet your AI co-pilot for STR investing. Ask complex questions, get instant insights. 
            No dashboards. No spreadsheets. Just simple, intelligent conversations.
          </p>

          {/* CTA */}
          <WaitlistButton size="lg" className="glow-primary" />

          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Vision/Manifesto Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-16 leading-tight">
            Stop Drowning in Data.
            <br />
            <span className="text-gradient-accent">
              Start a Dialogue.
            </span>
          </h3>

          <div className="space-y-8 text-lg md:text-xl leading-relaxed text-muted-foreground max-w-4xl mx-auto">
            <p className="text-xl md:text-2xl">
              Real estate investment has become a maze of conflicting dashboards, 
              overwhelming spreadsheets, and endless data points that obscure rather than illuminate.
            </p>
            
            <p className="text-2xl md:text-3xl font-semibold text-foreground">
              We believe there's a better way.
            </p>
            
            <p className="text-xl md:text-2xl">
              PropCloud isn't another tool—it's a new way of working. 
              Ask questions in plain English. Let our AI synthesize billions of data points 
              into simple, actionable answers. It's about democratizing expert-level analysis 
              and making powerful insights accessible to everyone.
            </p>
            
            <div className="pt-8">
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                The future of real estate investment isn't in learning more software.
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gradient-primary mt-4">
                It's in having better conversations.
              </p>
            </div>
          </div>
        </div>

        {/* Background Visual */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img 
            src={conversationWaves}
            alt=""
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/2 opacity-5"
          />
        </div>
      </section>

      {/* Glimpse of the Future Section */}
      <section className="py-32 px-6 bg-card/20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Imagine 
              <span className="text-gradient-primary"> Asking...</span>
            </h3>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience the power of conversational AI for real estate investment. 
              See how complex analysis becomes as simple as asking a question.
            </p>
          </div>

          <ChatDemo />
        </div>

        {/* Background Visual */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/3 opacity-3 -z-10">
          <img 
            src={dataParticles}
            alt=""
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-12 leading-tight">
            Be the First to Talk to
            <br />
            <span className="text-gradient-accent">
              the Future of Real Estate
            </span>
          </h3>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            Waitlist members will get priority access and have a voice in shaping the future of PropCloud.
          </p>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-16 max-w-3xl mx-auto">
            Join the exclusive community of visionary investors who refuse to settle for status quo.
          </p>

          <WaitlistButton size="lg" className="glow-accent" />
        </div>

        {/* Subtle Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h4 className="text-2xl font-bold">
              <span className="text-primary">PROP</span>
              <span className="text-foreground">CLOUD</span>
            </h4>
          </div>
          <p className="text-muted-foreground text-lg">
            Building the future of real estate investment, one conversation at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}