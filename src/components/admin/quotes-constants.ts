export const STATUS_FILTERS = [
  'New',
  'Hot',
  'Warm',
  'Cold',
  'Hold',
  'Archived',
] as const
export type Status = (typeof STATUS_FILTERS)[number]
