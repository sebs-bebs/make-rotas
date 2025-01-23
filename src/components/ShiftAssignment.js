// Example: src/components/ShiftAssignment.js

import React from 'react';
import { formatDateWithAbbreviatedMonth } from '@/utils/dateFormatter';

const ShiftAssignment = ({ shift }) => {
  return (
    <div>
      <p>{formatDateWithAbbreviatedMonth(new Date(shift.startDate))} - {formatDateWithAbbreviatedMonth(new Date(shift.endDate))}</p>
      {/* Other shift details */}
    </div>
  );
};

export default ShiftAssignment;