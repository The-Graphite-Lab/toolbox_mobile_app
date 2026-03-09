'use client'

import type { CSSProperties } from 'react'

type MetricComparisonChartProps = {
  youLabel: string
  topLabel: string
  youPercent: number
  topPercent: number
  accentColor: string
  variant?: 'hero' | 'compact'
}

const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.min(100, value))
}

type ComparisonBarProps = {
  label: string
  valueLabel: string
  valuePercent: number
  color: string
  isHero: boolean
}

function ComparisonBar({
  label,
  valueLabel,
  valuePercent,
  color,
  isHero,
}: ComparisonBarProps) {
  const normalized = clampPercent(valuePercent)

  return (
    <div style={barRowStyle}>
      <div style={barHeaderStyle}>
        <div style={barLabelWrapStyle}>
          <span
            style={{
              ...barDotStyle,
              backgroundColor: color,
            }}
            aria-hidden="true"
          />
          <span
            style={{
              ...barLabelStyle,
              fontSize: isHero ? '13px' : barLabelStyle.fontSize,
            }}
          >
            {label}
          </span>
        </div>
        <span
          style={{
            ...barValueStyle,
            fontSize: isHero ? '13px' : barValueStyle.fontSize,
          }}
        >
          {valueLabel}
        </span>
      </div>

      <div
        style={{
          ...trackStyle,
          height: isHero ? '14px' : trackStyle.height,
        }}
      >
        {[25, 50, 75].map((mark) => (
          <span
            key={mark}
            style={{
              ...gridMarkStyle,
              left: `${mark}%`,
            }}
            aria-hidden="true"
          />
        ))}
        <div
          style={{
            ...fillStyle,
            width: `${Math.max(6, normalized)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

export default function MetricComparisonChart({
  youLabel,
  topLabel,
  youPercent,
  topPercent,
  accentColor,
  variant = 'compact',
}: MetricComparisonChartProps) {
  const isHero = variant === 'hero'
  const normalizedYou = clampPercent(youPercent)
  const normalizedTop = clampPercent(topPercent)
  const absoluteGap = Math.abs(normalizedYou - normalizedTop).toFixed(0)

  return (
    <div
      style={{
        ...chartShellStyle,
        gap: isHero ? '12px' : chartShellStyle.gap,
      }}
      aria-label="Metric comparison chart"
    >
      <div
        style={{
          ...scorePillsRowStyle,
          marginBottom: isHero ? '-2px' : scorePillsRowStyle.marginBottom,
        }}
      >
        <div
          style={{
            ...scorePillStyle,
            borderColor: `${accentColor}66`,
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
          }}
        >
          <span style={scorePillLabelStyle}>You</span>
          <span style={scorePillValueStyle}>{youLabel}</span>
        </div>
        <div style={scorePillStyle}>
          <span style={scorePillLabelStyle}>Top</span>
          <span style={scorePillValueStyle}>{topLabel}</span>
        </div>
      </div>

      <div
        style={{
          ...axisHeaderStyle,
          fontSize: isHero ? '11px' : axisHeaderStyle.fontSize,
          paddingInline: isHero ? '72px 4px' : axisHeaderStyle.paddingInline,
        }}
      >
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>

      <div
        style={{
          ...chartFrameStyle,
          padding: isHero ? '14px' : chartFrameStyle.padding,
          gap: isHero ? '14px' : chartFrameStyle.gap,
        }}
      >
        <ComparisonBar
          label="You"
          valueLabel={youLabel}
          valuePercent={normalizedYou}
          color={accentColor}
          isHero={isHero}
        />
        <ComparisonBar
          label="Top performer"
          valueLabel={topLabel}
          valuePercent={normalizedTop}
          color="var(--color-brand-cerulean)"
          isHero={isHero}
        />
      </div>

      <div
        style={{
          ...gapTextStyle,
          fontSize: isHero ? '12px' : gapTextStyle.fontSize,
        }}
      >
        Difference: {absoluteGap} pts
      </div>
    </div>
  )
}

const chartShellStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
}

const axisHeaderStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  fontSize: '10px',
  fontWeight: 600,
  color: 'rgba(58, 59, 56, 0.68)',
  paddingInline: '64px 2px',
}

const chartFrameStyle: CSSProperties = {
  border: '1px solid rgba(225, 225, 225, 0.92)',
  borderRadius: '14px',
  backgroundColor: 'rgba(255, 255, 255, 0.88)',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}

const scorePillsRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  marginBottom: '-1px',
}

const scorePillStyle: CSSProperties = {
  border: '1px solid rgba(36, 41, 101, 0.16)',
  borderRadius: '10px',
  backgroundColor: '#ffffff',
  padding: '6px 9px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '7px',
}

const scorePillLabelStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--color-text-muted)',
}

const scorePillValueStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--color-brand-navy)',
}

const barRowStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
}

const barHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '8px',
}

const barLabelWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
}

const barDotStyle: CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '999px',
}

const barLabelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text)',
}

const barValueStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--color-brand-navy)',
}

const trackStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '12px',
  borderRadius: '999px',
  backgroundColor: 'rgba(130, 190, 232, 0.32)',
  overflow: 'hidden',
}

const gridMarkStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '1px',
  backgroundColor: 'rgba(58, 59, 56, 0.16)',
  transform: 'translateX(-0.5px)',
}

const fillStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  height: '100%',
  borderRadius: '999px',
}

const gapTextStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--color-brand-navy)',
  textAlign: 'right',
}
