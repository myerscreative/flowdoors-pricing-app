import BuilderClient from './BuilderClient'

export default function Page() {
  // Server wrapper keeps this route RSC-friendly.
  return <BuilderClient />
}
