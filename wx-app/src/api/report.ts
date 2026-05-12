import { request } from './request';

export type ReportTargetType = 'POST' | 'COMMENT' | 'USER';
export type ReportReason = 'PORN' | 'POLITICS' | 'AD' | 'ATTACK' | 'FAKE' | 'OTHER';

export function createReport(data: {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  detail?: string;
}) {
  return request<{ id: number }>({
    url: '/report',
    method: 'POST',
    data,
  });
}
