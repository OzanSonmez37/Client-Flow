import { ProjectStatus } from '@/types';
import { STATUS_CONFIG } from '@/lib/utils';
import { classNames } from '@/lib/utils';

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={classNames('badge', cfg.bg, cfg.color)}>
      <span className={classNames('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}
