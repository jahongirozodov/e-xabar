import { requirePagePermission } from "@/lib/rbac/guard"
import { getUsers } from "@/lib/actions/user.queries"
import { UsersView } from "@/components/users/users-view"

export default async function UsersPage() {
  await requirePagePermission("users:manage")
  const users = await getUsers()
  return <UsersView users={users} />
}
