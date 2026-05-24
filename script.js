// App State storage arrays
let chats = [{ id: 1, name: "New Chat", messages: [] }];
let activeChatId = 1;
let currentModel = "flash";

window.onload = function() {
  renderSidebar();
};

function acceptWarning() {
  const overlay = document.getElementById("warning-screen");
  if (overlay) {
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.style.display = "none";
      const tagOverlay = document.getElementById("tag-warning");
      if (tagOverlay) {
        tagOverlay.style.display = "flex";
        tagOverlay.style.opacity = "1";
      }
    }, 400);
  }
}

function closeTagWarning() {
  const overlay = document.getElementById("tag-warning");
  if (overlay) {
    overlay.style.opacity = "0";
    setTimeout(() => { overlay.style.display = "none"; }, 400);
  }
}

function closeCodeMakerWarning() {
  const overlay = document.getElementById("codemaker-warning");
  if (overlay) {
    overlay.style.opacity = "0";
    setTimeout(() => { overlay.style.display = "none"; }, 400);
  }
}

function changeModel() {
  const select = document.getElementById("model-select");
  if (!select) return;
  currentModel = select.value;
  if (currentModel === "cmpro" || currentModel === "cmanimation" || currentModel === "cmcss" || currentModel === "cmclassic") {
    const cmWarning = document.getElementById("codemaker-warning");
    if (cmWarning) {
      cmWarning.style.display = "flex";
      cmWarning.style.opacity = "1";
    }
  }
}

function renderSidebar() {
  const list = document.getElementById("chat-list");
  if (!list) return;
  list.innerHTML = "";
  chats.forEach(chat => {
    let activeClass = chat.id === activeChatId ? "active" : "";
    list.innerHTML += `<div class='chat-item ${activeClass}' onclick='switchChat(${chat.id})'><span id='title-${chat.id}'>${chat.name}</span><button class='rename-btn' onclick='renameChat(${chat.id}, event)'>✏️</button></div>`;
  });
}

function startNewChat() {
  let newId = Date.now();
  chats.push({ id: newId, name: "New Chat", messages: [] });
  activeChatId = newId;
  renderSidebar();
  loadActiveChat();
}

function switchChat(id) {
  activeChatId = id;
  renderSidebar();
  loadActiveChat();
}
function loadActiveChat() {
  const container = document.getElementById("messages-container");
  const welcome = document.getElementById("welcome-screen");
  let activeChat = chats.find(c => c.id === activeChatId);
  if (!container || !welcome) return;
  container.innerHTML = "";
  if (activeChat.messages.length === 0) {
    welcome.style.display = "block";
  } else {
    welcome.style.display = "none";
    activeChat.messages.forEach(msg => {
      if (msg.role === "user") {
        container.innerHTML += "<div class='msg-row user-row'><div class='msg-content'>" + msg.text + "</div></div>";
      } else {
        let thinkHtml = msg.thinking ? "<div class='thinking-box'><b>Thinking Process:</b><br>" + msg.thinking + "</div>" : "";
        container.innerHTML += "<div class='msg-row bot-row'><div class='msg-content'><div class='bot-name'>✨ " + msg.modelName + "</div>" + thinkHtml + "<div>" + msg.text + "</div></div></div>";
      }
    });
  }
  const chatArea = document.getElementById("chat-area");
  if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
}

function renameChat(id, event) {
  event.stopPropagation();
  let newName = prompt("Enter a new name:");
  if (newName && newName.trim() !== "") {
    let chat = chats.find(c => c.id === id);
    chat.name = newName.trim();
    renderSidebar();
  }
}

function resetAllHistory() {
  if (confirm("Delete all chat history?")) {
    chats = [{ id: 1, name: "New Chat", messages: [] }];
    activeChatId = 1;
    renderSidebar();
    loadActiveChat();
  }
}

function handleKeyPress(e) {
  if (e.key === 'Enter') handleSend();
}

