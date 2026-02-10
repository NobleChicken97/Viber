# Vibe Coding Prompt Templates

Copy-paste these prompts to activate the right agent for your task.

---

## 🎨 Frontend Developer

```
You are the frontend-developer agent.

Build [feature/component name] with the following requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Use the default stack (Next.js + TypeScript + shadcn/ui + Tailwind).
```

**Example:**
```
You are the frontend-developer agent.

Build a user profile settings page with:
- Avatar upload with preview
- Email and display name edit fields
- Dark/light mode toggle
- Save/cancel buttons

Use the default stack.
```

---

## 📊 Trend Researcher

```
You are the trend-researcher agent.

Research what changed in [market/industry] this week.

Market: [e.g., AI coding tools, SaaS automation, etc.]
Geography: [e.g., global, US, EU]
Sources: [provide 3-5 URLs or keywords]
```

**Example:**
```
You are the trend-researcher agent.

Research what changed in the AI coding assistant market this week.

Market: AI developer tools and code completion
Geography: Global
Sources: Search for GitHub Copilot updates, Cursor IDE releases, Codeium news
```

---

## ✍️ Content Creator

```
You are the content-creator agent.

Turn this idea into ready-to-post content:
[Your idea/feature/product description]

Target audience: [who you're talking to]
Platforms: [Twitter/X, LinkedIn, blog, etc.]
Tone: [professional, casual, technical, friendly]
CTA: [what action you want readers to take]
```

**Example:**
```
You are the content-creator agent.

Turn this idea into ready-to-post content:
A mood-based music player that detects your facial expression and plays songs matching your vibe.

Target audience: Music lovers aged 18-35
Platforms: Twitter/X and Instagram
Tone: Casual, fun, exciting
CTA: Try the beta
```

---

## 📈 Analytics Reporter

```
You are the analytics-reporter agent.

Analyze these metrics and recommend the next move:

[Paste your data/metrics here]

Context:
- Time period: [e.g., last 7 days, Jan 2026]
- Goal: [e.g., increase signups, reduce churn]
- Previous baseline: [if available]
```

**Example:**
```
You are the analytics-reporter agent.

Analyze these metrics and recommend the next move:

Signups: 450 (Feb 1-7)
Activation rate: 32%
Churn: 12%
Revenue: $2,300

Context:
- Time period: Last 7 days (Feb 1-7, 2026)
- Goal: Increase activation rate
- Previous baseline: 28% activation in January
```

---

## 💬 Support Responder

```
You are the support-responder agent.

Draft a reply to this customer issue:

[Paste customer message here]

Context:
- Product: [your product name]
- Issue type: [bug, feature request, billing, etc.]
- Customer tier: [free, pro, enterprise]
```

**Example:**
```
You are the support-responder agent.

Draft a reply to this customer issue:

"I paid for Pro but I still can't access the mood detection feature. It keeps saying 'upgrade required' when I try to use it."

Context:
- Product: Viber (mood-based music player)
- Issue type: Access/billing issue
- Customer tier: Pro (paid)
```

---

## 🛠️ General Task (No Specific Agent)

```
[Describe your task clearly]

Requirements:
- [Requirement 1]
- [Requirement 2]

Use the default stack and follow security best practices.
```

---

## 🚀 Quick Commands

**Start a new feature:**
```
You are the frontend-developer agent. Build [feature]. Use default stack.
```

**Fix a bug:**
```
Fix this bug: [describe issue]. Apply security checks if relevant.
```

**Create content:**
```
You are the content-creator agent. Write a Twitter thread about [topic]. Casual tone, target audience: [audience].
```

**Quick research:**
```
You are the trend-researcher agent. Summarize what's new in [topic] this week.
```

---

## 💡 Pro Tips

1. **Be specific:** The more details you provide, the better the output.
2. **Start with role:** Always begin with "You are the [role] agent."
3. **Default stack:** No need to repeat Next.js/TypeScript unless you want something different.
4. **Security:** Mention it only if it's not obvious (e.g., public landing page vs. payment form).
5. **Iterations:** If the first output isn't perfect, refine with: "Update this to also include [X]."
