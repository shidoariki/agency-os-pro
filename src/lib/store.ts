// src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ServiceItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  estimatedDays: number;
};

export type CartItem = ServiceItem & { 
  quantity: number;
  customPrice?: number; 
};

type QuoteStore = {
  selectedItems: CartItem[];
  discount: number;
  tax: number;
  notes: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'INR';
  currencySymbol: string;
  
  addItem: (item: ServiceItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  updateItemPrice: (id: string, newPrice: number) => void;
  setDiscount: (percent: number) => void;
  setTax: (percent: number) => void;
  setNotes: (text: string) => void;
  setCurrency: (code: 'USD' | 'EUR' | 'GBP' | 'INR') => void;
  
  subtotal: number;
  total: number;
  totalDays: number;
};

const SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };

export const useQuoteStore = create<QuoteStore>()(
  persist(
    (set, get) => ({
      selectedItems: [],
      discount: 0,
      tax: 0,
      notes: '',
      currency: 'USD',
      currencySymbol: '$',
      subtotal: 0,
      total: 0,
      totalDays: 0,

      addItem: (item) => {
        const state = get();
        if (state.selectedItems.find((i) => i.id === item.id)) return;
        const newItems = [...state.selectedItems, { ...item, quantity: 1, customPrice: item.price }];
        set({ selectedItems: newItems, ...calculateTotals(newItems, state.discount, state.tax) });
      },

      updateItemPrice: (id, newPrice) => {
        const state = get();
        const newItems = state.selectedItems.map(item => 
          item.id === id ? { ...item, customPrice: newPrice } : item
        );
        set({ selectedItems: newItems, ...calculateTotals(newItems, state.discount, state.tax) });
      },

      setCurrency: (code) => set({ currency: code, currencySymbol: SYMBOLS[code] }),

      removeItem: (id) => {
        const state = get();
        const newItems = state.selectedItems.filter((i) => i.id !== id);
        set({ selectedItems: newItems, ...calculateTotals(newItems, state.discount, state.tax) });
      },

      updateQuantity: (id, delta) => {
        const state = get();
        const newItems = state.selectedItems.map((item) => {
          if (item.id === id) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        });
        set({ selectedItems: newItems, ...calculateTotals(newItems, state.discount, state.tax) });
      },

      setDiscount: (percent) => {
        const state = get();
        set({ discount: percent, ...calculateTotals(state.selectedItems, percent, state.tax) });
      },

      setTax: (percent) => {
        const state = get();
        set({ tax: percent, ...calculateTotals(state.selectedItems, state.discount, percent) });
      },

      setNotes: (text) => set({ notes: text }),
    }),
    { name: 'agency-command-storage' }
  )
);

