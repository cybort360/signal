import TimeService from '../systems/TimeService.js';

// Thin wrapper Chapter3Scene calls instead of reaching into TimeService directly.
// Bundles the three time-derived facts the scene needs into a single snapshot.
const SolsticeDetector = {
  getStatus() {
    const hour = TimeService.getCurrentHour();
    return {
      isSolstice: TimeService.isSolstice(),
      hour,
      skyColor: TimeService.getSkyColorForHour(hour),
    };
  },
};

export default SolsticeDetector;
