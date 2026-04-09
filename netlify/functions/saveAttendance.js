exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body)

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    const REPO = "kareemretetert/Church_Web"   // 🔥 عدل باسم الريبو بتاعك
    const FILE_PATH = "attendance.json"
    const BRANCH = "main"

    // 1️⃣ نجيب الملف الحالي عشان نعرف الـ SHA
    const getFile = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    )

    let sha = undefined

    if (getFile.ok) {
      const fileData = await getFile.json()
      sha = fileData.sha
    }
    // لو الملف مش موجود خالص هنعمله من جديد بدون sha

    // 2️⃣ نحول البيانات لـ Base64
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64")

    // 3️⃣ نرفع التعديل (أو ننشئ الملف لو مش موجود)
    const body = {
      message: "Update attendance data",
      content: content,
      branch: BRANCH
    }
    if (sha) body.sha = sha

    const update = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        },
        body: JSON.stringify(body)
      }
    )

    const result = await update.json()

    if (!update.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: result.message || "GitHub error" })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, result })
    }

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
