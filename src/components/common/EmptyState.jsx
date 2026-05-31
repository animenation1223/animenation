import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function EmptyState({ icon, title, description, cta, ctaLink, ctaAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-4 text-center"
    >
      <div className="text-6xl mb-5">{icon || '🎌'}</div>
      <h2 className="font-syne font-extrabold text-xl sm:text-2xl text-foreground mb-3">{title}</h2>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">{description}</p>
      {cta && (
        ctaLink ? (
          <Link to={ctaLink}>
            <Button className="bg-primary hover:bg-primary/90 font-syne font-bold px-8 h-11 glow-red">
              {cta}
            </Button>
          </Link>
        ) : (
          <Button onClick={ctaAction} className="bg-primary hover:bg-primary/90 font-syne font-bold px-8 h-11 glow-red">
            {cta}
          </Button>
        )
      )}
    </motion.div>
  );
}