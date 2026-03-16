exports.handler = async function(event) {

const GITHUB_TOKEN = process.env.GITHUB_TOKEN

const repo = "kareemretetert/Church_Web"
const path = "summaries.json"

const data = JSON.parse(event.body)

const fileRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`,{
headers:{
Authorization:`token ${GITHUB_TOKEN}`
}
})

const file = await fileRes.json()

const updatedContent = Buffer.from(JSON.stringify(data,null,2)).toString("base64")

await fetch(`https://api.github.com/repos/${repo}/contents/${path}`,{
method:"PUT",
headers:{
Authorization:`token ${GITHUB_TOKEN}`,
"Content-Type":"application/json"
},
body:JSON.stringify({
message:"update summaries",
content:updatedContent,
sha:file.sha
})
})

return {
statusCode:200,
body:"updated"
}

}
