import { requirePagePermission } from "@/lib/rbac/guard"
import {
  getAssetsForList,
  getEmployeesForSelect,
  getMonitoredObjectsForSelect,
} from "@/lib/actions/asset.queries"
import { AssetsView } from "@/components/assets/assets-view"

export default async function AssetsPage() {
  await requirePagePermission("assets:manage")
  const [assets, employees, objects] = await Promise.all([
    getAssetsForList(),
    getEmployeesForSelect(),
    getMonitoredObjectsForSelect(),
  ])
  return <AssetsView assets={assets} employees={employees} objects={objects} />
}
