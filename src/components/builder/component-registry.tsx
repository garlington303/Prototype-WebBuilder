import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ComponentType } from '@/store/builder-store';
// This registry maps internal types to actual React components
// It handles the rendering logic for each type
interface ComponentRendererProps {
  type: ComponentType;
  props: any;
  children?: React.ReactNode;
}
export const ComponentRegistry: React.FC<ComponentRendererProps> = ({ type, props, children }) => {
  const { className, fontSize, ...rest } = props;
  const hasChildren = React.Children.count(children) > 0;
  
  // Create style object with fontSize if present
  const textStyle = fontSize ? { fontSize: `${fontSize}px` } : undefined;
  
  switch (type) {
    case 'container':
      return (
        <div className={cn('flex w-full h-full transition-all', className)} {...rest}>
          {children}
        </div>
      );
    case 'button':
      return (
        <Button className={cn('w-full h-full', className)} style={textStyle} {...rest}>
          {props.children || 'Button'}
        </Button>
      );
    case 'card':
      return (
        <Card className={cn('h-full', className)} style={textStyle} {...rest}>
          <CardHeader>
            {props.title && <CardTitle>{props.title}</CardTitle>}
            {props.description && <CardDescription>{props.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            {hasChildren ? children : (props.content || 'Card content area')}
          </CardContent>
          {props.footer && (
            <CardFooter>
              {props.footer}
            </CardFooter>
          )}
        </Card>
      );
    case 'header': {
      const Level = (props.level || 'h2') as keyof JSX.IntrinsicElements;
      return (
        <Level 
          className={cn('scroll-m-20 tracking-tight w-full h-full flex items-center', className)} 
          style={textStyle}
          {...rest}
        >
          {props.children || 'Header'}
        </Level>
      );
    }
    case 'text':
      return (
        <p className={cn('leading-7 w-full h-full', className)} style={textStyle} {...rest}>
          {props.children || 'Text content'}
        </p>
      );
    case 'input':
      return (
        <div className={cn('grid w-full items-center gap-1.5', className)}>
          {props.label && <Label htmlFor={rest.id} style={textStyle}>{props.label}</Label>}
          <Input type={props.type || 'text'} placeholder={props.placeholder} style={textStyle} {...rest} />
        </div>
      );
    default:
      return <div className="p-2 text-red-500">Unknown component: {type}</div>;
  }
};