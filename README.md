## Introduction 

For this project, I wanted to build a tool that can design professional looking and creative marketing emails using MJML. 

Tool includes: 
- *Image upload*: Upload image assets to be used in the email. These are almost always key parts of an email being sent out. An LLM generates a description of the contents, layout,a nd style of the image to help it be used in email creation. 
- *Chat interface*: talk to an LLM as you design your email. 
- *Email builder tools*: two tools - one to draft emails, and one to make edits to an existing email using vision LLMs.
- *Notebooks folder* - `/notebooks` includes the analysis done to decide on a set of prompts and base LLM.

## 

Ask the tool to draft an email 

<img src="https://github.com/CharlieNatoli/email-designer-agent/blob/master/assets/draft_email_screenshot.png" alt="drawing" width="75%"/>


Email display

<img src="https://github.com/CharlieNatoli/email-designer-agent/blob/master/assets/email_example.png" alt="drawing" width="75%"/>

Editing an email previously created


<img src="https://github.com/CharlieNatoli/email-designer-agent/blob/master/assets/ask_to_edit.png" alt="drawing" width="75%"/>


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
