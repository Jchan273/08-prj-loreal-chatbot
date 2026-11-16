/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Maintain conversation history (LevelUp) including system prompt restriction
const messageHistory = [
  {
    role: "system",
    content: "You are an expert AI beauty advisor for L'Oréal. Your role is exclusively to help users discover, understand, and get recommendations for L'Oréal's extensive range of products across makeup, skincare, haircare, and fragrances, as well as provide personalized beauty routines. You must politely refuse to answer any questions that are unrelated to L'Oréal products, beauty routines, recommendations, or cosmetics."
  }
];

// Display initial greeting
appendMessage("ai", "👋 Hello! Welcome to L'Oréal. How can I help you discover our makeup, skincare, haircare, or fragrance products today?");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const questionText = userInput.value.trim();
  if (!questionText) return;

  // Clear input field
  userInput.value = "";

  // 1. Display user question / message bubble (LevelUp)
  appendUserMessage(questionText);

  // Add user message to history
  messageHistory.push({ role: "user", content: questionText });

  // Placeholder for loading state
  const loadingId = appendMessage("ai", "Thinking...");

  try {
    // Replace with your deployed Cloudflare Worker URL
    const workerUrl = "https://your-worker-subdomain.workers.dev";

    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages: messageHistory })
    });

    if (!response.ok) {
      throw new Error("Failed to communicate with the server.");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Remove loading message and display AI response
    removeMessage(loadingId);
    appendMessage("ai", aiResponse);

    // Add assistant response to history
    messageHistory.push({ role: "assistant", content: aiResponse });

  } catch (error) {
    console.error(error);
    removeMessage(loadingId);
    appendMessage("ai", "Sorry, I am having trouble connecting right now. Please try again later.");
  }
});

// Helper function to append regular AI messages
function appendMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", sender);
  msgDiv.textContent = text;
  
  // Assign unique ID for loading state removal
  const messageId = "msg-" + Date.now();
  msgDiv.id = messageId;

  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return messageId;
}

// Helper function to append user question with a label (LevelUp)
function appendUserMessage(text) {
  const containerDiv = document.createElement("div");
  containerDiv.classList.add("msg.user-container", "user-container");

  const labelDiv = document.createElement("div");
  labelDiv.classList.add("user-label");
  labelDiv.textContent = "You";

  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", "user");
  msgDiv.textContent = text;

  containerDiv.appendChild(labelDiv);
  containerDiv.appendChild(msgDiv);

  chatWindow.appendChild(containerDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeMessage(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}
