tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#091426',
        'primary-container': '#1e293b',
        secondary: '#0058be',
        'secondary-container': '#2170e4',
        surface: '#faf8ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f3ff',
        'surface-container': '#eaedff',
        'surface-container-high': '#e2e7ff',
        'surface-container-highest': '#dae2fd',
        'surface-variant': '#dae2fd',
        'secondary-fixed': '#d8e2ff',
        'secondary-fixed-dim': '#adc6ff',
        'on-primary': '#ffffff',
        'on-secondary': '#ffffff',
        'on-secondary-fixed': '#001a42',
        'on-surface': '#131b2e',
        'on-surface-variant': '#45474c',
        outline: '#75777d',
        'outline-variant': '#c5c6cd',
        error: '#ba1a1a',
        'error-container': '#ffdad6'
      },
      borderRadius: { DEFAULT: '0.125rem', lg: '0.25rem', xl: '0.5rem', full: '0.75rem' },
      fontFamily: { headline: ['Manrope'], body: ['Public Sans'], label: ['Public Sans'], code: ['Public Sans'] },
      fontSize: {
        'label-sm': ['0.6875rem', { lineHeight: '1rem' }],
        'label-md': ['0.8125rem', { lineHeight: '1.125rem' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.25rem' }],
        'body-md': ['0.9375rem', { lineHeight: '1.5rem' }],
        'headline-sm': ['1.125rem', { lineHeight: '1.625rem' }],
        'headline-md': ['1.5rem', { lineHeight: '2rem' }],
        'title-md': ['1rem', { lineHeight: '1.5rem' }]
      }
    }
  }
};
