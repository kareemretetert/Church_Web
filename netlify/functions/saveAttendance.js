exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body)

   const GITHUB_TOKEN = process.env.GITHUB_TOKEN_ATTENDANCE
    const REPO = "kareemretetert/Church_Web"
    const FILE_PATH = "attendance.json"
    const BRANCH = "main"

    // 1️⃣ نجيب الملف الحالي (عشان نعرف الـ SHA)
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

    // 2️⃣ تحويل البيانات لـ Base64
    const content = Buffer.from(
      JSON.stringify(data, null, 2)
    ).toString("base64")

    // 3️⃣ رفع التعديل أو إنشاء الملف
    const update = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          message: "Update attendance data",
          content: content,
          branch: BRANCH,
          ...(sha && { sha }) // لو الملف موجود نضيف sha
        })
      }
    )

    if (!update.ok) {
      const errText = await update.text()
      console.log("❌ UPDATE ERROR:", errText)
      throw new Error("فشل في التحديث")
    }

    const result = await update.json()

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, result })
    }

  } catch (err) {
    console.log("🔥 ERROR:", err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
