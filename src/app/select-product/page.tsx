// FlowDoors only offers Slide-and-Stack systems
// Redirect directly to the configurator
import { redirect } from 'next/navigation'

export default function SelectProductPage() {
  redirect('/configure/slide-stack')
}
