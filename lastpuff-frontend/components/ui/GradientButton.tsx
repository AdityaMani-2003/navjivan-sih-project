import React from 'react';
import Button, { ButtonProps } from './Button';

export interface GradientButtonProps extends Omit<ButtonProps, 'variant'> {
  colors?: readonly [string, string, ...string[]] | string[];
  variant?: ButtonProps['variant'];
}

/**
 * GradientButton is DEPRECATED per design system absolute bans.
 * Gracefully accepts legacy `colors` prop and renders solid Button.
 */
export const GradientButton: React.FC<GradientButtonProps> = ({
  colors,
  variant = 'primary',
  ...rest
}) => {
  return <Button variant={variant} {...rest} />;
};

export default GradientButton;
