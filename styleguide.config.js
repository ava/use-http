module.exports = {
  components: 'src/**/*.{ts,tsx}',
  ignore: [
    'src/setupTests.ts',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.d.ts'
  ],
  resolver: require('react-docgen').resolver.findAllComponentDefinitions,
  propsParser: require('react-docgen-typescript').withDefaultConfig({ propFilter: { skipPropsWithoutDoc: true } }).parse
}
