import React from 'react';

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export enum Tone {
  Professional = 'Professional',
  Friendly = 'Friendly',
  Concise = 'Concise',
}