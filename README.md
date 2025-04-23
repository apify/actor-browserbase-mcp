# Actor Browserbase MCP

This Actor is a wrapper for the [browserbase](https://github.com/browserbase/mcp-server-browserbase) MCP server.

This server provides cloud browser automation capabilities using [Browserbase](https://www.browserbase.com/), and [Puppeteer](https://pptr.dev/). This server enables LLMs to interact with web pages, and take screenshots, in a cloud browser environment.

All credits to the original authors of https://github.com/browserbase/mcp-server-browserbase.

## Features

| Feature            | Description                               |
| ------------------ | ----------------------------------------- |
| Browser Automation | Control and orchestrate cloud browsers    |
| Data Extraction    | Extract structured data from any webpage  |
| Console Monitoring | Track and analyze browser console logs    |
| Screenshots        | Capture full-page and element screenshots |
| JavaScript         | Execute custom JS in the browser context  |
| Web Interaction    | Navigate, click, and fill forms with ease |

## Use cases

- 🌐 Web navigation and form filling
- 📋 Structured data extraction
- 🧪 LLM-driven automated testing
- 🤖 Browser automation for AI agents

## Tools

| Tool Name                 | Description                                                                 |
| ------------------------- | --------------------------------------------------------------------------- |
| browserbase_create_session | Create a new cloud browser session using Browserbase                       |
| browserbase_navigate       | Navigate to a URL                                                          |
| browserbase_screenshot     | Takes a screenshot of the current page. Use this tool to learn where you are on the page when controlling the browser with Stagehand. Only use this tool when the other tools are not sufficient to get the information you need. |
| browserbase_click          | Click an element on the page                                               |
| browserbase_fill           | Fill out an input field                                                    |
| browserbase_get_text       | Extract all text content from the current page                             |
