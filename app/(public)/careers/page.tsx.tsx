import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';


const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const positions = [
  { title: 'Senior React Developer', location: 'Islamabad', type: 'Full-time', desc: 'Build scalable web apps with React, TypeScript, and modern tools.' },
  { title: 'Digital Marketing Manager', location: 'Rawalpindi', type: 'Full-time', desc: 'Lead SEO, SEM, and social media campaigns for global clients.' },
  { title: 'UI/UX Designer', location: 'Remote', type: 'Contract', desc: 'Design beautiful, user-centric interfaces for enterprise products.' },
  { title: 'DevOps Engineer', location: 'Islamabad', type: 'Full-time', desc: 'Manage cloud infrastructure, CI/CD, and monitoring systems.' },
  { title: 'Business Development Executive', location: 'International', type: 'Full-time', desc: 'Expand our client base in UK, USA, and Middle East markets.' },
];

const benefits = [
  { icon: Sparkles, title: 'Innovation First', desc: 'Work with cutting-edge technologies daily.' },
  { icon: Users, title: 'Collaborative Culture', desc: 'A diverse, inclusive team that values every voice.' },
  { icon: Briefcase, title: 'Growth Opportunities', desc: 'Mentorship, training, and clear career paths.' },
  { icon: MapPin, title: 'Flexible Work', desc: 'Remote/office hybrid with global team.' },
];

const timeline = [
  { year: '2018', event: 'Founded in Islamabad' },
  { year: '2019', event: 'First international client (UK)' },
  { year: '2020', event: 'Rawalpindi office opened' },
  { year: '2021', event: '100+ projects milestone' },
  { year: '2023', event: 'Middle East & European expansion' },
  { year: '2025', event: 'AI & SaaS platform launch' },
];

const Careers = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <SEOHead title="Careers at AM Enterprises" description="Jobs in Islamabad Rawalpindi Pakistan & International Opportunities. Join our innovative team." keywords="careers Islamabad Pakistan, jobs digital marketing Rawalpindi, SaaS jobs international" />
      <section className="section-padding gradient-hero-bg min-h-[40vh] flex items-center">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl sm:text-5xl font-bold mb-4">{t('careers.title')}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg max-w-xl mx-auto">{t('careers.subtitle')}</motion.p>
        </div>
      </section>

      {/* Why Join */}
      <section className="section-padding">
        <div className="container mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">{t('careers.whyJoin')}</h2>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <motion.div key={b.title} variants={fadeInUp} className="glass-card rounded-2xl p-6 text-center group">
                <div className="w-14 h-14 rounded-xl gradient-bg mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <b.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold mb-2">{b.title}</h3>
                <p className="text-muted-foreground text-sm">{b.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="section-padding gradient-hero-bg">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-center mb-12">{t('careers.openPositions')}</h2>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4">
            {positions.map((pos) => (
              <motion.div key={pos.title} variants={fadeInUp} className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div>
                  <h3 className="font-display text-lg font-semibold mb-1">{pos.title}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{pos.desc}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {pos.location}</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{pos.type}</span>
                  </div>
                </div>
                <Link to="/contact" className="neon-btn px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shrink-0 whitespace-nowrap">
                  {t('careers.applyNow')} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-center mb-12">Our Journey</h2>
          {timeline.map((item, i) => (
            <motion.div key={item.year} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="flex gap-6 mb-8 last:mb-0">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                  {item.year}
                </div>
                {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
              </div>
              <div className="pb-4">
                <p className="font-semibold">{item.event}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Careers;
