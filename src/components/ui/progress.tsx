import { cn } from '@/lib/utils';

interface ProgressProps {
  value?: number;
  className?: string;
}

function Progress({ value = 0, className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      data-slot="progress"
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-zinc-800', className)}
    >
      <div
        className="h-full rounded-full bg-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export { Progress };
