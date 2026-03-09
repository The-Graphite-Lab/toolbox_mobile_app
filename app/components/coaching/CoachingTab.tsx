'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import CoachingMetricDetailCard, {
  type CoachingMetricViewModel,
  type CoachingPerformanceBand,
} from './CoachingMetricDetailCard'
import MetricComparisonChart from './MetricComparisonChart'

type CoachingTabProps = {
  topContentInset?: string
}

const performanceTheme: Record<
  CoachingPerformanceBand,
  { accentColor: string; surfaceColor: string; borderColor: string; label: string }
> = {
  good: {
    accentColor: 'var(--color-support-positive)',
    surfaceColor: 'rgba(49, 154, 73, 0.28)',
    borderColor: 'rgba(49, 154, 73, 0.44)',
    label: 'On Track',
  },
  warning: {
    accentColor: 'var(--color-support-warning-orange)',
    surfaceColor: 'rgba(254, 196, 42, 0.36)',
    borderColor: 'rgba(218, 110, 39, 0.4)',
    label: 'Needs Focus',
  },
  risk: {
    accentColor: 'var(--color-support-negative)',
    surfaceColor: 'rgba(203, 45, 45, 0.28)',
    borderColor: 'rgba(203, 45, 45, 0.42)',
    label: 'Off Track',
  },
}

