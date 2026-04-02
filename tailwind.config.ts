import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-tangerine':  'var(--color-brand-tangerine)',
        'brand-marigold':   'var(--color-brand-marigold)',
        'brand-sand':       'var(--color-brand-sand)',
        'brand-navy':       'var(--color-brand-navy)',
        'brand-cerulean':   'var(--color-brand-cerulean)',
        'brand-frost':      'var(--color-brand-frost)',
        'neutral-graphite': 'var(--color-neutral-graphite)',
        'neutral-granite':  'var(--color-neutral-granite)',
        'neutral-alabaster':'var(--color-neutral-alabaster)',
        'support-negative': 'var(--color-support-negative)',
        'support-positive': 'var(--color-support-positive)',
        'support-warning':  'var(--color-support-warning)',
        'support-info':     'var(--color-support-info)',
        'color-bg':         'var(--color-bg)',
        'color-text':       'var(--color-text)',
        'color-text-muted': 'var(--color-text-muted)',
        'color-border':     'var(--color-border)',
        border:             'hsl(var(--border))',
        input:              'hsl(var(--input))',
        ring:               'hsl(var(--ring))',
        background:         'hsl(var(--background))',
        foreground:         'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}

export default config