const calculateTotals = (items: CartItem[], discountRate: number, taxRate: number) => {
  const subtotal = items.reduce((sum, item) => sum + ((item.customPrice || item.price) * item.quantity), 0);
  const totalDays = items.reduce((sum, item) => sum + (item.estimatedDays * item.quantity), 0);
  const discountAmount = subtotal * (discountRate / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const total = taxableAmount + taxAmount;
  return { subtotal, total, totalDays };
};

export const SERVICES: ServiceItem[] = [
  { id: 'dev_1', name: 'Landing Page', price: 500, estimatedDays: 3, category: 'Development', description: 'Conversion-optimized React landing page.' },
  { id: 'dev_2', name: 'SaaS Platform', price: 4500, estimatedDays: 21, category: 'Development', description: 'Full-stack application with Auth.' },
  { id: 'dev_3', name: 'E-commerce', price: 3000, estimatedDays: 14, category: 'Development', description: 'Stripe-integrated online store.' },
  { id: 'des_1', name: 'Brand Identity', price: 1200, estimatedDays: 7, category: 'Design', description: 'Logo, typography, and color palette.' },
  { id: 'des_2', name: 'UI/UX Prototype', price: 2000, estimatedDays: 10, category: 'Design', description: 'Interactive Figma design system.' },
  { id: 'mkt_1', name: 'SEO Strategy', price: 800, estimatedDays: 5, category: 'Marketing', description: 'Keyword research and on-page optimization.' },
  { id: 'ext_1', name: 'Cloud Hosting', price: 200, estimatedDays: 1, category: 'Extras', description: 'AWS/Vercel production setup.' },

  // Development
  { id: 'dev_4', name: 'Multi-page Website', price: 1200, estimatedDays: 7, category: 'Development', description: 'Responsive multi-page marketing website in React.' },
  { id: 'dev_5', name: 'Blog Platform', price: 1500, estimatedDays: 10, category: 'Development', description: 'CMS-powered blog with admin dashboard.' },
  { id: 'dev_6', name: 'Portfolio Website', price: 700, estimatedDays: 4, category: 'Development', description: 'Personal portfolio with projects and contact form.' },
  { id: 'dev_7', name: 'Admin Dashboard', price: 1800, estimatedDays: 12, category: 'Development', description: 'Analytics dashboard with charts and role-based access.' },
  { id: 'dev_8', name: 'API Development', price: 1300, estimatedDays: 8, category: 'Development', description: 'REST/GraphQL API with documentation.' },
  { id: 'dev_9', name: 'Authentication System', price: 900, estimatedDays: 5, category: 'Development', description: 'JWT/Session-based auth with protected routes.' },
  { id: 'dev_10', name: 'Payment Integration', price: 750, estimatedDays: 4, category: 'Development', description: 'Stripe or Razorpay payment gateway integration.' },
  { id: 'dev_11', name: 'Booking System', price: 2200, estimatedDays: 14, category: 'Development', description: 'Appointment/booking web app with calendar integration.' },
  { id: 'dev_12', name: 'CRM Lite', price: 2600, estimatedDays: 16, category: 'Development', description: 'Lead management and pipeline tracking tool.' },
  { id: 'dev_13', name: 'Real-time Chat', price: 1400, estimatedDays: 9, category: 'Development', description: 'WebSocket-powered real-time messaging system.' },
  { id: 'dev_14', name: 'Landing Page A/B Test', price: 950, estimatedDays: 5, category: 'Development', description: 'Two-variant landing page with split testing setup.' },
  { id: 'dev_15', name: 'Performance Optimization', price: 600, estimatedDays: 3, category: 'Development', description: 'Core Web Vitals and Lighthouse performance improvements.' },
  { id: 'dev_16', name: 'Accessibility Upgrade', price: 650, estimatedDays: 4, category: 'Development', description: 'WCAG-focused accessibility improvements for existing site.' },
  { id: 'dev_17', name: 'Admin Panel for E-commerce', price: 2000, estimatedDays: 12, category: 'Development', description: 'Product management, orders, and inventory dashboard.' },
  { id: 'dev_18', name: 'Landing Page to Multi-step Funnel', price: 1100, estimatedDays: 6, category: 'Development', description: 'Multi-step funnel pages for higher conversion.' },
  { id: 'dev_19', name: 'Custom Form Builder', price: 900, estimatedDays: 5, category: 'Development', description: 'Drag-and-drop dynamic form creation tool.' },
  { id: 'dev_20', name: 'SaaS Billing Module', price: 1700, estimatedDays: 10, category: 'Development', description: 'Subscription billing with trials and coupons.' },
  { id: 'dev_21', name: 'User Analytics Integration', price: 500, estimatedDays: 2, category: 'Development', description: 'Setup for Google Analytics, Plausible, or PostHog.' },
  { id: 'dev_22', name: 'Landing Page Template Pack', price: 800, estimatedDays: 5, category: 'Development', description: 'Reusable React landing page templates.' },
  { id: 'dev_23', name: 'Headless CMS Integration', price: 1500, estimatedDays: 9, category: 'Development', description: 'Contentful/Sanity/Strapi integration for dynamic content.' },

  // Design
  { id: 'des_3', name: 'Landing Page UI Design', price: 900, estimatedDays: 5, category: 'Design', description: 'High-conversion landing page UI in Figma.' },
  { id: 'des_4', name: 'SaaS Dashboard UI Kit', price: 1600, estimatedDays: 9, category: 'Design', description: 'Component-based design system for SaaS dashboards.' },
  { id: 'des_5', name: 'E-commerce UI Design', price: 1400, estimatedDays: 8, category: 'Design', description: 'Storefront, product page, and checkout UI.' },
  { id: 'des_6', name: 'Logo Design', price: 600, estimatedDays: 3, category: 'Design', description: 'Primary logo with variations and usage guidelines.' },
  { id: 'des_7', name: 'Social Media Kit', price: 500, estimatedDays: 3, category: 'Design', description: 'Editable templates for Instagram, LinkedIn, and Twitter.' },
  { id: 'des_8', name: 'Pitch Deck Design', price: 1000, estimatedDays: 6, category: 'Design', description: 'Investor-ready slide deck design.' },
  { id: 'des_9', name: 'Design System Tokens', price: 750, estimatedDays: 4, category: 'Design', description: 'Colors, typography, spacing, and components tokens.' },
  { id: 'des_10', name: 'Brand Style Guide', price: 1300, estimatedDays: 7, category: 'Design', description: 'PDF brand book with usage rules and examples.' },
  { id: 'des_11', name: 'Email Template Design', price: 550, estimatedDays: 3, category: 'Design', description: 'Responsive newsletter and transactional email designs.' },
  { id: 'des_12', name: 'Onboarding Flow UX', price: 950, estimatedDays: 5, category: 'Design', description: 'Frictionless onboarding journey for web apps.' },
  { id: 'des_13', name: 'Mobile-first UI Layouts', price: 800, estimatedDays: 5, category: 'Design', description: 'Responsive mobile-first page layouts.' },
  { id: 'des_14', name: 'Wireframe Package', price: 650, estimatedDays: 4, category: 'Design', description: 'Low-fidelity wireframes for up to 5 key pages.' },

  // Marketing
  { id: 'mkt_2', name: 'Landing Page Copywriting', price: 600, estimatedDays: 3, category: 'Marketing', description: 'Conversion-focused copy for hero, features, and CTA.' },
  { id: 'mkt_3', name: 'Email Welcome Sequence', price: 700, estimatedDays: 4, category: 'Marketing', description: '3–5 part email sequence for new signups.' },
  { id: 'mkt_4', name: 'SaaS Launch Campaign', price: 2200, estimatedDays: 14, category: 'Marketing', description: 'Launch strategy across email, social, and landing pages.' },
  { id: 'mkt_5', name: 'Content Strategy Plan', price: 900, estimatedDays: 5, category: 'Marketing', description: '90-day blog and content roadmap.' },
  { id: 'mkt_6', name: 'Conversion Audit', price: 650, estimatedDays: 3, category: 'Marketing', description: 'Audit of funnel, CTAs, and user journey.' },
  { id: 'mkt_7', name: 'Ad Landing Page Optimization', price: 750, estimatedDays: 4, category: 'Marketing', description: 'Optimization of ad-specific landing pages.' },
  { id: 'mkt_8', name: 'Social Media Launch Kit', price: 800, estimatedDays: 5, category: 'Marketing', description: 'Posts, captions, and assets for new product launch.' },
  { id: 'mkt_9', name: 'E-commerce CRO Package', price: 1200, estimatedDays: 7, category: 'Marketing', description: 'Improve cart, checkout, and upsell flows.' },
  { id: 'mkt_10', name: 'SEO Content Briefs', price: 500, estimatedDays: 3, category: 'Marketing', description: 'SEO-optimized content briefs for writers.' },
  { id: 'mkt_11', name: 'Brand Positioning Workshop', price: 1000, estimatedDays: 5, category: 'Marketing', description: 'Clarify brand message, audience, and USP.' },

  // Extras / Maintenance / Support
  { id: 'ext_2', name: 'Monthly Maintenance', price: 300, estimatedDays: 1, category: 'Extras', description: 'Bug fixes, minor updates, and uptime checks.' },
  { id: 'ext_3', name: 'Analytics Dashboard Setup', price: 400, estimatedDays: 2, category: 'Extras', description: 'Custom analytics dashboard for KPIs.' },
  { id: 'ext_4', name: 'CI/CD Pipeline Setup', price: 600, estimatedDays: 3, category: 'Extras', description: 'Automated deployments with GitHub Actions.' },
  { id: 'ext_5', name: 'Database Optimization', price: 700, estimatedDays: 4, category: 'Extras', description: 'Indexing, query optimization, and backups.' },
  { id: 'ext_6', name: 'Migrations & Refactors', price: 900, estimatedDays: 5, category: 'Extras', description: 'Codebase refactor or tech stack migration support.' },
  { id: 'ext_7', name: 'Technical Consultation', price: 250, estimatedDays: 1, category: 'Extras', description: '90-minute strategy and architecture consulting call.' },
  { id: 'ext_8', name: 'Priority Support Add-on', price: 350, estimatedDays: 1, category: 'Extras', description: 'Priority issue resolution within agreed SLA.' },
  { id: 'ext_9', name: 'Backup & Security Setup', price: 500, estimatedDays: 3, category: 'Extras', description: 'Automated backups, SSL, and security hardening.' },
  { id: 'ext_10', name: 'Staging Environment Setup', price: 300, estimatedDays: 2, category: 'Extras', description: 'Separate staging environment for QA and approvals.' },
  { id: 'ext_11', name: 'Performance Monitoring Setup', price: 350, estimatedDays: 2, category: 'Extras', description: 'Error tracking and performance monitoring tools integration.' }
];
