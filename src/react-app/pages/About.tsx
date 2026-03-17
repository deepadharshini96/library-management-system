import { Link } from "react-router";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import Navbar from "@/react-app/components/Navbar";
import Footer from "@/react-app/components/Footer";
import {
  BookOpen,
  Users,
  Clock,
  Shield,
  Heart,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function About() {
  const features = [
    {
      icon: BookOpen,
      title: "Extensive Collection",
      description: "Access thousands of books across all genres and categories.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join a vibrant community of book lovers and share recommendations.",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Borrow and return books anytime with our digital system.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your reading history and personal information are always protected.",
    },
  ];

  const stats = [
    { value: "10,000+", label: "Books Available" },
    { value: "2,500+", label: "Active Members" },
    { value: "50+", label: "Book Categories" },
    { value: "24/7", label: "Library Access" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border">
          <div className="container mx-auto px-4 py-20 lg:py-28">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                <Heart className="w-3 h-3 mr-1" />
                About Biblion
              </Badge>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Your Digital Library{" "}
                <span className="text-primary">Experience</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Biblion is more than just a library management system. We're building a community
                where book lovers can discover, borrow, and share their passion for reading.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/catalog">
                  <Button size="lg" className="gap-2">
                    <BookOpen className="w-5 h-5" />
                    Explore Books
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Users className="w-5 h-5" />
                    Join Community
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground">
                  To democratize access to knowledge and foster a love for reading in our community.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Why Choose Biblion?</h3>
                  <p className="text-muted-foreground mb-6">
                    We believe that everyone should have access to quality books and educational resources.
                    Our digital platform makes it easier than ever to discover, borrow, and enjoy books from
                    the comfort of your home.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Free membership with no hidden fees</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Instant access to our entire collection</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Personalized recommendations based on your reading history</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Community features to connect with fellow readers</span>
                    </li>
                  </ul>
                </div>

                <div className="relative">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-primary" />
                  </div>
                  <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground p-3 rounded-full">
                    <Star className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                What We Offer
              </h2>
              <p className="text-lg text-muted-foreground">
                Discover the features that make Biblion the perfect digital library for you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Reading?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of readers who have discovered their next favorite book through Biblion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Users className="w-5 h-5" />
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/catalog">
                <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  <BookOpen className="w-5 h-5" />
                  Browse Books
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}