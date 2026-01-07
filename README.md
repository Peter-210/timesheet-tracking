# Timesheet Tracker & Automated Notification

![Timesheet Example](Example.png)

- Customs functions for Google Sheet written in JavaScript
- Used to fill in pay timesheet easily
- Create a way to notify major events like breaks and shift end through google calendar

## Important
- Always delete the consts `DATE_RANGE` and `CALENDAR_ID` after using Calendar Sync
  - This will prevent accidental duplication that makes deleting a pain
- Always make a separate calendar and get its ID for apps script before syncing google sheets to calendar
- Make sure that the device used to get the notifications has actually got the new updated schedule
  - On device, go to Settings - `Your Schedule` - Enable Sync

## Get Started
1. Add script to Google Sheet
  - Go to `Extensions - Apps Script`
    - May need to open within browser incognito mode to work
  - Paste the provided `.gs` file
  - In apps script, update `calendarId`
    - Get ID from google calendar settings
2. Add custom functions
  - Go to Data - Named Functions
  - Create a new function (example provided below)
    - Function Name: GET_WORK_DECIMAL
    - Function Description: Gets the work duration in decimal format.
    - Argument Placeholders: workduration
    - Formula Definition: =JS_GET_WORK_DECIMAL(TO_TEXT(workduration))
    - Argument Description: The duration of work without including break.
3. Use the function
  - eg. =GET_WORK_DECIMAL(D2-C2)
  - Make sure to set the cell to a proper format
    - Go to Format - Number - Automatic
4. Update Google Sheets Data
  - Fill in the following data fields in Google Sheets:
    - Schedule
      - Notes
      - Date
   - Timesheet
      - Weekly Hours (eg. `=GET_WEEKLY_HOURS(K10:K16)`)
      - Regular Pay (eg. `=GET_REGULAR_PAY(M3:M16)`)
      - Net Pay
    - Calendar Sync
      - Start Shift
      - End Shift
      - Start Break
      - End Break
5. Update Apps Script Calendar `DATE_RANGE`
  - Add the range data from the Google Sheet `Calendar Sync`
    - eg. `const DATE_RANGE = "Q3:T40";`
6. Sync Calendar to Google Sheets
  - On Google Sheets, go to `Sync to Calendar - Add Events to Calendar`
    - May need to give permissions to edit
7. Add notification to events in Google Calendar
  - Go to Settings for your Calendar Profile
  - Add `Event notification` to (eg. 15 minutes) before event start
  - Remove `All-day event notifications`
