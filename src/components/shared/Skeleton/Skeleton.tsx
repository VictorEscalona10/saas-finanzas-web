import './Skeleton.css';

type SkeletonVariant = 'text' | 'title' | 'avatar' | 'card' | 'table-row';

interface SkeletonProps {
  variant?: SkeletonVariant;
  lines?: number;
  className?: string;
}

export default function Skeleton({ variant = 'text', lines, className = '' }: SkeletonProps) {
  if (lines && variant === 'text') {
    return (
      <div className="skeleton__lines">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton__line"
            style={{
              width: i === lines - 1 ? '60%' : `${70 + ((i * 13) % 30)}%`,
              ['--i' as string]: i,
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={`skeleton skeleton--${variant} ${className}`} />;
}
