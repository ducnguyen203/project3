// utils/timezone.js
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = "Asia/Ho_Chi_Minh";

function toVietnamTime(datetime) {
  return dayjs.utc(datetime).tz(TIMEZONE);
}

function formatVietnamTime(datetime, format = "YYYY-MM-DD HH:mm:ss") {
  return toVietnamTime(datetime).format(format);
}

module.exports = {
  toVietnamTime,
  formatVietnamTime,
};
