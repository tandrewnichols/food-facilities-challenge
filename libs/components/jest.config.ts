import * as path from 'path';

const actualRoot = path.resolve(__dirname, '../..');

/* eslint-disable */
export default {
  displayName: 'components',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.js', 'jest-enzyme/lib/index.js'],
  transform: {
    '^.+\\.[tj]sx$': ['ts-jest', {
      babelConfig: `${ actualRoot }/babel.config.js`
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'html'],
  moduleNameMapper: {
    '@fortawesome/(.*)-svg-icons': 'identity-obj-proxy',
    '\\.(css|less|scss|sass|png|svg)$': 'identity-obj-proxy',
    '@sharedTypes/(.*)': `${ actualRoot }/libs/types/src/$1`,
    '@api/(.*)': `${ actualRoot }/libs/api/src/$1`,
    '@hooks/(.*)': `${ actualRoot }/libs/hooks/src/$1`,
  }
};
