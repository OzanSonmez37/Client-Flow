import { ProjectStatus } from '@/types';
import { STATUS_CONFIG, classNames } from '@/lib/utils';

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={classNames('badge', cfg.bg, cfg.color)}>
      <span
        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}