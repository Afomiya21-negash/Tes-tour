'use client';

import { useState, useMemo } from 'react';
import {
  HelpCircle,
  Mail,
  Settings,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Calendar,
  User,
  MapPin,
  FileText,
  MessageSquare,
  DollarSign,
  CheckCircle,
  Search,
  X,
  LucideIcon
} from 'lucide-react';

interface HelpTopic {
  icon: LucideIcon;
  title: string;
  description: string;
  details: string;
  hidden?: boolean;
}

export default function CustomerSupportPage() {
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);

  const openModal = (topic: HelpTopic) => setSelectedTopic(topic);
  const closeModal = () => setSelectedTopic(null);

  const topics: HelpTopic[] = [
    {
      icon: HelpCircle,
      title: 'Account Help',
      description: 'Learn how to manage your profile, password, and preferences.',
      details: 'Update personal info, reset passwords, and manage sessions. You can access your account settings from the dashboard to modify your email, phone number, and other personal details.'
    },
    {
      icon: CreditCard,
      title: 'Billing & Payments',
      description: 'Understand how payments, invoices, and refunds work.',
      details: 'Make payments for tour bookings, download invoices, and fix billing errors. We accept all major payment methods through Chappa payment gateway. All transactions are secure and encrypted.'
    },
    {
      icon: ShieldCheck,
      title: 'Privacy & Security',
      description: 'How we protect your data and keep your account secure.',
      details: 'Learn about two-factor authentication, phishing protection, and privacy settings. Your data is encrypted and stored securely. We never share your information with third parties without consent.'
    },
    {
      icon: Mail,
      title: 'Communication',
      description: 'Control notifications and email preferences.',
      details: 'Manage newsletters, booking reminders, and email updates. You can customize which notifications you receive and how often in your account settings.'
    },
    {
      icon: User,
      title: 'User Roles',
      description: 'Learn about different account types and permissions.',
      details: 'Understand Customer, Tour Guide, Driver, and Admin access levels. Each role has specific permissions to ensure smooth tour operations and security.'
    },
    {
      icon: Settings,
      title: 'Technical Support',
      description: 'Fix common issues and optimize your experience.',
      details: 'Resolve app errors, loading problems, and compatibility issues. Clear your browser cache, update to the latest version, or contact support for assistance.'
    },
    {
      icon: Calendar,
      title: 'Booking Management',
      description: 'Learn how to book tours and manage your reservations.',
      details: 'Browse available tours, select dates, specify group size, and complete bookings. You can view all your bookings in the dashboard and track their status.'
    },
    {
      icon: MapPin,
      title: 'Tour Destinations',
      description: 'Explore available destinations and tour packages.',
      details: 'View detailed information about each tour destination, including attractions, duration, pricing, and what\'s included. Filter tours by destination, duration, or price.'
    },
    {
      icon: FileText,
      title: 'Tour Itineraries',
      description: 'View detailed day-by-day tour plans.',
      details: 'Each tour includes a detailed itinerary showing daily activities, locations, and schedules. You can download or print itineraries for your reference.'
    },
    {
      icon: MessageSquare,
      title: 'Contact Tour Guide',
      description: 'Communicate with your assigned tour guide.',
      details: 'Once your booking is confirmed and a tour guide is assigned, you can view their contact information and reach out with questions about your tour.'
    },
    {
      icon: DollarSign,
      title: 'Pricing & Refunds',
      description: 'Learn about tour pricing and cancellation policies.',
      details: 'Tour prices vary by destination, duration, and group size. Cancellation policies depend on how far in advance you cancel. Refunds are processed within 5-7 business days.'
    },
    {
      icon: CheckCircle,
      title: 'Booking Confirmation',
      description: 'Understand the booking confirmation process.',
      details: 'After booking, you\'ll receive an email confirmation. Your booking status will update once a tour guide and vehicle are assigned. You can track status in real-time on your dashboard.'
    },
    {
      icon: MessageCircle,
      title: 'Customer Support',
      description: 'Get help from our support team.',
      details: 'Our support team is available via email at support@testour.com or phone at +251-XXX-XXXX. Response time is typically within 24 hours for email inquiries.'
    },
  ];

  const filteredTopics = useMemo(() => {
    return topics.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const displayedTopics = useMemo(() => {
    if (search.trim() === '') {
      return topics.filter(t => !t.hidden);
    }
    return filteredTopics;
  }, [search, filteredTopics]);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 font-sans text-gray-800">
      {/* Header Section */}
      <section className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Need Help?</h1>
        <p className="text-gray-600 text-lg">
          We're here to assist you. Browse our FAQs or reach out to our support team for personalized help.
        </p>
      </section>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="flex items-center bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-300">
          <span className="pl-4 text-gray-400">
            <Search className="w-5 h-5" />
          </span>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search for help articles..."
            className="flex-1 px-4 py-3 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none"
          />

          <button
            className="mr-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 active:scale-[0.97]"
            onClick={() => console.log('Searching for:', search)}
          >
            Search
          </button>
        </div>
      </div>

      {/* Help Topics Grid */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedTopics.map((topic, i) => {
          const IconComponent = topic.icon;
          return (
            <div
              key={i}
              onClick={() => openModal(topic)}
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition cursor-pointer transform hover:scale-105 duration-300"
            >
              <div className="flex items-center mb-4">
                <IconComponent className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">{topic.title}</h3>
              </div>
              <p className="text-gray-600">{topic.description}</p>
            </div>
          );
        })}
      </section>

      {/* No Results */}
      {displayedTopics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No help articles found matching "{search}"</p>
          <p className="text-gray-400 mt-2">Try different keywords or browse all topics</p>
        </div>
      )}

      {/* Modal */}
      {selectedTopic && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-lg max-w-3xl w-full mx-4 p-8 relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full p-2 transition"
              onClick={closeModal}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center mb-4">
              {(() => {
                const IconComponent = selectedTopic.icon;
                return <IconComponent className="w-10 h-10 text-blue-600 mr-3" />;
              })()}
              <h2 className="text-2xl font-bold text-gray-900">{selectedTopic.title}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">{selectedTopic.details}</p>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Still need help? Contact our support team at{' '}
                <a href="mailto:support@testour.com" className="text-blue-600 hover:underline">
                  support@testour.com
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}