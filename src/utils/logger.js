const fs = require("fs");
const path = require("path");

//
// LOG DIRECTORY
//

const logDir = path.join(
  __dirname,
  "../logs"
);

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

//
// TIME FORMAT
//

function getTime() {

  return new Date().toLocaleString(
    "vi-VN",
    {
      hour12: false,
    }
  );
}

//
// WRITE FILE
//

function write(file, content) {

  const filePath = path.join(
    logDir,
    file
  );

  fs.appendFileSync(
    filePath,
    content + "\n",
    "utf8"
  );
}

//
// FORMAT
//

function format(type, content) {

  return `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ ${type}
┃ Time: ${getTime()}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${content}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

//
// INFO
//

function info(content) {

  const log = format(
    "ℹ️ INFO",
    content
  );

  console.log(log);

  write("info.log", log);
}

//
// ERROR
//

function error(content) {

  const log = format(
    "❌ ERROR",
    content
  );

  console.error(log);

  write("error.log", log);
}

//
// COMMAND
//

function command(content) {

  const log = format(
    "⚡ COMMAND",
    content
  );

  write("commands.log", log);
}

module.exports = {
  info,
  error,
  command,
};