import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { ChevronRight, Lock, Zap, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function AIAssistant() {
  const { isAuthenticated } = useAuth();
  const { data: subscription } = trpc.subscription.getStatus.useQuery(undefined, { enabled: isAuthenticated });
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! I'm your AI Theory Assistant. Ask me anything about music theory, guitar technique, or request a personalized practice plan." }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessageMutation = trpc.ai.sendMessage.useMutation();

  const handleSendMessage = async (content: string) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({ message: content });
      setMessages((prev) => [...prev, { role: "assistant", content: response.message }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavBar />
        <div className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <MessageSquare className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold mb-4">AI Theory Assistant</h1>
            <p className="text-muted-foreground mb-8">
              Get instant answers to music theory questions, personalized practice plans, and expert guidance from your AI guitar coach.
            </p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-primary text-primary-foreground">
                Sign In to Chat
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription?.isPremium) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavBar />
        <div className="container py-12">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-lg border border-primary/30 bg-card/50 p-8 text-center">
              <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold mb-3">Premium Feature</h2>
              <p className="text-muted-foreground mb-6">
                The AI Theory Assistant is available exclusively to Premium members. Upgrade to unlock personalized AI coaching, theory Q&A, and practice plan generation.
              </p>
              <Link href="/pricing">
                <Button size="lg" className="bg-primary text-primary-foreground">
                  Upgrade to Premium
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">
              AI Theory <span className="text-gold-gradient">Assistant</span>
            </h1>
            <p className="text-muted-foreground">Ask anything about music theory, guitar technique, or get a personalized practice plan.</p>
          </div>

          <AIChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask about theory, technique, or request a practice plan..."
            height={600}
          />

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Instant Answers", desc: "Get immediate responses to music theory questions" },
              { icon: MessageSquare, title: "Practice Plans", desc: "Generate personalized daily practice routines" },
              { icon: ChevronRight, title: "Expert Guidance", desc: "Learn from an AI trained on guitar pedagogy" },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="p-6 border-border">
                  <Icon className="h-6 w-6 text-primary mb-3" />
                  <h3 className="font-display font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
