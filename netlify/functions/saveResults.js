exports.handler = async function(event) {

try {

const GITHUB_TOKEN = process.env.GITHUB_TOKEN

const repo = "kareemretetert/Church_Web"
const path = "results.json"

const data = JSON.parse(event.body)

// 🔹 هات الملف الحالي
const fileRes = await fetch(
`https://api.github.com/repos/${repo}/contents/${path}`,
{
headers: {
Authorization: `token ${GITHUB_TOKEN}`,
Accept: "application/vnd.github.v3+json"
}
}
)

let sha = null

if (fileRes.status === 200) {
const file = await fileRes.json()
sha = file.sha
}

// 🔹 تجهيز البيانات
const updatedContent = Buffer
.from(JSON.stringify(data, null, 2))
.toString("base64")

// 🔹 رفع التعديل
const updateRes = await fetch(
`https://api.github.com/repos/${repo}/contents/${path}`,
{
method: "PUT",
headers: {
Authorization: `token ${GITHUB_TOKEN}`,
Accept: "application/vnd.github.v3+json",
"Content-Type": "application/json"
},
body: JSON.stringify({
message: "update results",
content: updatedContent,
sha: sha || undefined,
branch: "main"
})
}
)

const result = await updateRes.json()

if (updateRes.status >= 400) {
return {
statusCode: 500,
body: JSON.stringify(result)
}
}

return {
statusCode: 200,
body: "Results updated successfully"
}

} catch (err) {

return {
statusCode: 500,
body: err.message
}

}

}


    