const coachingMetrics: CoachingMetricViewModel[] = [
  {
    id: 'talk-ratio',
    title: 'Talk Ratio',
    subtitle: 'How much of the conversation you lead',
    iconClassName: 'fa-solid fa-comments',
    youLabel: '58%',
    topLabel: '45%',
    chartYouPercent: 58,
    chartTopPercent: 45,
    performanceBand: 'warning',
    description:
      'Talk ratio compares how much you speak against how much the customer speaks. Strong coaching keeps this balanced so customer context is not missed.',
    whyItMatters: [
      'Better balance usually means better diagnosis quality.',
      'Customers feel heard, which improves trust during recommendations.',
      'Too much talk time can hide key symptoms that drive repeat visits.',
    ],
    coachingTips: [
      'Open with two customer-first questions before giving direction.',
      'Pause three seconds after each answer for extra details.',
      'Summarize in short chunks instead of long explanations.',
    ],
    notePrompt: 'Example: Ask two extra open-ended questions before recommending next steps.',
  },
  {
    id: 'longest-monologue',
    title: 'Longest Monologue',
    subtitle: 'Longest period you speak without pause',
    iconClassName: 'fa-solid fa-stopwatch',
    youLabel: '1m 56s',
    topLabel: '1m 12s',
    chartYouPercent: 83,
    chartTopPercent: 51,
    performanceBand: 'risk',
    description:
      'Longest monologue highlights the longest uninterrupted stretch where only you are talking. Shorter stretches usually improve clarity and engagement.',
    whyItMatters: [
      'Long one-way explanations lower customer retention of key points.',
      'Frequent pauses uncover objections earlier.',
      'Shorter segments reduce confusion and callbacks.',
    ],
    coachingTips: [
      'Break explanations into 20-30 second segments.',
      'Ask for confirmation after each major point.',
      'Replace long technical blocks with one plain-language sentence.',
    ],
    notePrompt: 'Example: Keep every explanation under 30 seconds before checking in.',
  },
  {
    id: 'customer-airtime',
    title: 'Customer Airtime',
    subtitle: 'How much the customer contributes',
    iconClassName: 'fa-solid fa-user-group',
    youLabel: '42%',
    topLabel: '55%',
    chartYouPercent: 42,
    chartTopPercent: 55,
    performanceBand: 'warning',
    description:
      'Customer airtime shows how much of the conversation is customer-led. More customer contribution usually provides higher-quality troubleshooting details.',
    whyItMatters: [
      'Higher customer input reduces assumptions during diagnosis.',
      'More context supports stronger first-time fix decisions.',
      'Customers are more confident when they feel listened to.',
    ],
    coachingTips: [
      'Start visits with: "Walk me through what happened first."',
      'Use one follow-up question before offering solutions.',
      'Reflect back one key phrase from the customer before moving on.',
    ],
    notePrompt: 'Example: Begin with a full customer timeline before troubleshooting.',
  },
  {
    id: 'clarifying-questions',
    title: 'Clarifying Questions',
    subtitle: 'Average questions asked per visit',
    iconClassName: 'fa-solid fa-circle-question',
    youLabel: '7.2',
    topLabel: '10.8',
    chartYouPercent: 61,
    chartTopPercent: 91,
    performanceBand: 'risk',
    description:
      'Clarifying questions measure how consistently you validate details before action. More focused questions usually increase decision quality.',
    whyItMatters: [
      'Stronger questioning reduces misdiagnosis.',
      'Fewer assumptions lowers unnecessary part swaps.',
      'Customers view precision as professionalism.',
    ],
    coachingTips: [
      'Use a three-check sequence: when, where, and what changed.',
      'Confirm one symptom in customer language before repair.',
      'Ask what success looks like before you close the visit.',
    ],
    notePrompt: 'Example: Use the same three clarifying checks on every visit.',
  },
  {
    id: 'first-time-fix-rate',
    title: 'First-Time Fix Rate',
    subtitle: 'Jobs resolved without repeat visits',
    iconClassName: 'fa-solid fa-wrench',
    youLabel: '81%',
    topLabel: '92%',
    chartYouPercent: 81,
    chartTopPercent: 92,
    performanceBand: 'warning',
    description:
      'First-time fix rate tracks how often issues are fully resolved in one visit. This is one of the strongest indicators of service effectiveness.',
    whyItMatters: [
      'Higher first-time fixes reduce truck rolls and cost.',
      'Customers experience less disruption and downtime.',
      'Schedules stay healthier when revisits drop.',
    ],
    coachingTips: [
      'Run a short final validation checklist before closing work.',
      'Confirm root cause and expected behavior with the customer.',
      'Document any unresolved risk before departure.',
    ],
    notePrompt: 'Example: Complete final validation checklist before every closeout.',
  },
  {
    id: 'policy-accuracy',
    title: 'Policy Accuracy',
    subtitle: 'Safety and process steps captured correctly',
    iconClassName: 'fa-solid fa-shield',
    youLabel: '96%',
    topLabel: '95%',
    chartYouPercent: 96,
    chartTopPercent: 95,
    performanceBand: 'good',
    description:
      'Policy accuracy reflects whether required safety and process standards are followed and documented correctly.',
    whyItMatters: [
      'Consistent policy execution lowers operational risk.',
      'Accurate documentation protects warranty and compliance outcomes.',
      'Reliable process habits improve team-level service quality.',
    ],
    coachingTips: [
      'Keep a 30-second policy check before closeout.',
      'Document exceptions in real time, not after the visit.',
      'Use consistent wording for required policy steps.',
    ],
    notePrompt: 'Example: Keep notes in policy template format for every visit.',
  },
]

