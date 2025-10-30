import React from 'react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Properties Managed', value: '2,500+' },
  { label: 'Rent Collected Monthly', value: '$4.2M' },
  { label: 'Maintenance Tickets Resolved', value: '18k+' },
  { label: 'Average Response Time', value: '<4 hrs' },
];

const features = [
  {
    title: 'Unified Property Dashboard',
    description: 'Monitor occupancy, rent collection and maintenance KPIs from a single command center built for modern portfolios.',
    image: '/images/feature1-icon.png',
  },
  {
    title: 'Automated Rent Collection',
    description: 'Flexible payment schedules, instant reminders, late-fee automation and reconciliation that keeps your books accurate.',
    image: '/images/feature2-icon.png',
  },
  {
    title: 'Tenant & Vendor Portals',
    description: 'Give tenants and contractors the tools they need to collaborate, submit requests and track progress in real-time.',
    image: '/images/feature3-icon.png',
  },
];

const workflowSteps = [
  {
    title: 'Onboard in Minutes',
    description: 'Import existing units, leases and stakeholders with guided checklists and smart defaults.',
  },
  {
    title: 'Engage Your Tenants',
    description: 'Launch branded portals, send invitations and keep everyone aligned with automated messaging.',
  },
  {
    title: 'Scale with Insights',
    description: 'Drill into performance trends, forecast revenue and identify inefficiencies before they grow.',
  },
];

const testimonials = [
  {
    quote:
      '“NyumbaSync centralised our scattered spreadsheets into one live system. Maintenance SLAs improved by 43% within the first quarter.”',
    name: 'Cynthia Waweru',
    role: 'Director of Operations, Prime Dwellings',
  },
  {
    quote:
      '“The automated rent reminders and digital receipts freed up two full-time roles. Our tenants love the transparency.”',
    name: 'Michael Otieno',
    role: 'Managing Partner, UrbanNest Properties',
  },
];

const faqs = [
  {
    question: 'Is NyumbaSync suitable for mixed portfolios?',
    answer:
      'Absolutely. Manage residential, commercial and short-let units side-by-side with custom reporting per asset class.',
  },
  {
    question: 'How long does implementation take?',
    answer:
      'Most teams go live in under two weeks. Our concierge onboarding imports your historical data and trains your staff.',
  },
  {
    question: 'Can tenants pay with mobile money?',
    answer:
      'Yes. Accept M-Pesa, cards and bank transfers with automatic ledger reconciliation and instant receipts.',
  },
];

function LandingPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <Link to="/" className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            <img src="/images/logo.png" alt="NyumbaSync" className="h-10 w-10 rounded-full bg-white/10 p-1" />
            NyumbaSync
          </Link>

          <nav className="flex items-center gap-10 text-sm font-medium text-white/70">
            <a href="#features" className="transition hover:text-white">
              Product
            </a>
            <a href="#workflow" className="transition hover:text-white">
              How it works
            </a>
            <a href="#testimonials" className="transition hover:text-white">
              Success stories
            </a>
            <a href="#faq" className="transition hover:text-white">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-16 pt-24 lg:flex-row lg:items-center">
          <div className="max-w-xl space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
              Property operations reimagined
            </span>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Grow your property portfolio with intelligent automation and human-friendly tools.
            </h1>
            <p className="text-lg text-white/70">
              NyumbaSync powers landlords, property managers and tenant communities with a single platform for rent collection,
              maintenance, compliance and reporting — available on web and mobile.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400"
              >
                Create free account
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View dashboards
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wide text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-indigo-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/60 via-purple-500/40 to-cyan-400/30" />
            <img src="/images/hero-image.jpg" alt="Dashboard preview" className="relative h-full w-full object-cover mix-blend-luminosity" />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-slate-950/80 p-6">
              <p className="text-sm font-semibold text-white">Live occupancy overview</p>
              <p className="mt-2 text-xs text-white/60">
                Track rent status, maintenance load and tenant communications with zero spreadsheets.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="bg-slate-900/60">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Everything your team needs in one workspace</h2>
              <p className="mt-4 text-base text-white/70">
                Replace point solutions with a connected ecosystem that keeps finance, operations and customer experience in sync.
              </p>
            </div>

            <div className="mt-16 grid gap-10 md:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group h-full rounded-3xl border border-white/10 bg-slate-950/40 p-8 transition hover:-translate-y-2 hover:border-indigo-400/60 hover:bg-slate-900/70"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20">
                    <img src={feature.image} alt="" className="h-10 w-10" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-200">
                Seamless workflow
              </span>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                From tenant application to renewals — run it all without leaving NyumbaSync.
              </h2>
              <p className="text-base text-white/70">
                Guided workflows keep your team aligned, automate approvals and surface insights the moment they matter.
              </p>
            </div>

            <div className="grid gap-6">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-200">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm text-white/70">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="bg-slate-900/60">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Trusted by high-performing property teams</h2>
              <p className="mt-3 text-base text-white/70">
                See how NyumbaSync accelerates growth for landlords, REITs and property managers across Africa.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.name}
                  className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/50 p-8 shadow-xl shadow-indigo-500/10"
                >
                  <blockquote className="text-left text-lg italic text-white/80">{testimonial.quote}</blockquote>
                  <figcaption className="mt-6 text-left">
                    <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                    <p className="text-xs text-white/60">{testimonial.role}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Frequently asked questions</h2>
            <p className="mt-3 text-base text-white/70">
              Everything you need to know about using NyumbaSync as your property operations backbone.
            </p>
          </div>

          <div className="mt-14 grid gap-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-left">
                <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                <p className="mt-2 text-sm text-white/70">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20" />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-12 text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Ready to modernise your property operations?</h2>
            <p className="max-w-2xl text-base text-white/70">
              Start with a 14-day pilot sandbox. Invite your team, automate your first workflows and access expert onboarding at no cost.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400"
              >
                Launch pilot
              </Link>
              <a
                href="mailto:hello@nyumbasync.com"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Talk to sales
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} NyumbaSync. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="mailto:hello@nyumbasync.com" className="transition hover:text-white">
              hello@nyumbasync.com
            </a>
            <Link to="/login" className="transition hover:text-white">
              Login
            </Link>
            <Link to="/signup" className="transition hover:text-white">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
