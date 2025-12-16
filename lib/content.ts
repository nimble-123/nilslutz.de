import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type CaseStudy = {
  slug: string
  title: string
  summary: string
  tags: string[]
  period: string
  role: string
  stack: string[]
  links?: {
    github?: string
    demo?: string
  }
  featured?: boolean
  metrics?: string[]
  content: string // Raw MDX content
}

export type Note = {
  slug: string
  title: string
  summary: string
  date: string
  tags?: string[]
  content: string // Raw MDX content
}

const contentDirectory = path.join(process.cwd(), 'content')

export async function getCaseStudies(): Promise<CaseStudy[]> {
  const dir = path.join(contentDirectory, 'case-studies')
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir)
  const posts = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '')
      const filePath = path.join(dir, file)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContent)

      return {
        slug,
        title: data.title,
        summary: data.summary,
        tags: data.tags || [],
        period: data.period,
        role: data.role,
        stack: data.stack || [],
        links: data.links,
        featured: data.featured,
        metrics: data.metrics,
        content,
      } as CaseStudy
    })

  // Sort by featured first, then maybe date if available? Or just reliable order.
  // Let's sort featured first.
  return posts.sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1))
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  const all = await getCaseStudies()
  return all.find((p) => p.slug === slug) || null
}

export async function getNotes(): Promise<Note[]> {
  const dir = path.join(contentDirectory, 'notes')
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir)
  const posts = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '')
      const filePath = path.join(dir, file)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContent)

      return {
        slug,
        title: data.title,
        summary: data.summary,
        date: data.date, // YYYY-MM-DD
        tags: data.tags || [],
        content,
      } as Note
    })
    .sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1))

  return posts
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const all = await getNotes()
  return all.find((p) => p.slug === slug) || null
}
