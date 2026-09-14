import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SheriaChatWidget } from '../sheria-chat-widget/sheria-chat-widget';

@Component({
  selector: 'app-sheria-landing',
  standalone: true,
  imports: [CommonModule, SheriaChatWidget],
  templateUrl: './sheria-landing.html',
  styleUrl: './sheria-landing.scss'
})
export class SheriaLanding {
  areas = [
    {
      title: 'Land & Property',
      body: 'The difference between village, general, and reserved land, and what a Certificate of Customary Right of Occupancy actually gives you.'
    },
    {
      title: 'Employment',
      body: 'Notice periods, unpaid wages, and unfair termination under the Employment and Labour Relations Act.'
    },
    {
      title: 'Tenancy',
      body: 'How much notice a landlord owes you, deposit rules, and the legal steps required before an eviction.'
    },
    {
      title: 'Consumer Rights',
      body: "Refunds, warranties, and where to file a complaint when a business won't make things right."
    },
    {
      title: 'Family Law',
      body: "The basics of marriage, inheritance, and child maintenance across Tanzania's marriage laws."
    },
    {
      title: 'Police Encounters',
      body: "What to expect, and what you're entitled to, during a stop, search, or arrest."
    }
  ];

  steps = [
    {
      title: 'Ask in your own words',
      body: 'Type a question or pick a topic — Swahili or English, no legal jargon required.'
    },
    {
      title: 'Get a grounded answer',
      body: 'Sheria AI explains the relevant law in plain language, not a wall of statute text.'
    },
    {
      title: 'Know your next step',
      body: "Every answer tells you when it's time to speak with a licensed advocate."
    }
  ];
}
