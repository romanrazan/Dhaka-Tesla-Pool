import { DhakaZone } from '../common/enums/domain.enums';
import { corridorFor } from './route-compatibility';

describe('route compatibility', () => {
  it('matches Nusrat and Rafiq in the Banani central corridor', () => {
    expect(corridorFor(DhakaZone.BANANI, DhakaZone.MOHAKHALI)).toBe(
      'BANANI_CENTRAL',
    );
    expect(corridorFor(DhakaZone.BANANI, DhakaZone.GULSHAN_1)).toBe(
      'BANANI_CENTRAL',
    );
  });

  it('keeps unconfigured routes deterministic and exact', () => {
    expect(corridorFor(DhakaZone.MIRPUR, DhakaZone.UTTARA)).toBe(
      'MIRPUR_TO_UTTARA',
    );
  });
});
