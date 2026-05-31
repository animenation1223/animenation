import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'We deliver across India in 3-7 business days depending on your location. Metro cities usually receive orders within 3-4 days. We ship via trusted courier partners like Delhivery and BlueDart.',
  },
  {
    q: 'Do you offer Cash on Delivery (COD)?',
    a: 'Yes! COD is available on all orders across India. You can also pay via UPI (Google Pay, PhonePe, Paytm), credit/debit cards, and net banking.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a 7-day easy return policy. If you receive a damaged or wrong product, simply contact us within 7 days of delivery and we\'ll arrange a free return and replacement.',
  },
  {
    q: 'Are the products authentic?',
    a: 'Yes, all our merchandise is 100% genuine and high-quality. Our T-shirts are made with 180+ GSM cotton, and our figures are sourced from authorized distributors.',
  },
  {
    q: 'Is shipping free?',
    a: 'Shipping is FREE on all orders above ₹999. For orders below ₹999, a flat shipping fee of ₹79 applies.',
  },
  {
    q: 'What sizes do you offer for T-shirts and hoodies?',
    a: 'We offer sizes from S to 3XL. Each product page has a detailed size chart to help you find your perfect fit. Our oversized tees have a relaxed, drop-shoulder fit.',
  },
  {
    q: 'Can I track my order?',
    a: 'Absolutely! Once your order is shipped, you\'ll receive a tracking ID via email and SMS. You can also track your order in the "My Orders" section of our website.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently, we only ship within India. International shipping is coming soon! Stay tuned by subscribing to our newsletter.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept UPI (Google Pay, PhonePe, Paytm), credit and debit cards (Visa, Mastercard, RuPay), net banking, and Cash on Delivery (COD).',
  },
  {
    q: 'How do I contact customer support?',
    a: 'You can reach us at support@animenation.in or call us at +91 98765 43210. We typically respond within 24 hours.',
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-syne font-bold text-3xl sm:text-4xl text-foreground">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-sm mt-2">Everything you need to know about AnimeNation India</p>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-2">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border/50 rounded-xl bg-card px-5 data-[state=open]:border-primary/20">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:text-primary py-4 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm mb-3">Still have questions?</p>
          <Link to="/contact" className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
            Contact our support team →
          </Link>
        </div>
      </div>
    </div>
  );
}