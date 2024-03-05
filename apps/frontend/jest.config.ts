import * as path from 'path';

const actualRoot = path.resolve(__dirname, '../..');

/* eslint-disable */
export default {
  displayName: 'frontend',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.js', 'jest-enzyme/lib/index.js'],
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '@fortawesome/(.*)-svg-icons': 'identity-obj-proxy',
    '\\.(css|less|scss|sass|png|svg)$': 'identity-obj-proxy',
    '@sharedTypes/(.*)': `${ actualRoot }/libs/types/src/$1`,
    '@api/(.*)': `${ actualRoot }/libs/api/src/$1`,
    '@hooks/(.*)': `${ actualRoot }/libs/hooks/src/$1`,
    '@components/(.*)': `${ actualRoot }/libs/components/src/$1`,
  }
};
