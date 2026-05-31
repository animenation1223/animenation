import React, { useState } from 'react';
import { base44 } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { toastService } from '@/lib/toast-service';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill required fields');
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.ContactMessage.create(form);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toastService.handleApiError(error, 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-syne font-bold text-3xl sm:text-4xl text-foreground">Get in Touch</h1>
          <p className="text-muted-foreground text-sm mt-2">We'd love to hear from you. Drop us a message!</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl bg-card border border-border/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name *</Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-muted/50 border-border mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email *</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-muted/50 border-border mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="bg-muted/50 border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Message *</Label>
                <Textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="bg-muted/50 border-border mt-1 min-h-[120px]" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 h-12 font-syne font-bold">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Send Message
              </Button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-xl bg-card border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Email Us</p>
                  <p className="text-xs text-muted-foreground">support@animenation.in</p>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Call Us</p>
                  <p className="text-xs text-muted-foreground">+91 98765 43210</p>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Visit Us</p>
                  <p className="text-xs text-muted-foreground">Mumbai, Maharashtra, India</p>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <p className="text-sm font-medium text-foreground mb-1">Response Time</p>
              <p className="text-xs text-muted-foreground">We typically respond within 24 hours. For urgent queries, call us directly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}