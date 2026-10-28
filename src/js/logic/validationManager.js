/**
 * @file validationManager.js
 * @description Pure validation logic for sprint backlog issues (BDC-F-006, BDC-NF-003, BDC-SR-001, BDC-SR-002).
 * Conforms to SRS Section 4.2, Section 5, and SAD Section 4.3.
 * Pure functional validation with zero DOM dependencies.
 */

/**
 * Validates candidate issue fields for backlog insertion.
 * Enforces field presence, uniqueness, valid types/statuses, non-negative story points,
 * and valid completion day constraints when marked Done.
 *
 * @param {object} fields - Candidate issue fields
 * @param {string} [fields.issueKey] - Unique issue identifier
 * @param {string} [fields.summary] - Issue description
 * @param {string} [fields.issueType] - Issue type (Story | Task | Bug)
 * @param {number|string} [fields.storyPoints] - Estimated story points
 * @param {string} [fields.status] - Status (To Do | In Progress | Done)
 * @param {number|string|null} [fields.completedDay] - Day issue was completed (if Done)
 * @param {Array<string|object>} [existingKeys=[]] - List of existing keys or issue objects to check uniqueness against
 * @param {object} [context={}] - Sprint context
 * @param {number} [context.currentDay=0] - Current sprint day
 * @param {number} [context.durationDays=Infinity] - Total sprint duration in days
 * @returns {{ valid: boolean, errors: string[] }} Validation result with list of error messages
 */
export function validateIssue(fields, existingKeys = [], context = {}) {
  const errors = [];
  const f = (fields && typeof fields === 'object') ? fields : {};

  // 1. Issue Key validation
  const rawKey = f.issueKey;
  if (typeof rawKey !== 'string' || rawKey.trim().length === 0) {
    errors.push('Issue key is required.');
  } else {
    const trimmedKey = rawKey.trim();
    const lowerKey = trimmedKey.toLowerCase();
    const isDuplicate = Array.isArray(existingKeys) && existingKeys.some(k => {
      const kStr = typeof k === 'string' ? k : (k && typeof k.issueKey === 'string' ? k.issueKey : '');
      return kStr.trim().toLowerCase() === lowerKey;
    });
    if (isDuplicate) {
      errors.push('An issue with this key already exists.');
    }
  }

  // 2. Summary validation
  const rawSummary = f.summary;
  if (typeof rawSummary !== 'string' || rawSummary.trim().length === 0) {
    errors.push('Summary is required.');
  }

  // 3. Issue Type validation
  const allowedTypes = ['Story', 'Task', 'Bug'];
  if (!allowedTypes.includes(f.issueType)) {
    errors.push('Issue type must be Story, Task or Bug.');
  }

  // 4. Story Points validation
  const sp = f.storyPoints;
  let validPoints = false;
  if (typeof sp === 'string') {
    const trimmedSp = sp.trim();
    if (/^\d+(\.\d+)?$/.test(trimmedSp)) {
      const n = Number(trimmedSp);
      if (Number.isFinite(n) && n >= 0 && n <= Number.MAX_SAFE_INTEGER) {
        validPoints = true;
      }
    }
  } else if (typeof sp === 'number') {
    if (Number.isFinite(sp) && !isNaN(sp) && sp >= 0 && sp <= Number.MAX_SAFE_INTEGER) {
      validPoints = true;
    }
  }

  if (!validPoints) {
    errors.push('Story points must be a non-negative number.');
  }

  // 5. Status validation
  const allowedStatuses = ['To Do', 'In Progress', 'Done'];
  if (!allowedStatuses.includes(f.status)) {
    errors.push('Status must be To Do, In Progress or Done.');
  }

  // 6. Completion Day validation (only when Status is Done)
  if (f.status === 'Done') {
    const rawDay = f.completedDay;
    const isProvided = rawDay !== null && rawDay !== undefined && (typeof rawDay !== 'string' || rawDay.trim().length > 0);
    if (!isProvided) {
      errors.push('Completion day is required when status is Done.');
    } else {
      const currentDay = (context && typeof context.currentDay === 'number' && Number.isFinite(context.currentDay))
        ? context.currentDay
        : 0;
      const durationDays = (context && typeof context.durationDays === 'number' && Number.isFinite(context.durationDays))
        ? context.durationDays
        : Infinity;
      const N = Math.min(currentDay, durationDays);

      if (currentDay <= 0) {
        errors.push('No completion day is valid while Current Day is 0.');
      } else {
        let isWholeNumber = false;
        let dayNum = NaN;

        if (typeof rawDay === 'string') {
          const trimmed = rawDay.trim();
          if (/^\d+$/.test(trimmed)) {
            dayNum = parseInt(trimmed, 10);
            isWholeNumber = true;
          }
        } else if (typeof rawDay === 'number') {
          if (Number.isFinite(rawDay) && Number.isInteger(rawDay)) {
            dayNum = rawDay;
            isWholeNumber = true;
          }
        }

        if (!isWholeNumber || dayNum < 1 || dayNum > N) {
          errors.push(`Completion day must be a whole number between 1 and ${N}.`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default validateIssue;
