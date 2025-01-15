export async function sendMessage() {
  const input = document.getElementById("message-input");
  const message = input.value;
  if (!message) return;

  displayMessage(message, true);
  input.value = "";

  const loadingId = displayLoading();

  try {
    const minWaitTime = new Promise((resolve) => setTimeout(resolve, 3000));

    const responsePromise = fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const [response] = await Promise.all([responsePromise, minWaitTime]);
    const data = await response.json();

    removeLoading(loadingId);

    displayMessage(data.message, false);

    if (data.cat_image) {
      displayCatImage(data.cat_image);
    }
  } catch (error) {
    console.error("Error:", error);
    removeLoading(loadingId);
    displayMessage("Error: Could not send message", false);
  }
}

function displayMessage(message, isUser) {
  const chat = document.getElementById("chat");

  const messageDiv = document.createElement("div");

  if (isUser) {
    messageDiv.className = "user-message";
    messageDiv.textContent = message;
  } else {
    messageDiv.className = "bot-message";

    const botImage = document.createElement("img");
    botImage.className = "bot-img";
    botImage.src = "/static/imgs/bot-cat.png";

    const botText = document.createElement("div");
    botText.className = "bot-text";
    botText.textContent = message;

    messageDiv.appendChild(botImage);
    messageDiv.appendChild(botText);
  }

  chat.appendChild(messageDiv);
  chat.scrollTop = chat.scrollHeight;
}

function displayCatImage(imageUrl) {
  const chat = document.getElementById("chat");
  const imgDiv = document.createElement("div");
  imgDiv.className = "message";
  const img = document.createElement("img");
  img.src = imageUrl;
  img.className = "cat-image";
  imgDiv.appendChild(img);
  chat.appendChild(imgDiv);
  chat.scrollTop = chat.scrollHeight;
}

let loadingSoundEnabled = true;

function toggleVolume() {
  const volumeIcon = document.getElementById("volume-icon");
  loadingSoundEnabled = !loadingSoundEnabled;

  const isMuted = volumeIcon.dataset.muted === "true";
  volumeIcon.dataset.muted = (!isMuted).toString();

  volumeIcon.src = loadingSoundEnabled
    ? "/static/imgs/volume.png"
    : "/static/imgs/volume-mute.png";
}

function displayLoading() {
  if (loadingSoundEnabled) {
    const loadingSound = new Audio("/static/sounds/loading-cat.m4a");
    loadingSound.volume = 0.5;
    try {
      loadingSound.play().catch((error) => {
        console.log("Audio playback failed:", error);
      });
    } catch (error) {
      console.log("Audio playback failed:", error);
    }
  }

  const chat = document.getElementById("chat");
  const loadingDiv = document.createElement("div");
  const loadingId = "loading-" + Date.now();
  loadingDiv.id = loadingId;
  loadingDiv.className = "message loading-message";

  const loadingContent = document.createElement("div");
  loadingContent.className = "loading-content";

  const loadingGif = document.createElement("img");
  loadingGif.src = "/static/imgs/loading-cat.gif";
  loadingGif.className = "cat-spinning";

  loadingContent.appendChild(loadingGif);
  loadingDiv.appendChild(loadingContent);
  chat.appendChild(loadingDiv);
  chat.scrollTop = chat.scrollHeight;

  return loadingId;
}

function removeLoading(loadingId) {
  const loadingDiv = document.getElementById(loadingId);
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

document.getElementById("send-button").addEventListener("click", sendMessage);

document
  .getElementById("message-input")
  .addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

document.addEventListener("DOMContentLoaded", () => {
  const volumeIcon = document.getElementById("volume-icon");
  volumeIcon.addEventListener("click", toggleVolume);
});
