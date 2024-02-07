import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import { IGoal } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IGoal';

export const hasCurrentGoals = (
  condition: ICondition,
  goals: IGoal[],
): boolean =>
  goals?.some(
    (goal) =>
      goal.addresses?.some(
        (addr) =>
          addr.reference &&
          condition.id &&
          addr.reference.indexOf(condition.id) > -1,
      ) &&
      !(
        goal.lifecycleStatus === 'rejected' ||
        goal.lifecycleStatus === 'completed' ||
        goal.lifecycleStatus === 'cancelled' ||
        goal.lifecycleStatus === 'entered-in-error'
      ),
  );
