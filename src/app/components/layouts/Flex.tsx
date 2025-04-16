import { ReactNode } from 'react';
import { directions, alignments, justifyContent, gapSizes } from './constants';

interface FlexProps {
  children: ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
  grow?: boolean;
  shrink?: boolean;
}

export function Flex({
  children,
  className = '',
  direction = 'row',
  align = 'start',
  justify = 'start',
  gap = 'md',
  wrap = false,
  grow = false,
  shrink = false,
}: FlexProps) {
  return (
    <div
      className={`
        flex
        ${directions[direction]}
        ${alignments[align]}
        ${justifyContent[justify]}
        ${gapSizes[gap]}
        ${wrap ? 'flex-wrap' : 'flex-nowrap'}
        ${grow ? 'flex-grow' : ''}
        ${shrink ? 'flex-shrink' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function VStack({
  children,
  className = '',
  align = 'stretch',
  justify = 'start',
  gap = 'md',
}: Omit<FlexProps, 'direction' | 'wrap'>) {
  return (
    <Flex
      direction="col"
      align={align}
      justify={justify}
      gap={gap}
      className={className}
    >
      {children}
    </Flex>
  );
}

export function HStack({
  children,
  className = '',
  align = 'center',
  justify = 'start',
  gap = 'md',
}: Omit<FlexProps, 'direction' | 'wrap'>) {
  return (
    <Flex
      direction="row"
      align={align}
      justify={justify}
      gap={gap}
      className={className}
    >
      {children}
    </Flex>
  );
}

export function Center({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Flex
      align="center"
      justify="center"
      className={className}
    >
      {children}
    </Flex>
  );
} 