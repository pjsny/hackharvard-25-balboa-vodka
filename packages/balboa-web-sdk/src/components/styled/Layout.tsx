import { styled } from '../../styles/stitches.config';

export const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
});

export const FlexRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$6',
});

export const FlexCol = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  flex: 1,
});

export const StepContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  flex: 1,
});

export const StepTitle = styled('h3', {
  fontSize: '$base',
  fontWeight: '$semibold',
  color: '$gray900',
  marginBottom: '$2',
  margin: 0,
});

export const StepList = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
  fontSize: '$sm',
  color: '$gray600',
});

export const StepItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
});

export const StatusDot = styled('div', {
  width: '$1',
  height: '$1',
  borderRadius: '$full',
  
  variants: {
    status: {
      active: {
        backgroundColor: '$green500',
      },
      inactive: {
        backgroundColor: '$gray300',
      },
    },
  },
  
  defaultVariants: {
    status: 'active',
  },
});

export const Divider = styled('div', {
  width: '$8',
  height: '1px',
  backgroundColor: '$gray200',
  position: 'relative',
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-4px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '$2',
    height: '$2',
    backgroundColor: '$gray200',
    borderRadius: '$full',
  },
});

export const StatusSection = styled('div', {
  textAlign: 'center',
});

export const StatusTitle = styled('h3', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: '$gray900',
  marginBottom: '$2',
  margin: 0,
});

export const StatusDescription = styled('p', {
  color: '$gray600',
  margin: 0,
});

export const ButtonGroup = styled('div', {
  display: 'flex',
  gap: '$3',
});

export const Footer = styled('div', {
  textAlign: 'center',
  fontSize: '$sm',
  color: '$gray500',
  
  '& p': {
    margin: 0,
    
    '&:not(:last-child)': {
      marginBottom: '$1',
    },
  },
});