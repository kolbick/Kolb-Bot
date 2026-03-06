---
name: agent-template
description: "Template for creating new Kolb-Bot agents. Provides the standard agent scaffold with role definition, tool permissions, and behavioral guardrails."
---

# Agent Template

When creating a new agent, follow this structure:

## Required Configuration

1. **Name**: A clear, descriptive name for the agent
2. **Role**: What the agent does (researcher, coder, planner, etc.)
3. **System Instructions**: Detailed behavioral guidelines
4. **Model**: Which LLM model to use
5. **Safe Mode**: Always ON by default

## Tool Permissions (opt-in, not opt-out)

Start with the minimum required tools:

- `read_file` — Read files in the workspace
- `list_files` — List directory contents
- `search` — Search within files
- `web_search` — Search the web

Additional tools must be explicitly enabled:

- `write_file` — Create/modify files (requires safe_mode confirmation)
- `execute_command` — Run shell commands (high privilege)
- `browser` — Web browsing automation (high privilege)

## Sub-Agent Guidelines

Sub-agents inherit their parent's constraints but may have:

- A narrower tool set (never broader)
- A more specific role
- Task-scoped instructions

## Skills

Attach relevant Skills (markdown instruction sets) for domain expertise.
Skills are loaded on-demand and do not consume context until invoked.
