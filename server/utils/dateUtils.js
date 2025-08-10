function isValidDateRange(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (
    start instanceof Date &&
    !isNaN(start) &&
    end instanceof Date &&
    !isNaN(end) &&
    start < end
  );
}

module.exports = { isValidDateRange };
