import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    config.optimizeDeps ??= {};
    config.optimizeDeps.include ??= [];

    config.optimizeDeps.include.push(
      '@react-three/drei',
      'three',
      'three-stdlib'
    );

    return config;
  },
};

export default config;
