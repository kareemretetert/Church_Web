exports.handler = async (event) => {

  // ✅ CORS headers — مهمة جداً عشان المتصفح يقبل الـ response
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  }

  // ✅ لازم نرد على الـ preflight request (OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" }
  }

  try {
    if (!event.body) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "No data received" }) }
    }

    const data = JSON.parse(event.body)

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    const REPO        = "kareemretetert/Church_Web"
    const FILE_PATH   = "attendance.json"
    const BRANCH      = "main"

    if (!GITHUB_TOKEN) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "GITHUB_TOKEN environment variable is missing" }) }
    }

    // 1️⃣ نجيب الـ SHA الحالي
    let sha = null
    const getFile = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" }
    })

    if (getFile.ok) {
      const fileData = await getFile.json()
      sha = fileData.sha
    } else if (getFile.status !== 404) {
      const errText = await getFile.text()
      return { statusCode: 502, headers, body: JSON.stringify({ error: "GitHub GET failed: " + getFile.status, detail: errText }) }
    }

    // 2️⃣ Base64
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64")

    // 3️⃣ PUT
    const putBody = { message: "Update attendance data", content, branch: BRANCH }
    if (sha) putBody.sha = sha

    const update = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
      body: JSON.stringify(putBody)
    })

    if (!update.ok) {
      const errText = await update.text()
      return { statusCode: 502, headers, body: JSON.stringify({ error: "GitHub PUT failed: " + update.status, detail: errText }) }
    }

    const result = await update.json()
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, commit: result?.commit?.sha || "ok" }) }

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    }
  }
}
