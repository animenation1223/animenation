import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground mb-4 flex-wrap">
      <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="w-3 h-3" />
        <span>Home</span>
      </Link>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          {item.path && i < items.length - 1 ? (
            <Link to={item.path} className="hover:text-foreground transition-colors truncate max-w-[120px]">
              {item.name}
            </Link>
          ) : (
            <span className="text-foreground font-medium truncate max-w-[180px]">{item.name}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}