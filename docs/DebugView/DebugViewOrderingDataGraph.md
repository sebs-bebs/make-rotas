# Debug View Section Ordering

This document explains the behavior of section ordering within the Debug View system, along with a Mermaid graph that illustrates the chronological flow of data.

---

## **Chronological Data Flow**

The Debug View dynamically updates the order of sections based on activity. Here's the sequence:

1. **Page Load:**
   - Sections are initialized with a default order.
   - Example: Staff Details (Active), Tab Navigation (Active), Staff List (Inactive), Shift Table (Active).

2. **User Interaction (e.g., Tab Switch):**
   - Active and inactive statuses of sections change.
   - Components update the Debug Context to reflect their new states.

3. **Order Updates:**
   - The Debug Context processes these updates and adjusts the section order accordingly.

4. **Rendering Updated Order:**
   - The system re-renders the Debug View with the updated section order.

---

## **Mermaid Graph: Chronological Data Flow**

```mermaid
graph TD
    A[Page Load] -->|Initialize Sections| B{Initial Order}
    B -->|1. StaffDetail is active| C[StaffDetail Added]
    B -->|2. TabNavigation becomes active| D[TabNavigation Added]
    B -->|3. Other components set default state| E[ShiftTable & StaffList Inactive]
    C -->|Update Debug Variables| F[Debug Context Updated]
    D -->|Update Debug Variables| F
    E -->|Update Debug Variables| F
    F -->|Initial Order Set| G[Order Rendered]

    G -->|User Switches Tab| H[Tab Switch Event]
    H -->|1. ShiftTable becomes inactive| I[Update Debug Variables: ShiftTable]
    H -->|2. StaffList becomes active| J[Update Debug Variables: StaffList]
    H -->|3. TabNavigation updates itself| K[Update Debug Variables: TabNavigation]
    I -->|Debug Context Updated| L[New Order Generated]
    J -->|Debug Context Updated| L
    K -->|Debug Context Updated| L

    L -->|Re-render Debug View| M[Updated Order Shown]
```

---

### **Explanation of the Graph**

- **Start at Page Load:**
  - Sections are initialized in their default states.

- **Follow the Arrows:**
  - Each step shows how updates occur in the Debug Context and how they affect the section order.

- **Tab Switches:**
  - User actions trigger changes in the Debug Context, marking sections as active or inactive.

- **Final Step:**
  - The Debug View re-renders with the updated section order, reflecting the latest activity.

---

This graph and explanation provide a visual and conceptual understanding of how data flows through the Debug View system, ensuring clarity in the behavior of section ordering.
