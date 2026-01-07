const SALARY = 0;

// FOR BREAK CALCULATIONS
const UPPER_BOUND_HOURS = 7;
const LOWER_BOUND_HOURS = 5;

// FOR GOOGLE CALENDAR
const CALENDAR_ID = "";
const DATE_RANGE = ""; // Q3:T50

const START_SHIFT_TITLE = "Start Shift";
const END_SHIFT_TITLE = "End Shift";
const START_BREAK_TITLE = "Start Break";
const END_BREAK_TITLE = "End Break";

/**
 * Custom error message to notify user and log
 * 
 * @param {string} message The message needed to display to the user and log.
 * @param {object} data The data needed to concat with the error message.
*/
function errorMessage(message, data = "") {
  console.error(message, data);

  const ui = SpreadsheetApp.getUi();
  ui.alert(message.concat(data));
}

/**
 * Convert date time format to readable time format
 * 
 * @param {object} datetime A given date in the following format eg. (1/1/2026 9:00:00)
 * @return {string} Readable time format as eg. (9:00 AM)
 * @customfunction
*/
function JS_GET_MY_TIME(datetime) {
  if (!datetime) {return;}

  let currHour = datetime.getHours();
  const currMin = (datetime.getMinutes()).toString().padStart(2, '0');
  const amOrPm = (currHour < 12) ? "AM" : "PM";

  if (currHour > 12) {
    currHour -= 12;
  }
  currHour = currHour.toString();

  return currHour.concat(":", currMin, " ", amOrPm);
}

/**
 * Gets the duration in time format (HH:MM).
 * 
 * @param {datetime} startTime The starting time.
 * @param {datetime} endTime The ending time.
 * @return {string} A string to represent duration (HH:MM).
*/
function JS_GET_TIME_DURATION(startTime, endTime) {
  const startTotalMinutes = (startTime.getHours() * 60) + startTime.getMinutes();
  const endTotalMinutes = (endTime.getHours() * 60) + endTime.getMinutes();
  return endTotalMinutes - startTotalMinutes;
}

/**
 * Gets the break duration in time format (HH:MM) based on work duration without break.
 * 
 * @param {datetime} startShift The starting shift time.
 * @param {datetime} endShift The ending shift time.
 * @return {string} A string to represent break duration (HH:MM).
 * @customfunction
*/
function JS_GET_BREAK_DURATION(startShift, endShift) {
  if (!startShift || !endShift) {return;}

  const durationMinutes = JS_GET_TIME_DURATION(startShift, endShift);

  if (durationMinutes > UPPER_BOUND_HOURS * 60) {
    return "1:00";
  }
  if (durationMinutes < LOWER_BOUND_HOURS * 60) {
    return "0:15";
  }
  return "0:30";
}

/**
 * Check if the given break time is valid.
 * 
 * @param {datetime} startShift The starting shift time.
 * @param {datetime} endShift The ending shift time.
 * @param {datetime} startBreak The starting break time.
 * @param {datetime} endBreak The ending break time.
 * @return {string} A string saying "ERROR" if break is mismatched. Thus needs to change calendar sync break times.
 * @customfunction
*/
function JS_VALID_BREAK_CHECK(startShift, endShift, startBreak, endBreak) {
  if (!startShift || !endShift) {return;}

  if (!startBreak || !endBreak) {
    return "ERROR";
  }

  const testBreak = JS_GET_TIME_DURATION(startBreak, endBreak);

  const actualBreakFormat = JS_GET_BREAK_DURATION(startShift, endShift).split(":");
  const actualBreak = (Number(actualBreakFormat[0]) * 60) + Number(actualBreakFormat[1]);

  if (testBreak != actualBreak) {
    return "ERROR";
  }
  return "";
}

