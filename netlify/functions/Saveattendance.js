exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body)

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    const REPO        = "kareemretetert/Church_Web"   // 🔥 عدل هنا لو احتجت
    const FILE_PATH   = "attendance.json"             // اسم الملف
    const BRANCH      = "main"

    // 1️⃣ نجيب الملف الحالي عشان نعرف الـ SHA
    const getFile = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    })

    let sha = null
    if (getFile.ok) {
      const fileData = await getFile.json()
      sha = fileData.sha
    }

    // 2️⃣ نحول البيانات لـ Base64
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64")

    // 3️⃣ نبني body الطلب
    const body = {
      message: "Update attendance data",
      content: content,
      branch: BRANCH
    }
    if (sha) body.sha = sha   // لازم موجود لو الملف موجود

    // 4️⃣ نرفع التعديل
    const update = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })

    const result = await update.json()

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
