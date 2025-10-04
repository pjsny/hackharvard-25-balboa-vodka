import { styled } from '../../styles/stitches.config';

export const DialogOverlay = styled('div', {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  position: 'fixed',
  inset: 0,
  zIndex: 50,
});

export const DialogContent = styled('div', {
  backgroundColor: '$white',
  borderRadius: '$lg',
  boxShadow: '$xl',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '32rem',
  maxHeight: '85vh',
  padding: '$6',
  zIndex: 50,
  
  '&:focus': {
    outline: 'none',
  },
});

export const DialogHeader = styled('div', {
  textAlign: 'center',
  paddingBottom: '$6',
});

export const DialogTitle = styled('h2', {
  fontSize: '$2xl',
  fontWeight: '$bold',
  color: '$gray900',
  margin: 0,
});

export const DialogDescription = styled('p', {
  color: '$gray600',
  fontSize: '$base',
  margin: 0,
});

export const DialogCloseButton = styled('button', {
  position: 'absolute',
  top: '$4',
  right: '$4',
  borderRadius: '$sm',
  opacity: 0.7,
  transition: 'opacity 0.2s',
  
  '&:hover': {
    opacity: 1,
  },
  
  '&:focus': {
    outline: 'none',
    boxShadow: '0 0 0 2px $blue500',
  },
});