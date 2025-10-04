import { styled } from '../../styles/stitches.config';
import { spin, pulse } from '../../styles/stitches.config';

export const IconContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$full',
  border: '2px solid $gray200',
  backgroundColor: '$white',
  
  variants: {
    size: {
      sm: {
        width: '$12',
        height: '$12',
      },
      md: {
        width: '$12',
        height: '$12',
      },
      lg: {
        width: '$16',
        height: '$16',
      },
    },
    status: {
      idle: {
        borderColor: '$gray200',
      },
      'user-speaking': {
        borderColor: '$green500',
        backgroundColor: '$green50',
      },
      'llm-thinking': {
        borderColor: '$orange500',
        backgroundColor: '$orange50',
      },
      'call-ended': {
        borderColor: '$red500',
        backgroundColor: '$red50',
      },
      success: {
        borderColor: '$green500',
        backgroundColor: '$green50',
      },
      error: {
        borderColor: '$red500',
        backgroundColor: '$red50',
      },
    },
  },
  
  defaultVariants: {
    size: 'md',
    status: 'idle',
  },
});

export const StatusIcon = styled('div', {
  variants: {
    color: {
      gray: {
        color: '$gray600',
      },
      green: {
        color: '$green600',
      },
      orange: {
        color: '$orange600',
      },
      red: {
        color: '$red600',
      },
      blue: {
        color: '$blue600',
      },
    },
    animated: {
      true: {
        animation: `${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
      },
    },
  },
  
  defaultVariants: {
    color: 'gray',
    animated: false,
  },
});

export const Spinner = styled('div', {
  width: '$4',
  height: '$4',
  border: '2px solid $gray300',
  borderTop: '2px solid $blue600',
  borderRadius: '$full',
  animation: `${spin} 1s linear infinite`,
});