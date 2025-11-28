// ...existing code...
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Policy } from '../../models/policy.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sinister',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './sinister.component.html'
})
export class SinisterComponent implements OnInit {
  policyName = '';
  selectedSegment = 'automobile';
  policy: Policy | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const state = history.state as any;
    this.policy = state?.policy ?? null;
    if (this.policy) {
      this.policyName = this.policy.name ?? '';
      const section = (this.policy.section || '').toLowerCase();
      if (section && section !== Policy.CAR.toLowerCase()) {
        this.selectedSegment = 'variousRisks';
      } else {
        this.selectedSegment = 'automobile';
      }
    }
  }
}