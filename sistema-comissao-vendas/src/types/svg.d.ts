declare module '*.svg?react' {
  import * as React from 'react';

  const component: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { 
    title?: string; 
    alt?: string; 
  }>;
  
  export default component;
}