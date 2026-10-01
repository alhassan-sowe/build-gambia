import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/materials/$productId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/materials/$productId"!</div>
}
