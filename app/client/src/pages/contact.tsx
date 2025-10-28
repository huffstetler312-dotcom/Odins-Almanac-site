import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    restaurantName: "",
    locations: "1",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Request Received!",
        description: "We'll contact you within 24 hours to schedule your demo.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        restaurantName: "",
        locations: "1",
        message: "",
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Get a Personalized Demo
          </h1>
          <p className="text-xl text-muted-foreground">
            See how our AI-powered platform can save your restaurant thousands every month
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card data-testid="card-contact-form">
            <CardHeader>
              <CardTitle>Request a Demo</CardTitle>
              <CardDescription>
                Fill out the form below and we'll schedule a personalized walkthrough
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="John Smith"
                    required
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="john@restaurant.com"
                    required
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Restaurant Name *</Label>
                  <Input
                    id="restaurantName"
                    value={formData.restaurantName}
                    onChange={(e) => handleChange("restaurantName", e.target.value)}
                    placeholder="My Restaurant"
                    required
                    data-testid="input-restaurant-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locations">Number of Locations</Label>
                  <Select
                    value={formData.locations}
                    onValueChange={(value) => handleChange("locations", value)}
                  >
                    <SelectTrigger data-testid="select-locations">
                      <SelectValue placeholder="Select number of locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Location</SelectItem>
                      <SelectItem value="2-3">2-3 Locations</SelectItem>
                      <SelectItem value="4-10">4-10 Locations</SelectItem>
                      <SelectItem value="10+">10+ Locations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Tell us about your needs (optional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="e.g., We struggle with food waste and want to see how your AI predictions work..."
                    rows={4}
                    data-testid="input-message"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid="button-submit-contact"
                >
                  {isSubmitting ? "Submitting..." : "Request Demo"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  We typically respond within 24 hours
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info & Benefits */}
          <div className="space-y-6">
            <Card data-testid="card-contact-info">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-sm text-muted-foreground">support@restaurantai.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-sm text-muted-foreground">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Business Hours</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri: 9am - 6pm EST</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-sm text-muted-foreground">Remote-first company</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-demo-includes">
              <CardHeader>
                <CardTitle>What's Included in Your Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <span>Live walkthrough of AI predictions with your data</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <span>Custom ROI analysis for your restaurant</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <span>POS integration planning session</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <span>Q&A with restaurant tech specialist</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary text-xs">✓</span>
                    </div>
                    <span>Volume pricing discussion (5+ locations)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-primary/5" data-testid="card-enterprise">
              <CardHeader>
                <CardTitle>Enterprise Solutions</CardTitle>
                <CardDescription>For 5+ locations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  We offer custom pricing, dedicated support, and white-label options for multi-location restaurants and franchises.
                </p>
                <Button variant="outline" className="w-full" data-testid="button-enterprise">
                  Learn More About Enterprise
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
