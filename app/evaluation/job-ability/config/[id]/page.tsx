import { CertificationRulePage } from '@/components/evaluation/certification-rule-page'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PositionConfigPage({ params }: PageProps) {
  const { id } = await params
  return <CertificationRulePage positionId={id} />
}
