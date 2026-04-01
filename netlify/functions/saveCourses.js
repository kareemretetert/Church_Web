// netlify/functions/saveCourses.js
const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const filePath = path.join(__dirname, "courses.json");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
