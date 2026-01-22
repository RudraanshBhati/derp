// Mock Component for non-implemented pages
import React from 'react';

export default function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card/50">
      <h2 className="text-2xl font-bold text-muted-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">This module is under development.</p>
    </div>
  );
}
