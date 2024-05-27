import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import next from '@next/eslint-plugin-next'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.all,
  { languageOptions: { parserOptions: { project: true } } },
  { files: ['**/*.js'], ...tseslint.configs.disableTypeChecked },
  { plugins: { next } }, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  { ignores: ['.next/*'] },
  {
    rules: {
      "@typescript-eslint/naming-convention": ["off"],
      "@typescript-eslint/no-magic-numbers": ["off"],
      "@typescript-eslint/prefer-readonly-parameter-types": ["off"],
    }
  }
);
