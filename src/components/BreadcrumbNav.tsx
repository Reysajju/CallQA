import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  items: {
    label: string;
    href: string;
  }[];
}

export function BreadcrumbNav({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-500" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, index) => (
          <li key={item.href} 
              itemProp="itemListElement" 
              itemScope 
              itemType="https://schema.org/ListItem"
              className="flex items-center">
            <a href={item.href} 
               itemProp="item" 
               className={`hover:text-blue-600 ${index === items.length - 1 ? 'text-gray-900 font-medium' : ''}`}>
              <span itemProp="name">{item.label}</span>
            </a>
            <meta itemProp="position" content={String(index + 1)} />
            {index < items.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}