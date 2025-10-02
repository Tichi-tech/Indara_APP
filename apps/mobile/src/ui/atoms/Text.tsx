import { Text, TextProps } from 'react-native';

type TWTextProps = TextProps & { className?: string };

export const H1 = ({ className = '', ...p }: TWTextProps) => (
  <Text {...p} className={`text-2xl font-bold text-slate-900 dark:text-slate-100 ${className}`} />
);

export const H2 = ({ className = '', ...p }: TWTextProps) => (
  <Text {...p} className={`text-xl font-semibold text-slate-900 dark:text-slate-100 ${className}`} />
);

export const H3 = ({ className = '', ...p }: TWTextProps) => (
  <Text {...p} className={`text-lg font-semibold text-slate-900 dark:text-slate-100 ${className}`} />
);

export const P = ({ className = '', ...p }: TWTextProps) => (
  <Text {...p} className={`text-base text-slate-700 dark:text-slate-300 ${className}`} />
);

export const Caption = ({ className = '', ...p }: TWTextProps) => (
  <Text {...p} className={`text-xs text-slate-500 dark:text-slate-400 ${className}`} />
);
