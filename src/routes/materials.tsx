import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/materials')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/materials"!</div>
}
