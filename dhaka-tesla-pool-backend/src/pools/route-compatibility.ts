import { DhakaZone } from '../common/enums/domain.enums';

const CORRIDORS: Array<{
  name: string;
  pickup: DhakaZone;
  destinations: DhakaZone[];
}> = [
  {
    name: 'BANANI_CENTRAL',
    pickup: DhakaZone.BANANI,
    destinations: [
      DhakaZone.MOHAKHALI,
      DhakaZone.GULSHAN_1,
      DhakaZone.GULSHAN_2,
    ],
  },
  {
    name: 'NORTH_LINK',
    pickup: DhakaZone.UTTARA,
    destinations: [DhakaZone.MIRPUR, DhakaZone.BANANI],
  },
  {
    name: 'WEST_CENTRAL',
    pickup: DhakaZone.DHANMONDI,
    destinations: [DhakaZone.FARMGATE, DhakaZone.MOHAKHALI],
  },
];

export function corridorFor(pickup: DhakaZone, destination: DhakaZone): string {
  return (
    CORRIDORS.find(
      (corridor) =>
        corridor.pickup === pickup &&
        corridor.destinations.includes(destination),
    )?.name ?? `${pickup}_TO_${destination}`
  );
}
