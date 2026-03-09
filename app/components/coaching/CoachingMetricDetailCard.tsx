'use client'

import type { CSSProperties } from 'react'
import MetricComparisonChart from './MetricComparisonChart'

export type CoachingPerformanceBand = 'good' | 'warning' | 'risk'

export type CoachingMetricViewModel = {
  id: string
  title: string
  subtitle: string
  iconClassName: string
  youLabel: string
  topLabel: string
  chartYouPercent: number
  chartTopPercent: number
  performanceBand: CoachingPerformanceBand
  description: string
  whyItMatters: string[]
  coachingTips: string[]
  notePrompt: string
}

const statusMeta: Record<
  CoachingPerformanceBand,
  { label: string; accentColor: string; surfaceColor: string; borderColor: string }
> = {
  good: {
    label: 'On Track',
    accentColor: 'var(--color-support-positive)',
    surfaceColor: 'rgba(49, 154, 73, 0.28)',
    borderColor: 'rgba(49, 154, 73, 0.46)',
  },
  warning: {
    label: 'Needs Focus',
    accentColor: 'var(--color-support-warning-orange)',
    surfaceColor: 'rgba(254, 196, 42, 0.34)',
    borderColor: 'rgba(218, 110, 39, 0.42)',
  },
  risk: {
    label: 'Off Track',
    accentColor: 'var(--color-support-negative)',
    surfaceColor: 'rgba(203, 45, 45, 0.26)',
    borderColor: 'rgba(203, 45, 45, 0.42)',
  },
}

type DashboardListCardProps = {
  title: string
  subtitle: string
  items: string[]
  accentColor: string
}

function DashboardListCard({
  title,
  subtitle,
  items,
  accentColor,
}: DashboardListCardProps) {
  return (
    <article style={{ ...cardShellStyle, ...listCardStyle }}>
      <div style={listCardHeaderStyle}>
        <h4 style={cardTitleStyle}>{title}</h4>
        <p style={cardSubtitleStyle}>{subtitle}</p>
      </div>
      <div style={listScrollStyle}>
        <div style={listStyle}>
          {items.map((item, index) => (
            <div key={`${title}-${index}-${item}`} style={listItemStyle}>
              <span
                style={{
                  ...itemIndexStyle,
                  color: accentColor,
                  borderColor: accentColor,
                }}
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
type CoachingMetricDetailCardProps = {
  metric: CoachingMetricViewModel
  noteValue: string
  onNoteChange: (value: string) => void
  onBack: () => void
}

export default function CoachingMetricDetailCard({
  metric,
  noteValue,
  onNoteChange,
  onBack,
}: CoachingMetricDetailCardProps) {
  const theme = statusMeta[metric.performanceBand]
  const coachingPrompts = [
    `What does strong ${metric.title.toLowerCase()} performance look like here?`,
    'Where should I pause so the customer can add context?',
    'How will I confirm understanding before closing this step?',
  ]

  return (
    <section style={pageStyle}>
      <div style={topBarStyle}>
        <button type="button" onClick={onBack} style={backButtonStyle}>
          <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          Back to coaching cards
        </button>
        <span style={detailBadgeStyle}>Metric detail</span>
      </div>

      <div style={dashboardGridStyle}>
        <article style={{ ...cardShellStyle, ...overviewCardStyle }}>
          <div style={overviewHeaderStyle}>
            <span style={iconBadgeStyle} aria-hidden="true">
              <i className={metric.iconClassName} />
            </span>
            <div style={overviewTitleGroupStyle}>
              <h3 style={titleStyle}>{metric.title}</h3>
              <p style={subtitleStyle}>{metric.subtitle}</p>
            </div>
          </div>
          <article
            style={{
              ...heroPanelStyle,
              backgroundColor: theme.surfaceColor,
              borderColor: theme.borderColor,
            }}
          >
            <MetricComparisonChart
              youLabel={metric.youLabel}
              topLabel={metric.topLabel}
              youPercent={metric.chartYouPercent}
              topPercent={metric.chartTopPercent}
              accentColor={theme.accentColor}
              variant="compact"
            />
            <p style={descriptionStyle}>{metric.description}</p>
            <div style={heroTagsStyle}>
              <span
                style={{
                  ...statusChipStyle,
                  color: theme.accentColor,
                  borderColor: theme.borderColor,
                }}
              >
                {theme.label}
              </span>
              <span style={heroTagStyle}>Deep coaching view</span>
            </div>
          </article>
        </article>

        <DashboardListCard
          title="Why this matters"
          subtitle="Operational and customer impact"
          items={metric.whyItMatters}
          accentColor="var(--color-brand-marigold)"
        />
        <DashboardListCard
          title="How to improve"
          subtitle="Focused behaviors for next visits"
          items={metric.coachingTips}
          accentColor="var(--color-brand-navy)"
        />
        <DashboardListCard
          title="Coaching prompts"
          subtitle="In-visit prompts to use live"
          items={coachingPrompts}
          accentColor="var(--color-brand-cerulean)"
        />
        <article style={{ ...cardShellStyle, ...notesCardStyle }}>
          <h4 style={cardTitleStyle}>Improvement note</h4>
          <p style={cardSubtitleStyle}>Capture one commitment for the next visit.</p>
          <textarea
            value={noteValue}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder={metric.notePrompt}
            style={notesInputStyle}
            aria-label={`${metric.title} improvement note`}
          />
        </article>
      </div>
    </section>
  )
}

const pageStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}

const topBarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '8px',
}

const dashboardGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '10px',
}

const cardShellStyle: CSSProperties = {
  border: '1px solid rgba(36, 41, 101, 0.12)',
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  padding: '15px',
  display: 'flex',
  flexDirection: 'column',
  gap: '11px',
  boxShadow: '0 8px 18px rgba(36, 41, 101, 0.07)',
}

const backButtonStyle: CSSProperties = {
  border: '1px solid rgba(36, 41, 101, 0.14)',
  borderRadius: '999px',
  backgroundColor: '#ffffff',
  color: 'var(--color-brand-navy)',
  fontSize: '12px',
  fontWeight: 700,
  padding: '7px 11px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  boxShadow: '0 3px 9px rgba(36, 41, 101, 0.08)',
}

const detailBadgeStyle: CSSProperties = {
  border: '1px solid rgba(36, 41, 101, 0.14)',
  borderRadius: '999px',
  backgroundColor: '#ffffff',
  color: 'var(--color-text-muted)',
  fontSize: '11px',
  fontWeight: 700,
  padding: '5px 10px',
}

const overviewCardStyle: CSSProperties = {
  gridColumn: '1 / -1',
}

const heroPanelStyle: CSSProperties = {
  border: '1px solid rgba(36, 41, 101, 0.14)',
  borderRadius: '16px',
  padding: '15px',
  display: 'flex',
  flexDirection: 'column',
  gap: '13px',
}

const overviewHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
}

const iconBadgeStyle: CSSProperties = {
  width: '30px',
  height: '30px',
  borderRadius: '999px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-brand-sand)',
  border: '1px solid rgba(252, 181, 0, 0.35)',
  color: 'var(--color-brand-marigold)',
  flexShrink: 0,
}

const overviewTitleGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '22px',
  lineHeight: 1.15,
  color: 'var(--color-text)',
}

const subtitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '13px',
  color: 'var(--color-text-muted)',
}

const descriptionStyle: CSSProperties = {
  margin: 0,
  fontSize: '13px',
  lineHeight: 1.5,
  color: 'var(--color-text)',
}

const heroTagsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
}

const heroTagStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  backgroundColor: '#ffffff',
  color: 'var(--color-text-muted)',
  fontSize: '11px',
  fontWeight: 600,
  padding: '4px 10px',
}

const listCardStyle: CSSProperties = {
  gridColumn: 'span 1',
  minHeight: '194px',
}

const listCardHeaderStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}

const statusChipStyle: CSSProperties = {
  border: '1px solid rgba(36, 41, 101, 0.14)',
  borderRadius: '999px',
  padding: '6px 10px',
  fontSize: '11px',
  fontWeight: 700,
  backgroundColor: '#ffffff',
}

const listScrollStyle: CSSProperties = {
  maxHeight: '132px',
  overflowY: 'auto',
  paddingRight: '2px',
}

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '13px',
  color: 'var(--color-brand-navy)',
}

const cardSubtitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '11px',
  color: 'var(--color-text-muted)',
}

const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '7px',
}

const listItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  fontSize: '12px',
  lineHeight: 1.4,
  color: 'var(--color-text)',
  border: '1px solid rgba(36, 41, 101, 0.1)',
  borderRadius: '10px',
  backgroundColor: '#ffffff',
  padding: '9px 9px',
}

const itemIndexStyle: CSSProperties = {
  width: '18px',
  height: '18px',
  minWidth: '18px',
  borderRadius: '999px',
  border: '1px solid var(--color-border)',
  backgroundColor: '#ffffff',
  fontSize: '10px',
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '1px',
}

const notesCardStyle: CSSProperties = {
  gridColumn: 'span 1',
  minHeight: '180px',
}

const notesInputStyle: CSSProperties = {
  width: '100%',
  minHeight: '88px',
  resize: 'vertical',
  border: '1px solid rgba(36, 41, 101, 0.16)',
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  color: 'var(--color-text)',
  fontSize: '12px',
  lineHeight: 1.45,
  padding: '10px 12px',
  outline: 'none',
}
