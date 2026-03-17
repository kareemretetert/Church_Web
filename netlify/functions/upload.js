exports.handler = async function(event) {

  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const repo = "kareemretetert/Church_Web";

    const { fileName, content } = JSON.parse(event.body);

    const path = `media/${fileName}`;

    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "upload file",
        content: content.split(',')[1], // remove base64 header
        branch: "main"
      })
    });

    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: data.content.download_url
      })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "upload error" };
  }

}
