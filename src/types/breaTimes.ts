export interface BreakTime {
  hour: number;
  minute: number;
  label: string;
}

export const breakTimes: BreakTime[] = [
  { hour: 10, minute: 0, label: 'Morge Coop' },
  { hour: 15, minute: 0, label: 'Nami Coop' },
];
