// FlowDoors only offers Slide-and-Stack: redirect to configurator
import { redirect } from 'next/navigation'

export default function Page() {
  redirect('/configure/slide-stack')
}
