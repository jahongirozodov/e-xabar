import { requirePagePermission } from "@/lib/rbac/guard"
import { getSettings, getIntegrations } from "@/lib/actions/settings.queries"
import { SettingsView } from "@/components/settings/settings-view"

export default async function SettingsPage() {
  await requirePagePermission("settings:manage")
  const [settings, integrations] = await Promise.all([getSettings(), getIntegrations()])
  return <SettingsView settings={settings} integrations={integrations} />
}
