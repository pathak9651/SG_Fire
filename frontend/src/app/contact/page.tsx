'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="bg-gray-900 py-16 px-4 sm:px-6 lg:px-8 text-center relative border-b border-gray-800">
        <div className="absolute inset-0 bg-red-900/10 dark:bg-red-900/5" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight">
            Contact Us
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            Have a question or need a quote? Our fire safety experts are here to help.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:grid lg:grid-cols-3 lg:gap-16">
          
          {/* Contact Information */}
          <div className="lg:col-span-1 mb-12 lg:mb-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Whether you're looking for product recommendations, need to schedule a maintenance visit, or require emergency support, we're just a message away.
            </p>

            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
                  <MapPin className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Head Office</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                    123 Safety Avenue, Industrial Estate<br />
                    Mumbai, Maharashtra 400001<br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
                  <Phone className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Phone</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    <span className="block font-medium text-gray-900 dark:text-gray-300">Sales & General:</span>
                    +91-9876543210
                  </p>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    <span className="block font-medium text-red-600 dark:text-red-500">24/7 Emergency Support:</span>
                    +91-9876543211
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
                  <Mail className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    <span className="block">contact@sgfire.com</span>
                    <span className="block mt-1">support@sgfire.com</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
                  <Clock className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Business Hours</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 9:00 AM - 1:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Send us a Message</h2>
              
              {status === 'success' ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-xl p-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Message Sent Successfully!</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Thank you for reaching out. A member of our team will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Inquiry Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      >
                        <option value="">Select a subject...</option>
                        <option value="sales">Product Sales & Quotes</option>
                        <option value="service">Service & Maintenance</option>
                        <option value="support">Technical Support</option>
                        <option value="other">Other Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={status === 'submitting'}
                      className="w-full sm:w-auto flex justify-center items-center"
                    >
                      {status === 'submitting' ? 'Sending...' : (
                        <>
                          <Send className="w-5 h-5 mr-2" /> Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
