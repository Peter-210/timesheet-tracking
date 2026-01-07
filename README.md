# Timesheet Tracker & Automated Notification

![Timesheet Example](Example.png)

- Fill in timesheet with the correct data using Google Sheets and custom functions from Apps Script (written in JavaScript)
- Send notifications to phone for events regarding start/end shift and breaks through Google Calendar

## Important
- Always delete the consts `DATE_RANGE` and `CALENDAR_ID` after using `Calendar - Sync Events`
  - This will prevent accidental duplication that makes deleting a pain
- Always make a separate calendar and get its ID for apps script before syncing google sheets to calendar
- Make sure that the device used to get the notifications has actually got the new updated schedule
  - On device, go to Settings - `Your Schedule` - Enable Sync

## Google Sheets Template Data

### Schedule
- Notes
- Date (eg. Jan 1 - Sunday)
- Start Shift - `=GET_MY_TIME(Q3)`
- End Shift - `=GET_MY_TIME(R3)`
- Start Break - `=GET_MY_TIME(S3)`
- End Break - `=GET_MY_TIME(T3)`
- Break Duration - `=GET_BREAK_DURATION(Q3, R3)`
- Valid Break - `=VALID_BREAK_CHECK(Q3, R3, S3, T3)`

### Timesheet
- Hours Decimal - `=GET_PAY_DECIMAL(Q3, R3)`
- Meal Duration - `=GET_BREAK_DECIMAL(Q3, R3)`
- Weekly Hours - `=GET_WEEKLY_HOURS(K3:K9)`
- Regular Pay - `=GET_REGULAR PAY(M3:M16)`
- Net Pay

### Calendar Sync
- Start Shift (eg. 1/1/2000 9:00:00)
- End Shift (eg. 1/1/2000 17:00:00)
- Start Break (eg. 1/1/2000 12:00:00)
- End Break (eg. 1/1/2000 13:00:00)

## Get Started

### 1. Add script to Google Sheet
- Go to `Extensions - Apps Script`
- May need to open within browser incognito mode to work
- Paste the provided `.gs` file
- In apps script, update `calendarId`
- Get ID from google calendar settings

### 2. Add custom functions
- Go to `Data - Named Functions`
- Create a new function (example provided below)
- Function Name: GET_WORK_DECIMAL
- Function Description: Gets the work duration in decimal format.
- Argument Placeholders: workduration
- Formula Definition: =JS_GET_WORK_DECIMAL(TO_TEXT(workduration))
- Argument Description: The duration of work without including break.

### 3. Use the function
- eg. =GET_WORK_DECIMAL(D2-C2)
- Make sure to set the cell to a proper format
- Go to Format - Number - Automatic

### 4. Update Google Sheets Data
- Fill in the following data fields in Google Sheets:
- Schedule
  - Notes
  - Date (eg. Jan 1 - Sunday)
- Timesheet
  - Weekly Hours (eg. `=GET_WEEKLY_HOURS(K10:K16)`)
  - Regular Pay (eg. `=GET_REGULAR_PAY(M3:M16)`)
  - Net Pay
- Calendar Sync
  - Start Shift
  - End Shift
  - Start Break
  - End Break

### 5. Update Apps Script Data
- Add the range data for Apps Script from the Google Sheet `Calendar Sync` section
    - eg. `const DATE_RANGE = "Q3:T40";`
- Update the calendar ID for Apps Script
    - Get calendar ID from Google Calendar (Settings - Settings for my calendars - `Your calendar` - Integrate calendar)

### 6. Sync Calendar to Google Sheets
- On Google Sheets, go to `Sync to Calendar - Add Events to Calendar`
- May need to give permissions to edit

### 7. Add notification to events in Google Calendar
- Go to Settings for your Calendar Profile
- Add `Event notification` to (eg. 15 minutes) before event start
- Remove `All-day event notifications`
