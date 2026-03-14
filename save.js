exports.handler = async (event) => {

const fs = require("fs")
const path = require("path")

try {

const data = JSON.parse(event.body)

const filePath = path.join(process.cwd(), "summrise.json")

fs.writeFileSync(filePath, JSON.stringify(data,null,2))

return {
statusCode:200,
body:"saved"
}

} catch(err){

return {
statusCode:500,
body:"error"
}

}

}