import { ProjectStatus } from '@/types';
import { STATUS_CONFIG, classNames } from '@/lib/utils';

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={classNames('badge', cfg.bg, cfg.color)}>
      <span
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}