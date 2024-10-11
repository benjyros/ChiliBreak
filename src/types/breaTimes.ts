export interface BreakTime {
  hour: number;
  minute: number;
  label: string;
}

export const breakTimes: BreakTime[] = [
  { hour: 9, minute: 45, label: 'Morge Coop' },
  { hour: 15, minute: 0, label: 'Nami Coop' },
  { hour: 14, minute: 57, label: 'Coop' },
];
