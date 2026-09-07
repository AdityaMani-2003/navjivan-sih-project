import React from 'react';
import Card, { CardProps } from './Card';

/**
 * GlassCard is DEPRECATED per design system absolute bans.
 * Rerouted directly to solid elevated Card (no glass, no blur).
 */
export const GlassCard: React.FC<CardProps> = (props) => {
  return <Card {...props} />;
};

export default GlassCard;
