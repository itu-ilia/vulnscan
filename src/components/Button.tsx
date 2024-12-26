import React from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';

export interface ButtonProps extends AntButtonProps {
  children: React.ReactNode;
}

export function Button({ children, ...props }: ButtonProps) {
  return (
    <AntButton {...props}>
      {children}
    </AntButton>
  );
} 