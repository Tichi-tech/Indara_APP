import { Text as RNText, TextProps } from 'react-native';

export const H1 = (p: TextProps) => <RNText className="text-2xl font-bold text-slate-900 dark:text-slate-100" {...p} />;
export const H2 = (p: TextProps) => <RNText className="text-xl font-semibold text-slate-900 dark:text-slate-100" {...p} />;
export const H3 = (p: TextProps) => <RNText className="text-lg font-semibold text-slate-900 dark:text-slate-100" {...p} />;
export const P  = (p: TextProps) => <RNText className="text-base text-slate-700 dark:text-slate-300" {...p} />;
export const Caption = (p: TextProps) => <RNText className="text-xs text-slate-500 dark:text-slate-400" {...p} />;
