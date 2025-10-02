import { Text as RNText, TextProps } from 'react-native';

export const H1 = (props: TextProps) => (
  <RNText className="text-3xl font-bold text-text" {...props} />
);

export const H2 = (props: TextProps) => (
  <RNText className="text-2xl font-semibold text-text" {...props} />
);

export const H3 = (props: TextProps) => (
  <RNText className="text-xl font-semibold text-text" {...props} />
);

export const P = (props: TextProps) => (
  <RNText className="text-base text-text" {...props} />
);

export const Caption = (props: TextProps) => (
  <RNText className="text-sm text-text-muted" {...props} />
);
