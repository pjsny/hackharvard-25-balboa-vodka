import { styled } from '../../styles/stitches.config';

export const Button = styled('button', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$lg',
  fontSize: '$base',
  fontWeight: '$medium',
  transition: 'all 0.2s',
  cursor: 'pointer',
  border: 'none',
  
  variants: {
    variant: {
      primary: {
        backgroundColor: '$blue600',
        color: '$white',
        
        '&:hover': {
          backgroundColor: '$blue700',
        },
        
        '&:focus': {
          outline: 'none',
          boxShadow: '0 0 0 2px $blue500',
        },
        
        '&:disabled': {
          opacity: 0.5,
          cursor: 'not-allowed',
        },
      },
      secondary: {
        backgroundColor: '$white',
        color: '$gray900',
        border: '1px solid $gray300',
        
        '&:hover': {
          backgroundColor: '$gray50',
        },
        
        '&:focus': {
          outline: 'none',
          boxShadow: '0 0 0 2px $blue500',
        },
        
        '&:disabled': {
          opacity: 0.5,
          cursor: 'not-allowed',
        },
      },
      success: {
        backgroundColor: '$green600',
        color: '$white',
        
        '&:hover': {
          backgroundColor: '$green700',
        },
        
        '&:focus': {
          outline: 'none',
          boxShadow: '0 0 0 2px $green500',
        },
      },
    },
    size: {
      sm: {
        padding: '$2 $3',
        fontSize: '$sm',
      },
      md: {
        padding: '$3 $6',
        fontSize: '$base',
      },
      lg: {
        padding: '$4 $8',
        fontSize: '$lg',
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  },
  
  defaultVariants: {
    variant: 'secondary',
    size: 'md',
  },
});