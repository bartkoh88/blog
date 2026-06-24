import { NewsletterAPI } from 'pliny/newsletter'
import siteMetadata from '@/data/siteMetadata'

export const dynamic = 'force-static'

const provider = siteMetadata.newsletter?.provider
const handler = provider
  ? NewsletterAPI({
      // @ts-ignore
      provider,
    })
  : undefined

function disabled() {
  return Response.json({ error: 'Newsletter is disabled.' }, { status: 404 })
}

export const GET = handler || disabled
export const POST = handler || disabled
