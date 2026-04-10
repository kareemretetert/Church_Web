exports.handler = async (event) => {

  // ✅ CORS (مهم جدًا)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    }
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  }

  try {
    // ✅ حماية من body الفاضي
    const data = event.body ? JSON.parse(event.body) : {}

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN  // 🔥 توكن موحد
    const REPO = "kareemretetert/Church_Web"
    const FILE_PATH = "attendance.json"
    const BRANCH = "main"

    if (!GITHUB_TOKEN) {
      throw new Error("❌ التوكن غير موجود في environment variables")
    }

    // =========================================================
    // 1️⃣ نجيب الملف الحالي (لو موجود)
    // =========================================================
    const getFile = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    )

    let sha = null

    if (getFile.ok) {
      const fileData = await getFile.json()
      sha = fileData.sha
    } else if (getFile.status !== 404) {
      const errText = await getFile.text()
      console.log("❌ GET FILE ERROR:", errText)
      throw new Error("فشل في قراءة الملف من GitHub")
    }

    // =========================================================
    // 2️⃣ تحويل البيانات لـ Base64
    // =========================================================
    const jsonStr = JSON.stringify(data, null, 2)
    const content = Buffer.from(jsonStr).toString("base64")

    // =========================================================
    // 3️⃣ رفع التعديل
    // =========================================================
    const update = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Update attendance — ${new Date().toISOString()}`,
          content: content,
          branch: BRANCH,
          ...(sha && { sha }) // لو الملف موجود
        })
      }
    )

    if (!update.ok) {
      const errText = await update.text()
      console.log("❌ UPDATE ERROR:", errText)
      throw new Error("فشل في رفع الملف")
    }

    const result = await update.json()
    console.log("✅ Saved successfully:", result.content?.sha)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sha: result.content?.sha
      })
    }

  } catch (err) {
    console.log("🔥 ERROR:", err.message)

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: err.message
      })
    }
  }
}
