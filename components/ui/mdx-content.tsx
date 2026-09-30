import type { ComponentPropsWithoutRef } from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'
import { createCssVariablesTheme, createHighlighter } from 'shiki'
import { customLanguages } from '@/lib/shiki-config'

interface MDXContentProps {
  source: string
}

/**
 * One monochrome theme for both colour modes: token colours are CSS variables
 * (`--shiki-*` in globals.css), so dark mode is the same exact inversion as the rest of the site.
 */
const lineTheme = createCssVariablesTheme({
  name: 'line',
  variablePrefix: '--shiki-',
  variableDefaults: {},
  fontStyle: true,
})

/** The page owns the article's h1; headings inside the body start at h2. */
const components = {
  h1: (props: ComponentPropsWithoutRef<'h2'>) => <h2 {...props} />,
}

export async function MDXContent({ source }: MDXContentProps) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            [
              rehypePrettyCode,
              {
                theme: lineTheme,
                keepBackground: false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                getHighlighter: async (options: any) => {
                  const highlighter = await createHighlighter({
                    themes: options.themes || [lineTheme],
                    langs: [
                      'javascript',
                      'typescript',
                      'python',
                      'bash',
                      'shell',
                      'json',
                      'markdown',
                      // @ts-expect-error - custom language types
                      ...customLanguages.map((lang) => ({
                        ...lang.grammar,
                        id: lang.id,
                        scopeName: lang.scopeName,
                        aliases: lang.aliases,
                      })),
                    ],
                  })
                  return highlighter
                },
              },
            ],
          ],
        },
      }}
    />
  )
}
