import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface StatsCardProps {
  icon: ReactNode
  value: number
  suffix?: string
  prefix?: string
  label: string
  description: string
}

export function StatsCard({ icon, value, suffix = '', prefix = '', label, description }: StatsCardProps) {
  return (
    <article className="school-stat-card">
      <div className="school-stat-card__icon" aria-hidden="true">{icon}</div>
      <div>
        <p className="school-stat-card__number">{prefix}{value.toLocaleString()}{suffix}</p>
        <h3>{label}</h3>
        <p className="school-stat-card__description">{description}</p>
      </div>
    </article>
  )
}

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  href: string
  buttonText: string
}

export function FeatureCard({ icon, title, description, href, buttonText }: FeatureCardProps) {
  return (
    <article className="school-directory-card">
      <div className="school-directory-card__icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link href={href} className="school-text-link">
        {buttonText}<ArrowRight aria-hidden="true" />
      </Link>
    </article>
  )
}
