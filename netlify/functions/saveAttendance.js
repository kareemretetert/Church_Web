exports.handler = async function(event) {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    const repo = "kareemretetert/Church_Web";
    const path = "attendance.json"; // 👈 هنا الفرق

    const data = JSON.parse(event.body);

    // هات الملف الحالي
    const fileRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`
      }
    });

    const file = await fileRes.json();

    const updatedContent = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

    // تحديث الملف
    const updateRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "update attendance",
        content: updatedContent,
        sha: file.sha,
        branch: "main"
      })
    });

    const result = await updateRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: "Error saving attendance"
    };
  }
};