function handleSend() {
  const input = document.getElementById("user-msg");
  if (!input) return;
  let text = input.value.trim();
  if (text === "") return;
  let activeChat = chats.find(c => c.id === activeChatId);
  activeChat.messages.push({ role: "user", text: text });
  if (activeChat.name === "New Chat") {
    activeChat.name = text.substring(0, 15) + (text.length > 15 ? "..." : "");
    renderSidebar();
  }
  input.value = "";
  loadActiveChat();
  generateAIResponse(text, activeChat);
}

function generateAIResponse(userText, activeChat) {
  let modelName = ""; let thinking = ""; let text = ""; let delay = 600;
  let lower = userText.toLowerCase(); let aiAnswer = null;

  if (lower.includes("power of") && !lower.includes("^")) {
    aiAnswer = "Please use symbols like x^2 or 3**4! 🛑";
  }
  if (lower.includes("geometry") || lower.includes("triangle") || lower.includes("circle")) {
    aiAnswer = "📐 Geometry: Area = π*r² | Area = 0.5*b*h | a²+b²=c²";
  } else if (lower.includes("statistics") || lower.includes("mean") || lower.includes("median")) {
    aiAnswer = "📊 Stats: Mean = Average | Median = Middle Value";
  }

  if (!aiAnswer && typeof Algebrite !== 'undefined') {
    try {
      if (lower.includes("derivative of")) {
        let exp = userText.replace(/derivative of/gi, '').trim();
        aiAnswer = "Derivative: " + Algebrite.derivative(exp).toString();
      } else if (lower.includes("integral of")) {
        let exp = userText.replace(/integral of/gi, '').trim();
        aiAnswer = "Integral: " + Algebrite.integral(exp).toString();
      } else {
        let exp = userText.replace(/solve|calculate/gi, '').trim();
        aiAnswer = "Result: " + Algebrite.run(exp).toString();
      }
    } catch (e) {}
  }

  if (!aiAnswer) {
    let mathClean = userText.replace(/[^0-9+\-*/().*<>=\s]/g, '');
    if (mathClean && /[0-9]/.test(mathClean)) {
      try { aiAnswer = "Result = " + Function("'use strict'; return (" + mathClean + ")")(); } catch (e) {}
    }
  }
  if (!aiAnswer) aiAnswer = "Processing your request. Please supply equations or math tags. 🔢";

  if (currentModel === "flash") { modelName = "Coba 3 Flash"; text = "⚡ " + aiAnswer; }
  else if (currentModel === "thinking") { modelName = "Coba 3.5 Thinking"; thinking = "Analyzing..."; text = "🧠 " + aiAnswer; }
  else if (currentModel === "ultra") { modelName = "Coba 4.5 Ultra"; text = "👑 " + aiAnswer; }
  else if (currentModel === "codemath") { modelName = "Coba 3 [Code/Math]"; text = "💻 " + aiAnswer; }
  else if (currentModel === "cmpro") { modelName = "CodeMaker Pro"; text = "🚀 ```javascript\nconsole.log('" + aiAnswer + "');\n```"; }
  else if (currentModel === "cmanimation") { modelName = "Animation Engine"; text = "🎬 ```css\n@keyframes move { to { transform: scale(1.2); } }\n```"; }
  else if (currentModel === "cmcss") { modelName = "CSS Designer"; text = "🎨 ```css\n.box { color: neon; }\n```"; }
  else if (currentModel === "cmclassic") { modelName = "Classic CodeMaker"; text = "🛠️ HTML/CSS/JS Package Loaded."; }
  else if (currentModel === "c5pro") { modelName = "Coba 5 Thinking Pro"; thinking = "[Gemini 3.5 + Claude 4.6 + Grok 4]"; text = "🔮 Hybrid Core: " + aiAnswer; }

  setTimeout(() => {
    activeChat.messages.push({ role: "bot", modelName: modelName, thinking: thinking, text: text });
    loadActiveChat();
  }, delay);
}

function changeModel() {
  const select = document.getElementById("model-select");
  if (select) currentModel = select.value;
}
