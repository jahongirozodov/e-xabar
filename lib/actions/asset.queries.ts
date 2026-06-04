import "server-only"
import { prisma } from "@/lib/db/prisma"
import type { AssetCategory, FindingStatus, Severity } from "@prisma/client"

export interface SevBreakdown {
  c: number
  h: number
  m: number
  l: number
}

export interface AssetFindingRow {
  id: string
  cveId: string
  title: string | null
  severity: Severity
  isKev: boolean
  status: FindingStatus
}

export interface AssetRow {
  id: string
  name: string
  vendor: string | null
  version: string | null
  category: AssetCategory
  toolType: string | null
  objectId: string | null
  objectName: string | null
  objectNumber: string | null
  city: string | null
  orgName: string | null
  orgType: string | null
  ownerId: string | null
  ownerName: string | null
  ownerEmail: string | null
  ownerDept: string | null
  ownerPosition: string | null
  ownerPhone: string | null
  purl: string | null
  cpeUri: string | null
  fc: number
  breakdown: SevBreakdown
  kev: boolean
  maxCvss: number | null
  topSeverity: Severity
  findings: AssetFindingRow[]
}

export interface EmployeeOption {
  id: string
  fullName: string
  email: string
  department: string | null
}

export interface ObjectOption {
  id: string
  name: string
  number: string | null
  orgName: string | null
}

const SEV_RANK: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 }

export async function getAssetsForList(): Promise<AssetRow[]> {
  const assets = await prisma.asset.findMany({
    include: {
      object: { include: { organization: true, responsible: true } },
      employees: {
        where: { unassignedAt: null },
        include: { employee: true },
        orderBy: { assignedAt: "asc" },
      },
      findings: {
        include: {
          vulnerability: {
            select: { cveId: true, title: true, severity: true, isKev: true, cvssV3Score: true },
          },
        },
        orderBy: { firstSeenAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  })

  return assets.map((a) => {
    const breakdown: SevBreakdown = { c: 0, h: 0, m: 0, l: 0 }
    let kev = false
    let maxCvss: number | null = null
    let topSeverity: Severity = "NONE"
    for (const f of a.findings) {
      const sev = f.vulnerability.severity
      if (sev === "CRITICAL") breakdown.c++
      else if (sev === "HIGH") breakdown.h++
      else if (sev === "MEDIUM") breakdown.m++
      else if (sev === "LOW") breakdown.l++
      if (f.vulnerability.isKev) kev = true
      if (SEV_RANK[sev] > SEV_RANK[topSeverity]) topSeverity = sev
      const cvss = f.vulnerability.cvssV3Score ? Number(f.vulnerability.cvssV3Score) : null
      if (cvss != null && (maxCvss == null || cvss > maxCvss)) maxCvss = cvss
    }

    // Mas'ul: avval obyekt responsible, keyin asset owner (EmployeeAsset)
    const owner =
      a.object?.responsible ??
      a.employees.find((e) => e.role === "owner")?.employee ??
      a.employees[0]?.employee ??
      null

    return {
      id: a.id,
      name: a.name,
      vendor: a.vendor,
      version: a.version,
      category: a.category,
      toolType: a.toolType,
      objectId: a.objectId,
      objectName: a.object?.name ?? null,
      objectNumber: a.object?.number ?? null,
      city: a.object?.city ?? null,
      orgName: a.object?.organization?.name ?? null,
      orgType: a.object?.organization?.type ?? null,
      ownerId: owner?.id ?? null,
      ownerName: owner?.fullName ?? null,
      ownerEmail: owner?.email ?? null,
      ownerDept: owner?.department ?? null,
      ownerPosition: owner?.position ?? null,
      ownerPhone: owner?.phone ?? null,
      purl: a.purl,
      cpeUri: a.cpeUri,
      fc: a.findings.length,
      breakdown,
      kev,
      maxCvss,
      topSeverity,
      findings: a.findings.map((f) => ({
        id: f.id,
        cveId: f.vulnerability.cveId,
        title: f.vulnerability.title,
        severity: f.vulnerability.severity,
        isKev: f.vulnerability.isKev,
        status: f.status,
      })),
    }
  })
}

export async function getEmployeesForSelect(): Promise<EmployeeOption[]> {
  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, fullName: true, email: true, department: true },
    orderBy: { fullName: "asc" },
  })
  return employees
}

export async function getMonitoredObjectsForSelect(): Promise<ObjectOption[]> {
  const objects = await prisma.monitoredObject.findMany({
    include: { organization: { select: { name: true } } },
    orderBy: { name: "asc" },
  })
  return objects.map((o) => ({
    id: o.id,
    name: o.name,
    number: o.number,
    orgName: o.organization?.name ?? null,
  }))
}
