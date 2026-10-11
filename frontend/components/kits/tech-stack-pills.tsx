import React from 'react';
import { Badge } from '../ui/badge';

interface TechStackPillsProps {
  stack: string[];
  maxDisplay?: number;
  onSelectTag?: (tag: string) => void;
  selectedTags?: string[];
  className?: string;
}

export function TechStackPills({
  stack,
  maxDisplay = 4,
  onSelectTag,
  selectedTags = [],
  className,
}: TechStackPillsProps) {
  const displayed = stack.slice(0, maxDisplay);
  const remaining = stack.length - maxDisplay;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className || ''}`}>
      {displayed.map((tech) => {
        const isSelected = selectedTags.some(
          (t) => t.toLowerCase() === tech.toLowerCase()
        );

        return (
          <button
            key={tech}
            type="button"
            onClick={(e) => {
              if (onSelectTag) {
                e.preventDefault();
                e.stopPropagation();
                onSelectTag(tech);
              }
            }}
            className={`transition-transform active:scale-95 ${
              onSelectTag ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <Badge
              size="sm"
              variant={isSelected ? 'purple' : 'secondary'}
              className="font-mono text-[11px]"
            >
              {tech}
            </Badge>
          </button>
        );
      })}

      {remaining > 0 && (
        <Badge size="sm" variant="outline" className="text-[10px] text-zinc-500">
          +{remaining} more
        </Badge>
      )}
    </div>
  );
}
