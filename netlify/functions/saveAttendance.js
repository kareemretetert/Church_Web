// netlify/functions/saveAttendance.js
// ✅ نفس منطق saveCourses.js بالضبط — بس للحضور والغياب

exports.handler = async (event) => {
  // Allow CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const data = JSON.parse(event.body);

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;   // ✅ نفس المتغير البيئي
    const REPO = "kareemretetert/Church_Web";         // ✅ نفس الـ repo
    const FILE_PATH = "attendance.json";              // ✅ ملف الحضور والغياب
    const BRANCH = "main";

    if (!GITHUB_TOKEN) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "GITHUB_TOKEN غير موجود في متغيرات البيئة" })
      };
    }

    // 1️⃣ نجيب الملف الحالي عشان نعرف الـ SHA
    const getFile = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );

    let sha = null;

    if (getFile.status === 200) {
      // الملف موجود — نجيب الـ SHA
      const fileData = await getFile.json();
      sha = fileData.sha;
    } else if (getFile.status === 404) {
      // الملف مش موجود — هيتنشأ جديد (sha = null)
      sha = null;
    } else {
      throw new Error(`GitHub API error: ${getFile.status}`);
    }

    // 2️⃣ نحول البيانات لـ Base64
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

    // 3️⃣ نبني body الـ request
    const requestBody = {
      message: "Update attendance data",
      content: content,
      branch: BRANCH
    };

    // لو الملف موجود نضيف الـ sha
    if (sha) requestBody.sha = sha;

    // 4️⃣ نرفع التعديل على GitHub
    const update = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    );

    const result = await update.json();

    if (!update.ok) {
      throw new Error(result.message || "فشل رفع الملف على GitHub");
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, result })
    };

  } catch (err) {
    console.error("saveAttendance error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
