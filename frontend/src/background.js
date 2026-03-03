const BACKEND_URL = "http://127.0.0.1:8080"

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "ANALYZE_TEXT") {

    fetch(`${BACKEND_URL}/api/suggest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: request.text,
        mode: request.mode
      })
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }))

    return true
  }
})