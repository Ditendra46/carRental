// utils/rentalUtils.js

/**
 * Returns the last day of the month for a given date using local time.
 * For example, if date = '2025-03-25', this will return a Date for '2025-03-31'.
 */
function getMonthEnd(date) {
    // When you pass 0 as the day, it returns the last day of the previous month,
    // so we create a date for the next month and subtract 1 day.
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }
  
  /**
   * Formats a Date object into a 'YYYY-MM-DD' string using local time.
   * Using the 'en-CA' locale returns an ISO-like date string.
   */
  function formatDateToYMD(date) {
    return date.toLocaleDateString('en-CA'); // en-CA format: YYYY-MM-DD
  }
  
  /**
   * Generates monthly rental detail records for a given rental period.
   *
   * @param {string|number} rentalId - Rental identifier.
   * @param {string} startDate - Rental start date (YYYY-MM-DD).
   * @param {string} endDate - Rental end date (YYYY-MM-DD).
   * @param {number} rate - Daily rate multiplier applied for the calculation.
   *                        (You can adjust this logic if rate is monthly.)
   * @param {number} [discount=0] - Optional discount percentage.
   * @returns {Array<Object>} Array of detail objects with monthly breakdown.
   */
  function generateRentalDetails(rentalId, startDate, endDate, rate, discount = 0) {
    const details = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
  
    if (current > end) {
      throw new Error('Start date must be before end date');
    }
  
    while (current <= end) {
      // Get the last day of the current month (local time)
      const monthEnd = getMonthEnd(current);
  
      // Determine the period's end date: either the month's end or the rental's end date, whichever comes first
      const periodEnd = monthEnd <= end ? monthEnd : end;
  
      // Calculate the inclusive number of days between current and periodEnd
      const days = Math.floor((periodEnd - current) / (1000 * 60 * 60 * 24)) + 1;
  
      // Calculate the prorated amount based on the number of days and discount if any.
      const proratedAmount = Number((rate * days * (1 - discount / 100)).toFixed(2));
  
      details.push({
        rental_id: rentalId,
        period_start_date: formatDateToYMD(current),
        period_end_date: formatDateToYMD(periodEnd),
        prorated_amount: proratedAmount,
        total_paid: 0.00
      });
  
      // Set current to the day after the periodEnd for the next iteration
      current = new Date(periodEnd);
      current.setDate(current.getDate() + 1);
    }
  
    return details;
  }
  

  module.exports = {generateRentalDetails,formatDateToYMD};
  