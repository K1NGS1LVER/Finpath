# Workflow Preferences

- Does not want Claude/AI listed as a co-author on commits in his repos; explicitly asked for co-author attribution to be removed, and expects it gone from history, not just future messages. Confidence: 0.9
- Prefers minimal, necessity-driven changes — wants additions evaluated for whether they are actually needed ("not adding for the sake of adding") rather than applied reflexively. Confidence: 0.7
- Prefers delegating implementation work to subagents while the main agent verifies the results ("rewrite with sub agents and you verify it"). Confidence: 0.7
- Prefers merging branches into main locally rather than going through a remote/PR flow. Confidence: 0.6
- When a task requires interactive authentication, wants to be told before the agent proceeds (run the login himself) rather than have the agent go ahead or attempt logins; if a tool is already logged in, continue without asking. Confidence: 0.7
- Prefers fixing and managing each platform through its own official CLI (Netlify/Render/Supabase, etc.) rather than web dashboards. Confidence: 0.6

