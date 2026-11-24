---
title: 'srating.io in Claude, ChatGPT and Codex'
excerpt: "A free MCP server, so you can ask your AI assistant about college basketball and football and get answers from srating.io data."
coverImage: null
date: '2026-11-23T12:00:00.000Z'
author:
  name: 'Evan S'
  picture: '/public/static/images/evan.png'
ogImage:
  url: null
---

# srating.io in Claude, ChatGPT and Codex

More and more people ask an AI assistant their sports questions instead of searching for them.
So now the assistant can ask srating.io. I built an [MCP server](https://docs.srating.io/mcp) at
`mcp.srating.io`. It lets Claude, ChatGPT, Codex, Cursor or anything else that speaks MCP look up
our college basketball and football data while it answers you.

It's free, with no account and no API key.

## Connect

- **Claude** - search for **srating** in the connector directory and add it. It works on claude.ai
  and in the desktop and mobile apps.
- **Everything else** - add a custom connector (remote MCP server) with this url, using no
  authentication:

```
https://mcp.srating.io/mcp
```

The [AI assistants page](https://srating.io/ai) has step-by-step setup for ChatGPT, Codex, Claude
Code, Cursor and VS Code.

## What you can ask

- "Who are the top 10 college basketball teams right now?"
- "How has Duke played this season?"
- "What were the college football scores last Saturday?"
- "Who coaches Alabama football, and what is their record?"
- "What does elo mean on srating.io?"

There are nine read-only tools behind it: rankings, scoreboards, games, teams, players, coaches,
conferences, search, and a glossary for the stats whose names don't explain themselves. Every answer
links back to the page on srating.io it came from, so you can check the work. The full list is in
the [tool docs](https://docs.srating.io/mcp/tools).

## What it does not do

- **No projections.** Win probability and projected scores stay on the site and in the API.
- **Capacity is shared.** Everyone using it draws from one monthly allowance. If you need volume you
  can count on, the [API](https://docs.srating.io) with your own key is the way to go.

## Why

An assistant is a good front end for this kind of data. You ask in plain English, it works out which
team, season and stat you meant, and it puts the answer together from a few lookups. A ranking table
can't do that. It's also the best demo the API has had: what the assistant does through the MCP
server is a smaller version of what the API does for your own code.

Questions, bugs or ideas: [contact@srating.io](mailto:contact@srating.io).
