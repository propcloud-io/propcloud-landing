
import { useEffect } from "react";
import { NeuralBackground } from "@/components/NeuralBackground";
import { WaitlistButton } from "@/components/WaitlistButton";
import { ChatDemo } from "@/components/ChatDemo";
import { SEOHead } from "@/components/SEOHead";
import { Analytics } from "@/components/Analytics";
import { AuthButton } from "@/components/AuthButton";
import { Target, TrendingUp, Brain, CheckCircle, X } from "lucide-react";

export default function PropCloudLanding() {
  useEffect(() => {
    console.log("PropCloudLanding component mounted");
  }, []);

  return (
    <>
      <SEOHead />
      <Analytics />
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold">
              <span className="text-primary">PROP</span>
              <span className="text-foreground">CLOUD</span>
            </div>
            <AuthButton />
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          <NeuralBackground />
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              The Future of{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Real Estate Investment
              </span>{" "}
              is a Conversation
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Meet your AI co-pilot for Short Term Rentals (STR) investing. 
              Instant market analysis, property insights, and investment recommendations—all through natural conversation.
            </p>
            <WaitlistButton size="lg" className="mb-8" />
            <p className="text-sm text-muted-foreground">
              Join 1,000+ investors already using PropCloud
            </p>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-16">
              Why Real Estate Investment is Broken
            </h2>
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Current Reality */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-red-400 mb-6">Current Reality</h3>
                <div className="space-y-4">
                  {[
                    "Hours of research across 10+ websites for one property",
                    "Spreadsheets that break when you need them most",
                    "Guessing at market trends without real data",
                    "Missing profitable opportunities while you research",
                    "Paying thousands for basic market reports"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <X className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PropCloud Way */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-primary mb-6">The PropCloud Way</h3>
                <div className="space-y-4">
                  {[
                    "Ask questions in plain English, get instant answers",
                    "AI-powered analysis of thousands of data points",
                    "Real-time market insights and trend predictions",
                    "Never miss a deal with automated opportunity alerts",
                    "Professional-grade analysis for the price of coffee"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-16">
              Everything You Need to Invest Smarter
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="text-center space-y-6 p-6">
                <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Precision Property Analysis</h3>
                <p className="text-muted-foreground">
                  Get comprehensive property insights including cash flow projections, 
                  market comparables, and investment potential—all in seconds.
                </p>
              </div>
              <div className="text-center space-y-6 p-6">
                <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Real-Time Market Intelligence</h3>
                <p className="text-muted-foreground">
                  Stay ahead with live market trends, neighborhood analytics, 
                  and predictive insights powered by millions of data points.
                </p>
              </div>
              <div className="text-center space-y-6 p-6">
                <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">AI-Powered Decision Making</h3>
                <p className="text-muted-foreground">
                  Make confident investment decisions with AI that analyzes 
                  thousands of variables to identify the best opportunities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Chat Demo */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-4">
              See PropCloud in Action
            </h2>
            <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
              Watch how natural conversation transforms complex real estate analysis 
              into simple, actionable insights.
            </p>
            <ChatDemo />
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 text-center">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Real Estate Investing?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of investors who've already discovered the power of AI-driven real estate analysis.
            </p>
            <WaitlistButton size="lg" />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-6 text-center text-muted-foreground">
            <p>contact@propcloud.ai</p>
            <p className="mt-2">© 2025 PropCloud Inc. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
