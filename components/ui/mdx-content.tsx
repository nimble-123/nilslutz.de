import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'
import { createHighlighter } from 'shiki'
import { customLanguages } from '@/lib/shiki-config'

interface MDXContentProps {
  source: string
}

export async function MDXContent({ source }: MDXContentProps) {
  return (
    <MDXRemote
      source={source}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            [
              rehypePrettyCode,
              {
                // Single dark theme: warm keywords on ink, matching the sodium accent
                theme: 'vesper',
                keepBackground: false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                getHighlighter: async (options: any) => {
                  const highlighter = await createHighlighter({
                    themes: options.themes || ['vesper'],
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
