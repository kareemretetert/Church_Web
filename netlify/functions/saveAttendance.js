exports.handler = async (event) => {
  // handle CORS preflight
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
    "Content-Type": "application/json"
  }

  try {
    const data = JSON.parse(event.body)

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    const REPO         = "kareemretetert/Church_Web"
    const FILE_PATH    = "attendance.json"
    const BRANCH       = "main"

    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN_ATTENDANCE غير موجود في environment variables")
    }

    // 1️⃣ نجيب الـ SHA الحالي للملف
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
      console.error("❌ GET FILE ERROR:", errText)
      throw new Error("فشل في قراءة الملف من GitHub: " + getFile.status)
    }

    // 2️⃣ تشفير البيانات بـ Base64
    const jsonStr = JSON.stringify(data, null, 2)
    const content = Buffer.from(jsonStr).toString("base64")

    // 3️⃣ رفع التعديل
    const updateBody = {
      message: `Update attendance — ${new Date().toISOString()}`,
      content: content,
      branch: BRANCH,
      ...(sha && { sha })
    }

    const update = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateBody)
      }
    )

    if (!update.ok) {
      const errText = await update.text()
      console.error("❌ UPDATE ERROR:", errText)
      throw new Error("فشل في رفع الملف لـ GitHub: " + update.status)
    }

    const result = await update.json()
    console.log("✅ Saved successfully, new SHA:", result.content?.sha)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, sha: result.content?.sha })
    }

  } catch (err) {
    console.error("🔥 ERROR:", err.message)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    }
  }
}
