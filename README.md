# My personal blog based on Next.JS and Notion as CMS

[![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

## Intro

This repo is what I use to power my personal blog / portfolio site [nilslutz.de](https://nilslutz.de).

It uses Notion as a CMS, fetching content from Notion and then uses [Next.js](https://nextjs.org/) and [react-notion-x](https://github.com/NotionX/react-notion-x) to render everything.

The site is then deployed to [Vercel](http://vercel.com).

## Features

- Setup only takes a few minutes ([single config file](./site.config.js)) 💪
- Robust support for Notion content via [react-notion-x](https://github.com/NotionX/react-notion-x)
- Next.js / TS / React / Notion
- Excellent page speeds
- Sexy LQIP image previews
- Embedded GitHub comments
- Automatic open graph images
- Automatic pretty URLs
- Automatic table of contents
- Full support for dark mode
- Quick search via CMD+P just like in Notion
- Responsive for desktop / tablet / mobile
- Optimized for Next.js and Vercel

## Setup

**All config is defined in [site.config.js](./site.config.js).**

1. Fork / clone this repo
2. Change a few values in [site.config.js](./site.config.js)
3. `npm install`
4. `npm run dev` to test locally
5. `npm run deploy` to deploy to vercel 💪

I tried to make configuration as easy as possible.

All you really need to do to get started is edit `rootNotionPageId`. It defaults to rendering my site's public notion page [69b20b1123e04a96b56b5290c87dfa9f](https://notion.so/69b20b1123e04a96b56b5290c87dfa9f).

You'll want to make your root Notion page **public** and then copy the link to your clipboard. Then extract the last part of the URL that looks like `d1b5dcf8b9ff425b8aef5ce6f0730202`, which is your page's Notion ID.

---

## License

MIT © [Nils Lutz](https://nilslutz.de)

Support me by <a href="https://twitter.com/nimble___">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>
