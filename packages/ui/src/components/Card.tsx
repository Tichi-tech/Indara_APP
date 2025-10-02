import { View, ViewProps } from 'react-native';

type CardProps = ViewProps & {
  variant?: 'default' | 'elevated';
  className?: string;
};

export const Card = ({ variant = 'default', className = '', ...props }: CardProps) => {
  const variants = {
    default: 'bg-white rounded-2xl p-4',
    elevated: 'bg-white rounded-2xl p-4 shadow-lg',
  } as const;

  return <View className={`${variants[variant]} ${className}`} {...props} />;
};