/**
 * Gets the break duration in decimal format based on work duration without break.
 * 
 * @param {datetime} startShift The starting shift time.
 * @param {datetime} endShift The ending shift time.
 * @return {string} A decimal represention of break duration.
 * @customfunction
*/
function JS_GET_BREAK_DECIMAL(startShift, endShift) {
  if (!startShift || !endShift) {return;}

  const durationMinutes = JS_GET_TIME_DURATION(startShift, endShift);

  if (durationMinutes > UPPER_BOUND_HOURS * 60) {
    return (0.5).toFixed(2);
  }
  if (durationMinutes < LOWER_BOUND_HOURS * 60) {
    return (0).toFixed(2);
  }
  return (0.25).toFixed(2);
}

/**
 * Gets the total paid hours in decimal format based on work and break durations.
 * 
 * @param {datetime} startShift The starting shift time.
 * @param {datetime} endShift The ending shift time.
 * @return {number} A decimal to represent paid duration.
 * @customfunction
*/
function JS_GET_PAY_DECIMAL(startShift, endShift) {
  if (!startShift || !endShift) {return;}

  const workDecimal = JS_GET_TIME_DURATION(startShift, endShift) / 60;
  const breakDecimal = JS_GET_BREAK_DECIMAL(startShift, endShift);
  return (workDecimal - breakDecimal).toFixed(2);
}

/**
 * Gets weekly hours in decimal format for the sum of paid hours.
 * 
 * @param {range} rangeHours The sum of all hours in the weekly section.
 * @return {number} A decimal to represent the amount of paid hours per week.
 * @customfunction
*/
function JS_GET_WEEKLY_HOURS(rangeHours) {
  let sum = 0;

  for (let i = 0; i < rangeHours.length; i++) {
    for (let j = 0; j < rangeHours[i].length; j++) {
      sum += Number(rangeHours[i][j]);
    }
  }
  return sum.toFixed(2);
}

/**
 * Gets the total paid amount for biweekly based on total paid hours.
 * 
 * @param {range} rangeHours The sum of all hours in the biweekly section.
 * @return {number} A decimal to represent the amount of gross earnings without deductions.
 * @customfunction
*/
function JS_GET_REGULAR_PAY(rangeHours) {
  const biweeklyHours = JS_GET_WEEKLY_HOURS(rangeHours);
  return (biweeklyHours * SALARY).toFixed(2);
}

/**
 * Sync date and time of events like shifts and breaks to google calendar.
*/
function JS_CALENDAR_SYNC() {
  if (!CALENDAR_ID || !DATE_RANGE) {
    errorMessage("ERROR - Missing calendar ID");
    return;
  }

  if (!CALENDAR_ID || !DATE_RANGE) {
    errorMessage("ERROR - Missing date range");
    return;
  }
  
  const eventCal = CalendarApp.getCalendarById(CALENDAR_ID);
  if (!eventCal) {
    errorMessage("ERROR - Calendar not found: ", CALENDAR_ID);
    return;
  }

  const spreadsheet = SpreadsheetApp.getActiveSheet();
  const dateRange = spreadsheet.getRange(DATE_RANGE).getValues();

  const checkDuplicateEvent = (datetime, title) => {
    const dayEvents = eventCal.getEventsForDay(new Date(datetime));

    for (let i = 0; i < dayEvents.length; i++) {
      if (dayEvents[i].getTitle() === title) {
        return true;
      }
    }

    return false;
  };

  const addEvent = (datetime, title) => {
    if (!datetime) {return;}

    const eventTitle = "(".concat(JS_GET_MY_TIME(datetime), ") ", title);
    
    if (checkDuplicateEvent(datetime, eventTitle)) {return;}

    eventCal.createEvent(eventTitle, datetime, datetime);
  };
  
  for (let i = 0; i < dateRange.length; i++) {
    const dateList = dateRange[i];

    addEvent(dateList[0], START_SHIFT_TITLE);
    addEvent(dateList[1], END_SHIFT_TITLE);
    addEvent(dateList[2], START_BREAK_TITLE);
    addEvent(dateList[3], END_BREAK_TITLE);
  }
}

/**
 * Create a UI element that sync data to google calendar
*/
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Calendar")
    .addItem("Sync Events to Calendar", "JS_CALENDAR_SYNC")
    .addToUi()
}
