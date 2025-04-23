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
| browserbase_navigate       | Navigate to a URL                                                          |
| browserbase_screenshot     | Takes a screenshot of the current page. Use this tool to learn where you are on the page when controlling the browser. Use this tool when the other tools are not sufficient enough to get the information you need. |
| browserbase_click          | Click an element on the page                                               |
| browserbase_fill           | Fill out an input field                                                    |
| browserbase_evaluate       | Execute JavaScript in the browser console                                  |
| browserbase_get_content    | Extract all content from the current page                                  |

## Pricing

| Event                              | Description                                                   | Price (USD) |
| ---------------------------------- | ------------------------------------------------------------- | ----------- |
| Actor start per 1 GB               | Flat fee for starting an Actor run for each 1 GB of memory.   | $0.05       |
| BrowserBase session runtime per minute | Flat fee for each started minute of BrowserBase session runtime. | $0.002      |

## 🌐 Open source

This Actor is open source, hosted on [GitHub](https://github.com/apify/actor-browserbase-mcp).
