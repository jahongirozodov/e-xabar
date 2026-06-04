import { requirePagePermission } from "@/lib/rbac/guard"
import { getNotifications } from "@/lib/actions/notification.queries"
import { NotificationsView } from "@/components/notifications/notifications-view"

export default async function NotificationsPage() {
  await requirePagePermission("findings:manage")
  const notifications = await getNotifications()
  return <NotificationsView notifications={notifications} />
}
