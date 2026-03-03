export async function analyzText(text, mode) {
  return new Promise((resolve, reject) => {

    chrome.runtime.sendMessage(
      {
        type: "ANALYZE_TEXT",
        text,
        mode
      },
      (response) => {

        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }

        if (response && response.success) {
          resolve(response.data.data)
        } else {
          reject(new Error(response?.error || "Something went wrong"))
        }

      }
    )

  })
}