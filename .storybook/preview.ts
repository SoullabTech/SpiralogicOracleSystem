import '../app/styles/tokens.css'
import '../app/globals.css'
import type { Preview } from '@storybook/react'

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'dark',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'dark', title: 'Dark' },
        { value: 'light', title: 'Light' }
      ]
    }
  }
}

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme
      document.documentElement.classList.remove('theme-dark', 'theme-light')
      document.documentElement.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light')
      return Story()
    }
  ],
  parameters: {
    controls: { expanded: true },
    options: { storySort: { order: ['Foundation', 'Components'] } },
    backgrounds: {
      default: 'Spiralogic',
      values: [{ name: 'Spiralogic', value: '#0A0B0E' }]
    }
  }
}

export default preview