import type { ComponentPropsWithoutRef } from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'
import { createHighlighter } from 'shiki'
import { customLanguages } from '@/lib/shiki-config'
import { stripLeadingTitle } from '@/lib/utils'

interface MDXContentProps {
  source: string
}

// The page owns the only <h1>; any remaining `#` heading in content becomes an <h2>.
const components = {
  h1: (props: ComponentPropsWithoutRef<'h2'>) => <h2 {...props} />,
}

export async function MDXContent({ source }: MDXContentProps) {
  return (
    <MDXRemote
      source={stripLeadingTitle(source)}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            [
              rehypePrettyCode,
              {
                theme: {
                  dark: 'github-dark',
                  light: 'github-light',
                },
                keepBackground: false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                getHighlighter: async (options: any) => {
                  const highlighter = await createHighlighter({
                    themes: options.themes || ['github-dark', 'github-light'],
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
