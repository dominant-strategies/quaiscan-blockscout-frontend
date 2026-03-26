import type React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: JSX.Element | (() => JSX.Element);
}

export default function Web3ModalProvider({ children }: Props) {
  return children;
}