export default function CoachingTab({
  topContentInset = '14px',
}: CoachingTabProps) {
  const [activeMetricId, setActiveMetricId] = useState(coachingMetrics[0].id)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [notesByMetricId, setNotesByMetricId] = useState<Record<string, string>>({})

  const activeMetric = useMemo(
    () =>
      coachingMetrics.find((metric) => metric.id === activeMetricId) ||
      coachingMetrics[0],
    [activeMetricId]
  )
  const activeTheme = performanceTheme[activeMetric.performanceBand]
  const activeNote = notesByMetricId[activeMetric.id] || ''
  const summaryDescription = getPrimarySentence(activeMetric.description)

  const updateNote = (value: string) => {
    setNotesByMetricId((current) => ({
      ...current,
      [activeMetric.id]: value,
    }))
  }

  return (
    <section style={containerStyle} aria-label="Coaching insights">
      <div
        style={{
          ...insetWrapStyle,
          paddingTop: topContentInset,
        }}
      >
        <div style={sheetStyle}>
          <div style={sheetHandleStyle} aria-hidden="true" />
          <div style={sheetHeaderStyle}>
            <div style={headingGroupStyle}>
              <h2 style={headingStyle}>Coaching</h2>
              <p style={headingSubStyle}>
                Select a metric tab to review coaching.
              </p>
            </div>
            <span style={sampleBadgeStyle}>Sample Data</span>
          </div>

          <div style={tabsRailStyle} role="tablist" aria-label="Coaching metrics">
            {coachingMetrics.map((metric) => {
              const isActive = metric.id === activeMetric.id
              return (
                <button
                  key={metric.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveMetricId(metric.id)
                    setIsDetailOpen(false)
                  }}
                  style={{
                    ...tabButtonStyle,
                    ...(isActive ? activeTabButtonStyle : inactiveTabButtonStyle),
                  }}
                >
                  {metric.title}
                </button>
              )
            })}
          </div>

          <div
            style={{
              ...sheetBodyStyle,
              ...(isDetailOpen ? detailBodyStyle : summaryBodyStyle),
            }}
          >
            {isDetailOpen ? (
              <CoachingMetricDetailCard
                metric={activeMetric}
                noteValue={activeNote}
                onNoteChange={updateNote}
                onBack={() => setIsDetailOpen(false)}
              />
            ) : (
              <article
                style={{
                  ...mainMetricCardStyle,
                  backgroundColor: activeTheme.surfaceColor,
                  borderColor: activeTheme.borderColor,
                }}
              >
                <div style={mainMetricTopRowStyle}>
                  <div style={mainMetricTitleGroupStyle}>
                    <h3 style={mainMetricTitleStyle}>{activeMetric.title}</h3>
                    <p style={mainMetricSubtitleStyle}>{activeMetric.subtitle}</p>
                  </div>
                  <span
                    style={{
                      ...mainMetricStatusStyle,
                      color: activeTheme.accentColor,
                      borderColor: activeTheme.borderColor,
                    }}
                  >
                    {activeTheme.label}
                  </span>
                </div>

                <MetricComparisonChart
                  youLabel={activeMetric.youLabel}
                  topLabel={activeMetric.topLabel}
                  youPercent={activeMetric.chartYouPercent}
                  topPercent={activeMetric.chartTopPercent}
                  accentColor={activeTheme.accentColor}
                  variant="hero"
                />

                <p style={mainMetricDescriptionStyle}>{summaryDescription}</p>

                <div style={quickInputCardStyle}>
                  <div style={quickInputLabelStyle}>Next-step focus</div>
                  <input
                    value={activeNote}
                    onChange={(event) => updateNote(event.target.value)}
                    placeholder={activeMetric.notePrompt}
                    style={quickInputStyle}
                    aria-label={`${activeMetric.title} improvement note`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsDetailOpen(true)}
                  style={openDetailButtonStyle}
                >
                  Open detailed coaching
                  <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                </button>
              </article>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const getPrimarySentence = (text: string) => {
  const trimmed = text.trim()
  if (trimmed.length === 0) {
    return ''
  }

  const periodIndex = trimmed.indexOf('.')
  if (periodIndex === -1) {
    return trimmed
  }

  return trimmed.slice(0, periodIndex + 1)
}

const containerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: 0,
}

const insetWrapStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: 0,
  display: 'flex',
  alignItems: 'flex-end',
  paddingBottom: '0',
}

const sheetStyle: CSSProperties = {
  width: '100%',
  minHeight: '82%',
  maxHeight: '100%',
  backgroundColor: '#ffffff',
  borderTop: '1px solid rgba(36, 41, 101, 0.12)',
  borderLeft: '1px solid rgba(36, 41, 101, 0.08)',
  borderRight: '1px solid rgba(36, 41, 101, 0.08)',
  borderRadius: '24px 24px 0 0',
  boxShadow: '0 -16px 34px rgba(36, 41, 101, 0.14)',
  padding: '10px 14px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  overflow: 'hidden',
}

const sheetHandleStyle: CSSProperties = {
  width: '38px',
  height: '4px',
  borderRadius: '999px',
  backgroundColor: 'rgba(58, 59, 56, 0.22)',
  alignSelf: 'center',
}

const sheetHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '10px',
}

const headingGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}

const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: '20px',
  color: 'var(--color-text)',
}

const headingSubStyle: CSSProperties = {
  margin: 0,
  fontSize: '11px',
  color: 'var(--color-text-muted)',
}

const sampleBadgeStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  padding: '4px 9px',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  backgroundColor: '#ffffff',
  flexShrink: 0,
}

const tabsRailStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  overflowX: 'auto',
  border: '1px solid rgba(36, 41, 101, 0.12)',
  borderRadius: '14px',
  padding: '4px 5px',
  backgroundColor: 'rgba(36, 41, 101, 0.13)',
  scrollbarWidth: 'none',
}

const tabButtonStyle: CSSProperties = {
  appearance: 'none',
  WebkitAppearance: 'none',
  WebkitTapHighlightColor: 'transparent',
  outline: 'none',
  border: '1px solid transparent',
  borderRadius: '10px',
  backgroundColor: 'transparent',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: 0.12,
  padding: '8px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  minHeight: '34px',
  boxShadow: 'none',
  borderColor: 'transparent',
  transition: 'background-color 160ms ease-out, color 160ms ease-out, border-color 160ms ease-out, box-shadow 180ms ease-out',
}

const activeTabButtonStyle: CSSProperties = {
  color: 'var(--color-brand-navy)',
  backgroundColor: '#ffffff',
  borderColor: 'rgba(36, 41, 101, 0.2)',
  boxShadow: '0 2px 10px rgba(36, 41, 101, 0.12)',
}

const inactiveTabButtonStyle: CSSProperties = {
  color: 'var(--color-text-muted)',
  backgroundColor: 'transparent',
  borderColor: 'transparent',
  boxShadow: 'none',
}

const sheetBodyStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
}

const summaryBodyStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  minHeight: 0,
}

const detailBodyStyle: CSSProperties = {
  overflowY: 'auto',
  paddingRight: '2px',
}

const mainMetricCardStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  border: '1px solid rgba(36, 41, 101, 0.14)',
  borderRadius: '20px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  boxShadow: '0 10px 24px rgba(36, 41, 101, 0.08)',
  height: '100%',
  minHeight: '100%',
  justifyContent: 'space-between',
}

const mainMetricTopRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '10px',
}

const mainMetricTitleGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}

const mainMetricTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '21px',
  color: 'var(--color-text)',
}

const mainMetricSubtitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '13px',
  color: 'var(--color-text-muted)',
}

const mainMetricStatusStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  backgroundColor: '#ffffff',
  fontSize: '11px',
  fontWeight: 700,
  padding: '6px 10px',
  whiteSpace: 'nowrap',
}

const mainMetricDescriptionStyle: CSSProperties = {
  margin: 0,
  fontSize: '13px',
  lineHeight: 1.45,
  color: 'var(--color-text)',
  fontWeight: 500,
}

const quickInputCardStyle: CSSProperties = {
  border: '1px solid rgba(36, 41, 101, 0.14)',
  borderRadius: '14px',
  backgroundColor: 'rgba(255, 255, 255, 0.78)',
  padding: '11px',
  display: 'flex',
  flexDirection: 'column',
  gap: '7px',
}

const quickInputLabelStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: 0.25,
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
}

const quickInputStyle: CSSProperties = {
  border: '1px solid rgba(36, 41, 101, 0.18)',
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  color: 'var(--color-text)',
  fontSize: '12px',
  padding: '10px 11px',
  width: '100%',
  outline: 'none',
}

const openDetailButtonStyle: CSSProperties = {
  border: '1px solid rgba(36, 41, 101, 0.18)',
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  color: 'var(--color-brand-navy)',
  fontSize: '13px',
  fontWeight: 700,
  padding: '11px 12px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  boxShadow: '0 4px 12px rgba(36, 41, 101, 0.09)',
  transition: 'transform 150ms ease-out, box-shadow 160ms ease-out',
}
