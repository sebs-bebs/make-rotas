# Documentation for the Weekly Header Row Feature in Make Rotas

## Introduction

The **Make Rotas** web application is designed to streamline staff scheduling for small businesses. One of its key features is the dynamic weekly view, which allows users to navigate through different weeks and see the corresponding staff schedules. This document focuses on the implementation of the **header row** that always starts with **Monday** as the first day of the week, regardless of the current week being viewed. This feature ensures consistency and clarity in the presentation of the weekly schedule.

## Project Structure Overview

The project is built using **Next.js** and follows a component-based architecture. Key directories and files relevant to this feature include:

- **`src/app/page.js`**: The main page component that handles the overall layout and state management.
- **`src/components/ShiftSlot.js`**: Component responsible for rendering individual shift slots.
- **`src/utils/dateFormatter.js`**: Utility functions for formatting dates.
- **`src/utils/generateTimeOptions.js`**: Utility functions for generating time options for shift selection.
- **`src/lib/generateUniqueKey.js`**: Utility function for generating unique keys.

## Feature Implementation

### 1. Generating Week Days Starting with Monday

The first step in implementing the weekly header row is to generate an array of dates starting from the nearest Monday to the current date. This is handled by the `generateWeekDays` function in `src/app/page.js`.

```js
// src/app/page.js

const generateWeekDays = (startDate) => {
  const days = [];
  const start = new Date(startDate);

  // Find the first Monday before or on the start date
  const firstMonday = new Date(start);
  firstMonday.setDate(firstMonday.getDate() - ((firstMonday.getDay() + 6) % 7));

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(firstMonday);
    currentDate.setDate(currentDate.getDate() + i);
    days.push(currentDate.toISOString().split('T')[0]);
  }
  return days;
};
```

**Explanation:**

- **`startDate`**: The date from which the week should start.
- **`firstMonday`**: Calculates the date of the nearest Monday before or on the `startDate`.
- **Loop**: Iterates over the next seven days to generate a complete week.

### 2. Managing State for Weeks and Staff

The application maintains state for the current list of weeks and staff members. This is handled in the `HomePage` component.

```js
// src/app/page.js

export default function HomePage() {
  const [weeks, setWeeks] = useState([
    {
      id: 1,
      startDate: new Date().toISOString().split('T')[0],
      staff: [],
      days: generateWeekDays(new Date().toISOString().split('T')[0]),
    },
  ]);
  const [staffList, setStaffList] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  // ... rest of the component
}
```

**Explanation:**

- **`weeks`**: An array of week objects, each containing a unique `id`, `startDate`, `staff` assignments, and `days`.
- **`staffList`**: An array of staff members.
- **`remarks`**: An array of remarks for each shift.
- **`currentWeekIndex`**: The index of the week currently being viewed.

### 3. Handling Navigation Between Weeks

Users can navigate through weeks using the **Previous Week**, **Next Week**, and **Current Week** buttons. These buttons trigger functions that update the `currentWeekIndex` accordingly.

```js
// src/app/page.js

const handlePreviousWeek = () => {
  if (currentWeekIndex > 0) {
    setCurrentWeekIndex(currentWeekIndex - 1);
  }
};

const handleNextWeek = () => {
  if (currentWeekIndex >= weeks.length - 1) {
    addWeek();
  }
  setCurrentWeekIndex((prevIndex) => prevIndex + 1);
};

const handleCurrentWeek = () => {
  const today = new Date().toISOString().split('T')[0];
  const currentWeekIndex = weeks.findIndex(
    (week) =>
      new Date(week.startDate) <= new Date(today) &&
      new Date(week.days[6]) >= new Date(today)
  );

  if (currentWeekIndex !== -1) {
    setCurrentWeekIndex(currentWeekIndex);
  } else {
    // Find the nearest week to the current date
    let nearestWeekIndex = 0;
    let minDateDiff = Infinity;
    weeks.forEach((week, index) => {
      const diff = Math.abs(
        new Date(week.startDate).getTime() - new Date(today).getTime()
      );
      if (diff < minDateDiff) {
        minDateDiff = diff;
        nearestWeekIndex = index;
      }
    });
    setCurrentWeekIndex(nearestWeekIndex);
  }
};
```

**Explanation:**

- **`handlePreviousWeek`**: Decrements the `currentWeekIndex` to navigate to the previous week.
- **`handleNextWeek`**: Increments the `currentWeekIndex` to navigate to the next week. If the current week is the last week, it adds a new week.
- **`handleCurrentWeek`**: Navigates to the week that includes the current date.

### 4. Rendering the Weekly Header Row

The header row is rendered in the `HomePage` component within the table. It dynamically generates the days of the week based on the `currentWeek` object.

```js
// src/app/page.js

return (
  <div>
    {/* ... other components ... */}

    <div className="overflow-x-auto overflow-y-auto max-h-[25rem]">
      {currentWeek && (
        <div
          key={currentWeek.id}
          id="rota-table"
          className="bg-white p-6 shadow rounded-md mb-4"
        >
          <table className="table-auto w-full border-separate border-spacing-0 md:border-spacing-2">
            <thead className="sticky top-0 z-30 bg-white">
              <tr className="bg-gray-100">
                <th className="px-6 py-3 border sticky left-0 bg-gray-100 z-10">
                  STAFF
                </th>
                {currentWeek.days.map((day, dayIndex) => (
                  <th key={dayIndex} className="px-6 py-3 border">
                    {new Date(day).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                  </th>
                ))}
                {/* ... other headers ... */}
              </tr>
            </thead>
            {/* ... table body ... */}
          </table>
          {/* ... other elements ... */}
        </div>
      )}
    </div>
  </div>
);
```

**Explanation:**

- **`currentWeek.days.map`**: Iterates over the array of days in the current week.
- **`toLocaleDateString`**: Formats the date to display the abbreviated month, day, and weekday (e.g., "Jan 01, Mon").

### 5. Ensuring Data Integrity

To maintain data integrity, the application uses the `currentWeekIndex` to ensure that the correct week is being displayed and manipulated. Additionally, the `generateWeekDays` function ensures that the week always starts on Monday.

### 6. Tips for Migrating the Feature to a Newer Codebase

- **Modularize the Logic**: Consider separating the date generation logic into a utility function to make it reusable and easier to manage.
- **Use Context API or State Management Libraries**: For larger applications, using the Context API or state management libraries like Redux can help manage global state more efficiently.
- **Responsive Design**: Ensure that the header row is responsive and looks good on all device sizes by leveraging Tailwind CSS classes.
- **Accessibility**: Make sure that the header row is accessible by using semantic HTML elements and ARIA labels where appropriate.
- **Testing**: Implement unit tests for the date generation and navigation functions to ensure reliability.

## Conclusion

The weekly header row feature in **Make Rotas** is a fundamental component that ensures the application provides a consistent and user-friendly interface for managing staff schedules. By following the implementation details and tips provided in this document, developers can effectively migrate this feature to newer versions of the codebase or integrate it into other projects.

---

This documentation is structured to be LLM-friendly, providing clear explanations and code snippets that can be easily parsed and utilized for code generation and migration tasks.