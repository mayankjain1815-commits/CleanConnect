import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion.jsx';
import { ArrowLeft, CheckCircle2, HelpCircle, Sparkles } from 'lucide-react';

const TONES = {
  citizen: {
    badge: 'bg-sage/15 text-cream border-sage/40',
    hero: 'from-sage/20 via-burgundy-light/25 to-background-dark',
    icon: 'bg-sage text-burgundy-deeper',
    button: 'bg-sage text-burgundy-deeper hover:bg-sage-light',
    link: 'text-sage-light hover:text-cream',
    sectionIcon: 'bg-sage/10 border-sage/30 text-sage-light',
    step: 'bg-sage text-burgundy-deeper',
    check: 'text-sage-light',
    note: 'border-cream/25 bg-cream/10 text-cream',
    chip: 'border-sage/30 bg-sage/5 hover:border-sage/60',
  },
  driver: {
    badge: 'bg-cream/15 text-cream border-cream/40',
    hero: 'from-cream/20 via-burgundy-light/30 to-background-dark',
    icon: 'bg-cream text-burgundy',
    button: 'bg-cream text-burgundy hover:bg-cream-light',
    link: 'text-cream hover:text-sage-light',
    sectionIcon: 'bg-cream/10 border-cream/30 text-cream',
    step: 'bg-cream text-burgundy',
    check: 'text-cream',
    note: 'border-sage/30 bg-sage/10 text-sage-light',
    chip: 'border-cream/25 bg-cream/5 hover:border-cream/50',
  },
  admin: {
    badge: 'bg-burgundy-light/40 text-cream border-cream/30',
    hero: 'from-burgundy-light/50 via-sage/10 to-background-dark',
    icon: 'bg-burgundy-light text-cream border border-cream/25',
    button: 'bg-cream text-burgundy hover:bg-cream-light',
    link: 'text-cream hover:text-sage-light',
    sectionIcon: 'bg-burgundy-light/40 border-cream/20 text-cream',
    step: 'bg-burgundy-light text-cream',
    check: 'text-sage-light',
    note: 'border-cream/25 bg-cream/10 text-cream',
    chip: 'border-burgundy-light/50 bg-burgundy-light/15 hover:border-cream/40',
  },
};

const SectionCard = ({ section, tone }) => {
  const Icon = section.icon || Sparkles;

  return (
    <section
      id={section.id}
      className="scroll-mt-24 rounded-2xl border border-border bg-background-darker p-6 sm:p-8"
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${tone.sectionIcon}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
          {section.description && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{section.description}</p>
          )}
        </div>
      </div>

      {section.steps?.length > 0 && (
        <ol className="mt-6 space-y-4">
          {section.steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${tone.step}`}>
                {index + 1}
              </span>
              <span className="text-sm leading-relaxed text-foreground">{step}</span>
            </li>
          ))}
        </ol>
      )}

      {section.bullets?.length > 0 && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-background-dark/60 p-3">
              <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${tone.check}`} />
              <span className="text-sm leading-relaxed text-foreground">{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      {section.note && (
        <div className={`mt-6 rounded-xl border p-4 text-sm leading-relaxed ${tone.note}`}>
          {section.note}
        </div>
      )}
    </section>
  );
};

const InstructionsPage = ({
  roleName,
  toneKey,
  title,
  subtitle,
  heroIcon: HeroIcon,
  dashboardPath,
  sections = [],
  faqs = [],
}) => {
  const tone = TONES[toneKey] || TONES.citizen;

  return (
    <>
      <Helmet>
        <title>{roleName} Instructions - CleanConnect</title>
        <meta name="description" content={`Step-by-step CleanConnect guide for ${roleName.toLowerCase()}s`} />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-background-dark">
        <div className={`border-b border-border bg-gradient-to-br ${tone.hero}`}>
          <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest ${tone.badge}`}>
                {roleName} guide
              </span>
              <Link to={dashboardPath} className={`inline-flex items-center text-sm font-medium ${tone.link}`}>
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to dashboard
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-5">
              <div className={`hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl sm:flex ${tone.icon}`}>
                <HeroIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground sm:text-4xl" style={{ letterSpacing: '-0.02em' }}>
                  {title}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>
              </div>
            </div>

            {sections.length > 0 && (
              <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((section) => {
                  const Icon = section.icon || Sparkles;
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`flex items-center gap-2 rounded-xl border bg-background-dark/40 px-3 py-2.5 text-sm text-foreground transition-colors ${tone.chip}`}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-80" />
                      <span className="truncate">{section.title}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <main className="mx-auto max-w-5xl space-y-6 px-4 py-12">
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} tone={tone} />
          ))}

          {faqs.length > 0 && (
            <section id="faq" className="scroll-mt-24 rounded-2xl border border-border bg-background-darker p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${tone.sectionIcon}`}>
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Frequently asked questions</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Quick answers to the most common questions.</p>
                </div>
              </div>

              <Accordion type="single" collapsible className="mt-6">
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`faq-${index}`} className="border-border">
                    <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}

          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-background-darker p-6 text-center sm:flex-row sm:text-left">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Still need help?</h2>
              <p className="text-sm text-muted-foreground">Use the in-app complaint form or contact your zone administrator.</p>
            </div>
            <Link to={dashboardPath}>
              <Button className={tone.button}>
                Go to dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
};

export default InstructionsPage;
